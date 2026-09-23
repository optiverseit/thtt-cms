import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
    getPackageById,
    updatePackage,
    getAllCategoriesCms,
    getAllVehiclesCms,
    getAllHelisCms,
} from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./EditPackage.css";

const EditPackage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [categories, setCategories] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [helis, setHelis] = useState([]);

    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [selectedHelis, setSelectedHelis] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [imagePreview, setImagePreview] = useState(null);
    const [newImage, setNewImage] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        duration: "",
        price: "",
        category_id: "",
        is_featured: false,
        difficulty: "",
        adventure_category: "",
        intensity: "",
        min_people: 1,
        max_people: "",
        description: "",
        location: "",
    });

    useEffect(() => {
        loadPageData();
    }, [id]);

const loadPageData = async () => {
    try {
        setLoading(true);

        const [
            packageResponse,
            categoryResponse,
            vehicleResponse,
            heliResponse,
        ] = await Promise.all([
            getPackageById(id),
            getAllCategoriesCms(),
            getAllVehiclesCms(),
            getAllHelisCms(),
        ]);

        // Categories
        if (categoryResponse.data?.status) {
            const categoryList =
                categoryResponse.data?.data?.data || [];

            setCategories(
                categoryList.filter(
                    (category) => category.status === "ACTIVE"
                )
            );
        }

        // Vehicles
        if (vehicleResponse.data?.status) {
            const vehicleList =
                vehicleResponse.data?.data?.data || [];

            setVehicles(
                vehicleList.filter(
                    (vehicle) => vehicle.status === "ACTIVE"
                )
            );
        }

        // Helicopters
        if (heliResponse.data?.status) {
            const heliList =
                heliResponse.data?.data?.data || [];

            setHelis(
                heliList.filter(
                    (heli) => heli.status === "ACTIVE"
                )
            );
        }

        // Single package response
        const packageItem = packageResponse.data?.data;

        if (!packageItem) {
            await Swal.fire({
                icon: "error",
                title: "Package Not Found",
                text: "The requested package could not be found.",
                confirmButtonColor: "#351255",
            });

            navigate("/packages");
            return;
        }

        setFormData({
            title: packageItem.title || "",
            slug: packageItem.slug || "",
            duration: packageItem.duration || "",
            price: packageItem.price || "",
            category_id: packageItem.category_id || "",
            is_featured:
                packageItem.is_featured === true ||
                packageItem.is_featured === 1 ||
                packageItem.is_featured === "1",
            difficulty: packageItem.difficulty || "",
            adventure_category:
                packageItem.adventure_category || "",
            intensity: packageItem.intensity || "",
            min_people: packageItem.min_people || 1,
            max_people: packageItem.max_people || "",
            description: packageItem.description || "",
            location: packageItem.location || "",
        });

        setImagePreview(packageItem.image || null);

        // Existing vehicles linked with package
        const existingVehicles =
            packageItem.package_vehicles ||
            packageItem.packageVehicles ||
            [];

        setSelectedVehicles(
            existingVehicles.map((item) => ({
                vehicle_id:
                    item.vehicle_id ||
                    item.vehicle?.id,
                included:
                    item.included === true ||
                    item.included === 1 ||
                    item.included === "1",
                additional_price:
                    item.additional_price || 0,
            }))
        );

        // Existing helicopters linked with package
        const existingHelis =
            packageItem.package_helis ||
            packageItem.packageHelis ||
            [];

        setSelectedHelis(
            existingHelis.map((item) => ({
                heli_id:
                    item.heli_id ||
                    item.heli?.id,
                included:
                    item.included === true ||
                    item.included === 1 ||
                    item.included === "1",
                additional_price:
                    item.additional_price || 0,
            }))
        );

    } catch (error) {
        console.error("Package load error:", error);

        await Swal.fire({
            icon: "error",
            title: "Failed",
            text:
                error.response?.data?.message ||
                "Unable to load package.",
            confirmButtonColor: "#351255",
        });

        navigate("/packages");
    } finally {
        setLoading(false);
    }
};

    const generateSlug = (value) => {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        if (name === "title") {
            setFormData((prev) => ({
                ...prev,
                title: value,
                slug: generateSlug(value),
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Image",
                text: "Only JPG, JPEG, PNG and WEBP images are allowed.",
                confirmButtonColor: "#351255",
            });

            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: "warning",
                title: "Image Too Large",
                text: "Image size must not exceed 5 MB.",
                confirmButtonColor: "#351255",
            });

            e.target.value = "";
            return;
        }

        if (
            imagePreview &&
            imagePreview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(imagePreview);
        }

        setNewImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleVehicleSelect = (vehicle) => {
        const exists = selectedVehicles.some(
            (item) =>
                Number(item.vehicle_id) ===
                Number(vehicle.id)
        );

        if (exists) {
            setSelectedVehicles((prev) =>
                prev.filter(
                    (item) =>
                        Number(item.vehicle_id) !==
                        Number(vehicle.id)
                )
            );
        } else {
            setSelectedVehicles((prev) => [
                ...prev,
                {
                    vehicle_id: vehicle.id,
                    included: true,
                    additional_price: 0,
                },
            ]);
        }
    };

    const handleVehicleIncludedChange = (
        vehicleId,
        included
    ) => {
        setSelectedVehicles((prev) =>
            prev.map((item) =>
                Number(item.vehicle_id) ===
                    Number(vehicleId)
                    ? {
                        ...item,
                        included,
                        additional_price:
                            included
                                ? 0
                                : item.additional_price,
                    }
                    : item
            )
        );
    };

    const handleVehiclePriceChange = (
        vehicleId,
        price
    ) => {
        setSelectedVehicles((prev) =>
            prev.map((item) =>
                Number(item.vehicle_id) ===
                    Number(vehicleId)
                    ? {
                        ...item,
                        additional_price: price,
                    }
                    : item
            )
        );
    };

    const handleHeliSelect = (heli) => {
        const exists = selectedHelis.some(
            (item) =>
                Number(item.heli_id) ===
                Number(heli.id)
        );

        if (exists) {
            setSelectedHelis((prev) =>
                prev.filter(
                    (item) =>
                        Number(item.heli_id) !==
                        Number(heli.id)
                )
            );
        } else {
            setSelectedHelis((prev) => [
                ...prev,
                {
                    heli_id: heli.id,
                    included: true,
                    additional_price: 0,
                },
            ]);
        }
    };

    const handleHeliIncludedChange = (
        heliId,
        included
    ) => {
        setSelectedHelis((prev) =>
            prev.map((item) =>
                Number(item.heli_id) ===
                    Number(heliId)
                    ? {
                        ...item,
                        included,
                        additional_price:
                            included
                                ? 0
                                : item.additional_price,
                    }
                    : item
            )
        );
    };

    const handleHeliPriceChange = (
        heliId,
        price
    ) => {
        setSelectedHelis((prev) =>
            prev.map((item) =>
                Number(item.heli_id) ===
                    Number(heliId)
                    ? {
                        ...item,
                        additional_price: price,
                    }
                    : item
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title.trim() ||
            !formData.slug.trim() ||
            !formData.duration.trim() ||
            !formData.price ||
            !formData.category_id ||
            !formData.min_people
        ) {
            Swal.fire({
                icon: "warning",
                title: "Required Fields",
                text: "Please fill in all required fields.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (
            formData.max_people &&
            Number(formData.max_people) <
            Number(formData.min_people)
        ) {
            Swal.fire({
                icon: "warning",
                title: "Invalid People Range",
                text: "Maximum people cannot be less than minimum people.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = new FormData();

        data.append(
            "title",
            formData.title.trim()
        );

        data.append(
            "slug",
            formData.slug.trim()
        );

        data.append(
            "duration",
            formData.duration.trim()
        );

        data.append(
            "price",
            formData.price
        );

        data.append(
            "category_id",
            formData.category_id
        );

        data.append(
            "is_featured",
            formData.is_featured ? "1" : "0"
        );

        data.append(
            "min_people",
            formData.min_people
        );

        if (newImage) {
            data.append(
                "image",
                newImage
            );
        }

        if (formData.max_people) {
            data.append(
                "max_people",
                formData.max_people
            );
        }

        if (formData.difficulty) {
            data.append(
                "difficulty",
                formData.difficulty
            );
        }

        if (formData.adventure_category) {
            data.append(
                "adventure_category",
                formData.adventure_category
            );
        }

        if (formData.intensity.trim()) {
            data.append(
                "intensity",
                formData.intensity.trim()
            );
        }

        if (formData.location.trim()) {
            data.append(
                "location",
                formData.location.trim()
            );
        }

        if (formData.description.trim()) {
            data.append(
                "description",
                formData.description.trim()
            );
        }

        selectedVehicles.forEach(
            (vehicle, index) => {
                data.append(
                    `vehicles[${index}][vehicle_id]`,
                    vehicle.vehicle_id
                );

                data.append(
                    `vehicles[${index}][included]`,
                    vehicle.included
                        ? "1"
                        : "0"
                );

                data.append(
                    `vehicles[${index}][additional_price]`,
                    vehicle.included
                        ? "0"
                        : vehicle.additional_price ||
                        "0"
                );
            }
        );

        selectedHelis.forEach(
            (heli, index) => {
                data.append(
                    `helis[${index}][heli_id]`,
                    heli.heli_id
                );

                data.append(
                    `helis[${index}][included]`,
                    heli.included
                        ? "1"
                        : "0"
                );

                data.append(
                    `helis[${index}][additional_price]`,
                    heli.included
                        ? "0"
                        : heli.additional_price ||
                        "0"
                );
            }
        );

        try {
            setSaving(true);

            const response =
                await updatePackage(id, data);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Package Updated",
                    text:
                        response.data?.message ||
                        "Package updated successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/packages");
            }
        } catch (error) {
            console.error(
                "Package update error:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update package.";

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )[0];

                if (Array.isArray(firstError)) {
                    errorMessage =
                        firstError[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: errorMessage,
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />

                <div className="dashboard-main">
                    <Navbar />

                    <main className="dashboard-content">
                        <div className="edit-package-loading">
                            <div className="edit-package-loader"></div>
                            <p>Loading package...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="edit-package-page">

                        <div className="edit-package-header">
                            <div>
                                <h1>Edit Package</h1>
                                <p>
                                    Update package information,
                                    vehicles and helicopters.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="edit-package-back-button"
                                onClick={() =>
                                    navigate("/packages")
                                }
                            >
                                Back to Packages
                            </button>
                        </div>

                        <form
                            className="edit-package-form"
                            onSubmit={handleSubmit}
                        >

                            {/* BASIC INFORMATION */}

                            <div className="edit-package-card">
                                <div className="edit-package-card-header">
                                    <h2>
                                        Basic Information
                                    </h2>

                                    <p>
                                        Update the main package
                                        information.
                                    </p>
                                </div>

                                <div className="edit-package-card-body">
                                    <div className="edit-package-grid">

                                        <div className="edit-package-group">
                                            <label>
                                                Title
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="title"
                                                value={
                                                    formData.title
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Slug
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="slug"
                                                value={
                                                    formData.slug
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Category
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                name="category_id"
                                                value={
                                                    formData.category_id
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                <option value="">
                                                    Select category
                                                </option>

                                                {categories.map(
                                                    (
                                                        category
                                                    ) => (
                                                        <option
                                                            key={
                                                                category.id
                                                            }
                                                            value={
                                                                category.id
                                                            }
                                                        >
                                                            {
                                                                category.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Duration
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="duration"
                                                value={
                                                    formData.duration
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Price
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="price"
                                                value={
                                                    formData.price
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Location
                                            </label>

                                            <input
                                                type="text"
                                                name="location"
                                                value={
                                                    formData.location
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>


                            {/* ADVENTURE DETAILS */}

                            <div className="edit-package-card">
                                <div className="edit-package-card-header">
                                    <h2>
                                        Adventure Details
                                    </h2>

                                    <p>
                                        Update difficulty,
                                        category and group size.
                                    </p>
                                </div>

                                <div className="edit-package-card-body">
                                    <div className="edit-package-grid">

                                        <div className="edit-package-group">
                                            <label>
                                                Difficulty
                                            </label>

                                            <select
                                                name="difficulty"
                                                value={
                                                    formData.difficulty
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                <option value="">
                                                    Select difficulty
                                                </option>

                                                <option value="Easy">
                                                    Easy
                                                </option>

                                                <option value="Moderate">
                                                    Moderate
                                                </option>

                                                <option value="Hard">
                                                    Hard
                                                </option>

                                                <option value="Extreme">
                                                    Extreme
                                                </option>
                                            </select>
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Adventure
                                                Category
                                            </label>

                                            <select
                                                name="adventure_category"
                                                value={
                                                    formData.adventure_category
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                <option value="">
                                                    Select category
                                                </option>

                                                <option value="Air">
                                                    Air
                                                </option>

                                                <option value="Water">
                                                    Water
                                                </option>

                                                <option value="Land">
                                                    Land
                                                </option>
                                            </select>
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Intensity
                                            </label>

                                            <input
                                                type="text"
                                                name="intensity"
                                                value={
                                                    formData.intensity
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Minimum People
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                name="min_people"
                                                min="1"
                                                value={
                                                    formData.min_people
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="edit-package-group">
                                            <label>
                                                Maximum People
                                            </label>

                                            <input
                                                type="number"
                                                name="max_people"
                                                min="1"
                                                value={
                                                    formData.max_people
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="edit-package-featured">
                                            <div>
                                                <label>
                                                    Featured Package
                                                </label>

                                                <p>
                                                    Display this
                                                    package as
                                                    featured.
                                                </p>
                                            </div>

                                            <label className="edit-package-switch">
                                                <input
                                                    type="checkbox"
                                                    name="is_featured"
                                                    checked={
                                                        formData.is_featured
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                />

                                                <span className="edit-package-slider"></span>
                                            </label>
                                        </div>

                                    </div>
                                </div>
                            </div>


                            {/* IMAGE */}

                            <div className="edit-package-card">
                                <div className="edit-package-card-header">
                                    <h2>
                                        Package Image
                                    </h2>

                                    <p>
                                        Leave unchanged to keep
                                        the existing image.
                                    </p>
                                </div>

                                <div className="edit-package-card-body">
                                    <div className="edit-package-image-section">

                                        <div className="edit-package-image-upload">
                                            <label>
                                                Change Image
                                            </label>

                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={
                                                    handleImageChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <span>
                                                JPG, JPEG, PNG or
                                                WEBP. Maximum 5 MB.
                                            </span>
                                        </div>

                                        {imagePreview && (
                                            <div className="edit-package-image-preview">
                                                <img
                                                    src={
                                                        imagePreview
                                                    }
                                                    alt="Package"
                                                />

                                                <p>
                                                    {newImage
                                                        ? "New Image"
                                                        : "Current Image"}
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>


                            {/* VEHICLES */}

                            <div className="edit-package-card">
                                <div className="edit-package-card-header">
                                    <h2>Vehicles</h2>

                                    <p>
                                        Select vehicles available
                                        for this package.
                                    </p>
                                </div>

                                <div className="edit-package-card-body">

                                    {vehicles.length ===
                                        0 ? (
                                        <p className="edit-package-empty">
                                            No active vehicles
                                            available.
                                        </p>
                                    ) : (
                                        <div className="edit-package-option-list">

                                            {vehicles.map(
                                                (vehicle) => {
                                                    const selected =
                                                        selectedVehicles.find(
                                                            (
                                                                item
                                                            ) =>
                                                                Number(
                                                                    item.vehicle_id
                                                                ) ===
                                                                Number(
                                                                    vehicle.id
                                                                )
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                vehicle.id
                                                            }
                                                            className={`edit-package-option ${selected
                                                                ? "edit-package-option-selected"
                                                                : ""
                                                                }`}
                                                        >
                                                            <div className="edit-package-option-main">

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        !!selected
                                                                    }
                                                                    onChange={() =>
                                                                        handleVehicleSelect(
                                                                            vehicle
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                />

                                                                <div>
                                                                    <h4>
                                                                        {
                                                                            vehicle.type
                                                                        }
                                                                    </h4>

                                                                    <p>
                                                                        Capacity:{" "}
                                                                        {
                                                                            vehicle.capacity
                                                                        }
                                                                    </p>
                                                                </div>

                                                            </div>

                                                            {selected && (
                                                                <div className="edit-package-option-settings">

                                                                    <label className="edit-package-included">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                selected.included
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleVehicleIncludedChange(
                                                                                    vehicle.id,
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                saving
                                                                            }
                                                                        />

                                                                        Included
                                                                        in
                                                                        package
                                                                    </label>

                                                                    {!selected.included && (
                                                                        <div className="edit-package-price">
                                                                            <label>
                                                                                Additional
                                                                                Price
                                                                            </label>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    selected.additional_price
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleVehiclePriceChange(
                                                                                        vehicle.id,
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    saving
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}

                                                                </div>
                                                            )}

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                </div>
                            </div>


                            {/* HELICOPTERS */}

                            <div className="edit-package-card">
                                <div className="edit-package-card-header">
                                    <h2>
                                        Helicopters
                                    </h2>

                                    <p>
                                        Select helicopters
                                        available for this
                                        package.
                                    </p>
                                </div>

                                <div className="edit-package-card-body">

                                    {helis.length === 0 ? (
                                        <p className="edit-package-empty">
                                            No active helicopters
                                            available.
                                        </p>
                                    ) : (
                                        <div className="edit-package-option-list">

                                            {helis.map(
                                                (heli) => {
                                                    const selected =
                                                        selectedHelis.find(
                                                            (
                                                                item
                                                            ) =>
                                                                Number(
                                                                    item.heli_id
                                                                ) ===
                                                                Number(
                                                                    heli.id
                                                                )
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                heli.id
                                                            }
                                                            className={`edit-package-option ${selected
                                                                ? "edit-package-option-selected"
                                                                : ""
                                                                }`}
                                                        >
                                                            <div className="edit-package-option-main">

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        !!selected
                                                                    }
                                                                    onChange={() =>
                                                                        handleHeliSelect(
                                                                            heli
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                />

                                                                <div>
                                                                    <h4>
                                                                        {
                                                                            heli.type
                                                                        }
                                                                    </h4>

                                                                    <p>
                                                                        Capacity:{" "}
                                                                        {
                                                                            heli.capacity
                                                                        }
                                                                    </p>
                                                                </div>

                                                            </div>

                                                            {selected && (
                                                                <div className="edit-package-option-settings">

                                                                    <label className="edit-package-included">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                selected.included
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleHeliIncludedChange(
                                                                                    heli.id,
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                saving
                                                                            }
                                                                        />

                                                                        Included
                                                                        in
                                                                        package
                                                                    </label>

                                                                    {!selected.included && (
                                                                        <div className="edit-package-price">
                                                                            <label>
                                                                                Additional
                                                                                Price
                                                                            </label>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    selected.additional_price
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleHeliPriceChange(
                                                                                        heli.id,
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    saving
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}

                                                                </div>
                                                            )}

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                </div>
                            </div>


                            {/* DESCRIPTION */}

                            <div className="edit-package-card">
                                <div className="edit-package-card-header">
                                    <h2>
                                        Description
                                    </h2>

                                    <p>
                                        Update detailed package
                                        information.
                                    </p>
                                </div>

                                <div className="edit-package-card-body">
                                    <div className="edit-package-group">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            rows="7"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>
                                </div>
                            </div>


                            {/* ACTIONS */}

                            <div className="edit-package-actions">

                                <button
                                    type="button"
                                    className="edit-package-cancel"
                                    onClick={() =>
                                        navigate(
                                            "/packages"
                                        )
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="edit-package-submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Update Package"}
                                </button>

                            </div>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditPackage;