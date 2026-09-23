import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
    getHeliById,
    updateHeli,
} from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./EditHeli.css";

const EditHeli = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [imagePreview, setImagePreview] = useState(null);
    const [newImage, setNewImage] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        capacity: "",
        from_location: "",
        to_location: "",
        duration: "",
        price: "",
        description: "",
    });

    useEffect(() => {
        fetchHeli();
    }, [id]);

    const fetchHeli = async () => {
        try {
            setLoading(true);

            const response = await getHeliById(id);

            if (response.data?.status) {
                const heli = response.data.data 

                if (!heli) {
                    await Swal.fire({
                        icon: "error",
                        title: "Helicopter Not Found",
                        text: "The requested helicopter could not be found.",
                        confirmButtonColor: "#351255",
                    });

                    navigate("/helis");
                    return;
                }

                setFormData({
                    name: heli.name || "",
                    capacity: heli.capacity || "",
                    from_location: heli.from_location || "",
                    to_location: heli.to_location || "",
                    duration: heli.duration || "",
                    price: heli.price || "",
                    description: heli.description || "",
                });

                setImagePreview(heli.image || null);
            }
        } catch (error) {
            console.error("Helicopter fetch error:", error);

            await Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load helicopter.",
                confirmButtonColor: "#351255",
            });

            navigate("/helis");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.capacity ||
            !formData.from_location.trim() ||
            !formData.to_location.trim() ||
            formData.price === ""
        ) {
            Swal.fire({
                icon: "warning",
                title: "Required Fields",
                text: "Please fill in all required fields.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (Number(formData.capacity) < 1) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Capacity",
                text: "Capacity must be at least 1.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (Number(formData.price) < 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Price",
                text: "Price cannot be negative.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = new FormData();

        data.append("name", formData.name.trim());
        data.append("capacity", formData.capacity);
        data.append(
            "from_location",
            formData.from_location.trim()
        );
        data.append(
            "to_location",
            formData.to_location.trim()
        );
        data.append("price", formData.price);

        if (formData.duration.trim()) {
            data.append(
                "duration",
                formData.duration.trim()
            );
        }

        if (formData.description.trim()) {
            data.append(
                "description",
                formData.description.trim()
            );
        }

        // Only send image if admin selected a new one
        if (newImage) {
            data.append("image", newImage);
        }

        try {
            setSaving(true);

            const response = await updateHeli(id, data);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Helicopter Updated",
                    text:
                        response.data?.message ||
                        "Helicopter updated successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/helis");
            }
        } catch (error) {
            console.error(
                "Helicopter update error:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update helicopter.";

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
                        <div className="edit-heli-loading">
                            <div className="edit-heli-loader"></div>
                            <p>Loading helicopter...</p>
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
                    <div className="edit-heli-page">

                        <div className="edit-heli-header">
                            <div>
                                <h1>Edit Helicopter</h1>
                                <p>
                                    Update helicopter information
                                    and image.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="edit-heli-back-button"
                                onClick={() =>
                                    navigate("/helis")
                                }
                            >
                                Back to Helicopters
                            </button>
                        </div>

                        <form
                            className="edit-heli-form"
                            onSubmit={handleSubmit}
                        >

                            {/* HELICOPTER INFORMATION */}

                            <div className="edit-heli-card">
                                <div className="edit-heli-card-header">
                                    <h2>
                                        Helicopter Information
                                    </h2>

                                    <p>
                                        Update the basic details of
                                        the helicopter.
                                    </p>
                                </div>

                                <div className="edit-heli-card-body">
                                    <div className="edit-heli-grid">

                                        <div className="edit-heli-group">
                                            <label>
                                                Helicopter Name
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="edit-heli-group">
                                            <label>
                                                Capacity
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                name="capacity"
                                                min="1"
                                                value={
                                                    formData.capacity
                                                }
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="edit-heli-group">
                                            <label>
                                                From Location
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="from_location"
                                                value={
                                                    formData.from_location
                                                }
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="edit-heli-group">
                                            <label>
                                                To Location
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="to_location"
                                                value={
                                                    formData.to_location
                                                }
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="edit-heli-group">
                                            <label>
                                                Duration
                                            </label>

                                            <input
                                                type="text"
                                                name="duration"
                                                value={
                                                    formData.duration
                                                }
                                                onChange={handleChange}
                                                placeholder="e.g. 3 Hours"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="edit-heli-group">
                                            <label>
                                                Price
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                name="price"
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={handleChange}
                                                disabled={saving}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>


                            {/* IMAGE */}

                            <div className="edit-heli-card">
                                <div className="edit-heli-card-header">
                                    <h2>
                                        Helicopter Image
                                    </h2>

                                    <p>
                                        Select a new image only if
                                        you want to replace the
                                        current image.
                                    </p>
                                </div>

                                <div className="edit-heli-card-body">
                                    <div className="edit-heli-image-section">

                                        <div className="edit-heli-image-upload">
                                            <label>
                                                Change Image
                                            </label>

                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={
                                                    handleImageChange
                                                }
                                                disabled={saving}
                                            />

                                            <span>
                                                JPG, JPEG, PNG or
                                                WEBP. Maximum 5 MB.
                                            </span>
                                        </div>

                                        {imagePreview && (
                                            <div className="edit-heli-image-preview">
                                                <img
                                                    src={
                                                        imagePreview
                                                    }
                                                    alt="Helicopter"
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


                            {/* DESCRIPTION */}

                            <div className="edit-heli-card">
                                <div className="edit-heli-card-header">
                                    <h2>Description</h2>

                                    <p>
                                        Update additional information
                                        about the helicopter.
                                    </p>
                                </div>

                                <div className="edit-heli-card-body">
                                    <div className="edit-heli-group">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description
                                            }
                                            onChange={handleChange}
                                            rows="7"
                                            placeholder="Enter helicopter description..."
                                            disabled={saving}
                                        />

                                    </div>
                                </div>
                            </div>


                            {/* ACTIONS */}

                            <div className="edit-heli-actions">

                                <button
                                    type="button"
                                    className="edit-heli-cancel"
                                    onClick={() =>
                                        navigate("/helis")
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="edit-heli-submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Update Helicopter"}
                                </button>

                            </div>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditHeli;