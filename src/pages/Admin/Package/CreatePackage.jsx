import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
    createPackage,
    getAllCategoriesCms,
    getAllVehiclesCms,
    getAllHelisCms,
} from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/SideBar/SideBar";
import "./CreatePackage.css";

const CreatePackage = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [helis, setHelis] = useState([]);

    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [selectedHelis, setSelectedHelis] = useState([]);

    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        duration: "",
        price: "",
        image: null,
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
        fetchCategories();
        fetchVehicles();
        fetchHelis();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await getAllCategoriesCms();

            if (response.data?.status) {
                const activeCategories = (response.data.data || []).filter(
                    (category) => category.status === "ACTIVE"
                );

                setCategories(activeCategories);
            }
        } catch (error) {
            console.error("Category fetch error:", error);
        }
    };

    const fetchVehicles = async () => {
        try {
            const response = await getAllVehiclesCms();

            if (response.data?.status) {
                const activeVehicles = (response.data.data || []).filter(
                    (vehicle) => vehicle.status === "ACTIVE"
                );

                setVehicles(activeVehicles);
            }
        } catch (error) {
            console.error("Vehicle fetch error:", error);
        }
    };

    const fetchHelis = async () => {
        try {
            const response = await getAllHelisCms();

            if (response.data?.status) {
                const activeHelis = (response.data.data || []).filter(
                    (heli) => heli.status === "ACTIVE"
                );

                setHelis(activeHelis);
            }
        } catch (error) {
            console.error("Heli fetch error:", error);
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
        const { name, value, type, checked } = e.target;

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
            [name]: type === "checkbox" ? checked : value,
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

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setFormData((prev) => ({
            ...prev,
            image: file,
        }));

        setImagePreview(URL.createObjectURL(file));
    };

    const handleVehicleSelect = (vehicle) => {
        const exists = selectedVehicles.some(
            (item) => item.vehicle_id === vehicle.id
        );

        if (exists) {
            setSelectedVehicles((prev) =>
                prev.filter(
                    (item) => item.vehicle_id !== vehicle.id
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

    const handleVehicleIncludedChange = (vehicleId, included) => {
        setSelectedVehicles((prev) =>
            prev.map((item) =>
                item.vehicle_id === vehicleId
                    ? {
                          ...item,
                          included,
                          additional_price: included
                              ? 0
                              : item.additional_price,
                      }
                    : item
            )
        );
    };

    const handleVehiclePriceChange = (vehicleId, price) => {
        setSelectedVehicles((prev) =>
            prev.map((item) =>
                item.vehicle_id === vehicleId
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
            (item) => item.heli_id === heli.id
        );

        if (exists) {
            setSelectedHelis((prev) =>
                prev.filter(
                    (item) => item.heli_id !== heli.id
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

    const handleHeliIncludedChange = (heliId, included) => {
        setSelectedHelis((prev) =>
            prev.map((item) =>
                item.heli_id === heliId
                    ? {
                          ...item,
                          included,
                          additional_price: included
                              ? 0
                              : item.additional_price,
                      }
                    : item
            )
        );
    };

    const handleHeliPriceChange = (heliId, price) => {
        setSelectedHelis((prev) =>
            prev.map((item) =>
                item.heli_id === heliId
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
            !formData.image ||
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

        data.append("title", formData.title.trim());
        data.append("slug", formData.slug.trim());
        data.append("duration", formData.duration.trim());
        data.append("price", formData.price);
        data.append("image", formData.image);
        data.append("category_id", formData.category_id);
        data.append(
            "is_featured",
            formData.is_featured ? "1" : "0"
        );
        data.append("min_people", formData.min_people);

        if (formData.max_people) {
            data.append("max_people", formData.max_people);
        }

        if (formData.difficulty) {
            data.append("difficulty", formData.difficulty);
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

        selectedVehicles.forEach((vehicle, index) => {
            data.append(
                `vehicles[${index}][vehicle_id]`,
                vehicle.vehicle_id
            );

            data.append(
                `vehicles[${index}][included]`,
                vehicle.included ? "1" : "0"
            );

            data.append(
                `vehicles[${index}][additional_price]`,
                vehicle.included
                    ? "0"
                    : vehicle.additional_price || "0"
            );
        });

        selectedHelis.forEach((heli, index) => {
            data.append(
                `helis[${index}][heli_id]`,
                heli.heli_id
            );

            data.append(
                `helis[${index}][included]`,
                heli.included ? "1" : "0"
            );

            data.append(
                `helis[${index}][additional_price]`,
                heli.included
                    ? "0"
                    : heli.additional_price || "0"
            );
        });

        try {
            setSaving(true);

            const response = await createPackage(data);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Package Created",
                    text:
                        response.data?.message ||
                        "Package created successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/packages");
            }
        } catch (error) {
            console.error("Package create error:", error);

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create package.";

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(validationErrors)[0];

                if (Array.isArray(firstError)) {
                    errorMessage = firstError[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: errorMessage,
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="create-package-page">

                        <div className="create-package-header">
                            <div>
                                <h1>Create Package</h1>
                                <p>
                                    Add a new travel or adventure package.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="package-back-button"
                                onClick={() =>
                                    navigate("/packages")
                                }
                            >
                                Back to Packages
                            </button>
                        </div>

                        <form
                            className="create-package-form"
                            onSubmit={handleSubmit}
                        >

                            {/* BASIC INFORMATION */}

                            <div className="package-form-card">
                                <div className="package-form-card-header">
                                    <h2>Basic Information</h2>
                                    <p>
                                        Enter the main details of the package.
                                    </p>
                                </div>

                                <div className="package-form-body">
                                    <div className="package-form-grid">

                                        <div className="package-form-group">
                                            <label>
                                                Title
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="Enter package title"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="package-form-group">
                                            <label>
                                                Slug
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="slug"
                                                value={formData.slug}
                                                onChange={handleChange}
                                                placeholder="package-slug"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="package-form-group">
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
                                                onChange={handleChange}
                                                disabled={saving}
                                            >
                                                <option value="">
                                                    Select category
                                                </option>

                                                {categories.map(
                                                    (category) => (
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

                                        <div className="package-form-group">
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
                                                onChange={handleChange}
                                                placeholder="e.g. 7 Days / 6 Nights"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="package-form-group">
                                            <label>
                                                Price
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="Enter package price"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="package-form-group">
                                            <label>Location</label>

                                            <input
                                                type="text"
                                                name="location"
                                                value={
                                                    formData.location
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. Everest Region"
                                                disabled={saving}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>


                            {/* ADVENTURE DETAILS */}

                            <div className="package-form-card">
                                <div className="package-form-card-header">
                                    <h2>Adventure Details</h2>
                                    <p>
                                        Configure difficulty, category and group size.
                                    </p>
                                </div>

                                <div className="package-form-body">
                                    <div className="package-form-grid">

                                        <div className="package-form-group">
                                            <label>Difficulty</label>

                                            <select
                                                name="difficulty"
                                                value={
                                                    formData.difficulty
                                                }
                                                onChange={handleChange}
                                                disabled={saving}
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

                                        <div className="package-form-group">
                                            <label>
                                                Adventure Category
                                            </label>

                                            <select
                                                name="adventure_category"
                                                value={
                                                    formData.adventure_category
                                                }
                                                onChange={handleChange}
                                                disabled={saving}
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

                                        <div className="package-form-group">
                                            <label>Intensity</label>

                                            <input
                                                type="text"
                                                name="intensity"
                                                value={
                                                    formData.intensity
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. High"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="package-form-group">
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
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="package-form-group">
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
                                                onChange={handleChange}
                                                placeholder="Optional"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="package-featured-group">
                                            <div>
                                                <label>
                                                    Featured Package
                                                </label>
                                                <p>
                                                    Display this package as featured.
                                                </p>
                                            </div>

                                            <label className="package-switch">
                                                <input
                                                    type="checkbox"
                                                    name="is_featured"
                                                    checked={
                                                        formData.is_featured
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    disabled={saving}
                                                />

                                                <span className="package-slider"></span>
                                            </label>
                                        </div>

                                    </div>
                                </div>
                            </div>


                            {/* IMAGE */}

                            <div className="package-form-card">
                                <div className="package-form-card-header">
                                    <h2>Package Image</h2>
                                    <p>
                                        JPG, JPEG, PNG or WEBP. Maximum 5 MB.
                                    </p>
                                </div>

                                <div className="package-form-body">
                                    <div className="package-image-section">

                                        <div className="package-image-upload">
                                            <label>
                                                Package Image
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={
                                                    handleImageChange
                                                }
                                                disabled={saving}
                                            />
                                        </div>

                                        {imagePreview && (
                                            <div className="package-image-preview">
                                                <img
                                                    src={imagePreview}
                                                    alt="Package preview"
                                                />
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>


                            {/* VEHICLES */}

                            <div className="package-form-card">
                                <div className="package-form-card-header">
                                    <h2>Vehicles</h2>
                                    <p>
                                        Select vehicles available for this package.
                                    </p>
                                </div>

                                <div className="package-form-body">

                                    {vehicles.length === 0 ? (
                                        <p className="package-empty-option">
                                            No active vehicles available.
                                        </p>
                                    ) : (
                                        <div className="package-option-list">

                                            {vehicles.map((vehicle) => {
                                                const selected =
                                                    selectedVehicles.find(
                                                        (item) =>
                                                            item.vehicle_id ===
                                                            vehicle.id
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            vehicle.id
                                                        }
                                                        className={`package-option-item ${
                                                            selected
                                                                ? "package-option-selected"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div className="package-option-main">

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
                                                            <div className="package-option-settings">

                                                                <label className="package-included-checkbox">
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

                                                                    Included in package
                                                                </label>

                                                                {!selected.included && (
                                                                    <div className="package-additional-price">
                                                                        <label>
                                                                            Additional Price
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
                                                                            placeholder="0"
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
                                            })}

                                        </div>
                                    )}

                                </div>
                            </div>


                            {/* HELICOPTERS */}

                            <div className="package-form-card">
                                <div className="package-form-card-header">
                                    <h2>Helicopters</h2>
                                    <p>
                                        Select helicopters available for this package.
                                    </p>
                                </div>

                                <div className="package-form-body">

                                    {helis.length === 0 ? (
                                        <p className="package-empty-option">
                                            No active helicopters available.
                                        </p>
                                    ) : (
                                        <div className="package-option-list">

                                            {helis.map((heli) => {
                                                const selected =
                                                    selectedHelis.find(
                                                        (item) =>
                                                            item.heli_id ===
                                                            heli.id
                                                    );

                                                return (
                                                    <div
                                                        key={heli.id}
                                                        className={`package-option-item ${
                                                            selected
                                                                ? "package-option-selected"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div className="package-option-main">

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
                                                            <div className="package-option-settings">

                                                                <label className="package-included-checkbox">
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

                                                                    Included in package
                                                                </label>

                                                                {!selected.included && (
                                                                    <div className="package-additional-price">
                                                                        <label>
                                                                            Additional Price
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
                                                                            placeholder="0"
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
                                            })}

                                        </div>
                                    )}

                                </div>
                            </div>


                            {/* DESCRIPTION */}

                            <div className="package-form-card">
                                <div className="package-form-card-header">
                                    <h2>Description</h2>
                                    <p>
                                        Add detailed information about the package.
                                    </p>
                                </div>

                                <div className="package-form-body">
                                    <div className="package-form-group">

                                        <label>Description</label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description
                                            }
                                            onChange={handleChange}
                                            placeholder="Enter package description..."
                                            rows="7"
                                            disabled={saving}
                                        />

                                    </div>
                                </div>
                            </div>


                            {/* ACTIONS */}

                            <div className="package-form-actions">

                                <button
                                    type="button"
                                    className="package-cancel-button"
                                    onClick={() =>
                                        navigate("/packages")
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="package-submit-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Package"}
                                </button>

                            </div>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreatePackage;