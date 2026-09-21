import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createHeli } from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/SideBar/SideBar";
import "./CreateHeli.css";

const CreateHeli = () => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        capacity: "",
        from_location: "",
        to_location: "",
        duration: "",
        price: "",
        description: "",
        image: null,
    });

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

        setFormData((prev) => ({
            ...prev,
            image: file,
        }));

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

        if (formData.image) {
            data.append("image", formData.image);
        }

        try {
            setSaving(true);

            const response = await createHeli(data);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Helicopter Created",
                    text:
                        response.data?.message ||
                        "Helicopter created successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/helis");
            }
        } catch (error) {
            console.error(
                "Helicopter create error:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create helicopter.";

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
                title: "Create Failed",
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
                    <div className="create-heli-page">

                        <div className="create-heli-header">
                            <div>
                                <h1>Create Helicopter</h1>
                                <p>
                                    Add a new helicopter for
                                    travel packages.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="create-heli-back-button"
                                onClick={() =>
                                    navigate("/helis")
                                }
                            >
                                Back to Helicopters
                            </button>
                        </div>

                        <form
                            className="create-heli-form"
                            onSubmit={handleSubmit}
                        >

                            {/* BASIC INFORMATION */}

                            <div className="create-heli-card">
                                <div className="create-heli-card-header">
                                    <h2>
                                        Helicopter Information
                                    </h2>

                                    <p>
                                        Enter the basic details of
                                        the helicopter.
                                    </p>
                                </div>

                                <div className="create-heli-card-body">
                                    <div className="create-heli-grid">

                                        <div className="create-heli-group">
                                            <label>
                                                Helicopter Name
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. Airbus H125"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="create-heli-group">
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
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 5"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="create-heli-group">
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
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. Kathmandu"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="create-heli-group">
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
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. Everest Base Camp"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="create-heli-group">
                                            <label>
                                                Duration
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
                                                placeholder="e.g. 3 Hours"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="create-heli-group">
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
                                                value={
                                                    formData.price
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 150000"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>


                            {/* IMAGE */}

                            <div className="create-heli-card">
                                <div className="create-heli-card-header">
                                    <h2>
                                        Helicopter Image
                                    </h2>

                                    <p>
                                        Upload an image of the
                                        helicopter. This is optional.
                                    </p>
                                </div>

                                <div className="create-heli-card-body">
                                    <div className="create-heli-image-section">

                                        <div className="create-heli-image-upload">
                                            <label>
                                                Helicopter Image
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
                                            <div className="create-heli-image-preview">
                                                <img
                                                    src={
                                                        imagePreview
                                                    }
                                                    alt="Helicopter preview"
                                                />

                                                <p>
                                                    Image Preview
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>


                            {/* DESCRIPTION */}

                            <div className="create-heli-card">
                                <div className="create-heli-card-header">
                                    <h2>
                                        Description
                                    </h2>

                                    <p>
                                        Add additional information
                                        about the helicopter.
                                    </p>
                                </div>

                                <div className="create-heli-card-body">
                                    <div className="create-heli-group">

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
                                            placeholder="Enter helicopter description..."
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>
                                </div>
                            </div>


                            {/* ACTIONS */}

                            <div className="create-heli-actions">

                                <button
                                    type="button"
                                    className="create-heli-cancel"
                                    onClick={() =>
                                        navigate("/helis")
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="create-heli-submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Helicopter"}
                                </button>

                            </div>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateHeli;