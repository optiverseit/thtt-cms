import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { createVehicle } from "../../../api/BackendApi";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";

import "./CreateVehicle.css";

const CreateVehicle = () => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | MULTIPLE IMAGE PREVIEWS
    |--------------------------------------------------------------------------
    */

    const [imagePreviews, setImagePreviews] = useState([]);

    /*
    |--------------------------------------------------------------------------
    | FORM DATA
    |--------------------------------------------------------------------------
    */

    const [formData, setFormData] = useState({
        name: "",

        vehicle_type: "",
        fuel_type: "",
        trip_type: "",

        capacity: "",

        from_location: "",
        to_location: "",

        duration: "",

        bags_per_person: "",
        max_luggage: "",

        available_from: "",
        available_to: "",

        price: "",

        description: "",

        images: [],
    });

    /*
    |--------------------------------------------------------------------------
    | NORMAL INPUT CHANGE
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | MULTIPLE IMAGE CHANGE
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (e) => {
        const files = Array.from(
            e.target.files || []
        );

        if (files.length === 0) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        /*
        |--------------------------------------------------------------------------
        | VALIDATE EVERY IMAGE
        |--------------------------------------------------------------------------
        */

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    icon: "warning",
                    title: "Invalid Image",
                    text:
                        `"${file.name}" is not supported. ` +
                        "Only JPG, JPEG, PNG and WEBP images are allowed.",
                    confirmButtonColor: "#351255",
                });

                e.target.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: "warning",
                    title: "Image Too Large",
                    text:
                        `"${file.name}" exceeds the maximum ` +
                        "image size of 5 MB.",
                    confirmButtonColor: "#351255",
                });

                e.target.value = "";
                return;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | APPEND IMAGES
        |--------------------------------------------------------------------------
        */

        setFormData((prev) => ({
            ...prev,
            images: [
                ...prev.images,
                ...files,
            ],
        }));

        const previews = files.map(
            (file) =>
                URL.createObjectURL(file)
        );

        setImagePreviews((prev) => [
            ...prev,
            ...previews,
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESET FILE INPUT
        |--------------------------------------------------------------------------
        */

        e.target.value = "";
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE SELECTED IMAGE
    |--------------------------------------------------------------------------
    */

    const handleRemoveImage = (index) => {
        const previewToRemove =
            imagePreviews[index];

        if (
            previewToRemove &&
            previewToRemove.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                previewToRemove
            );
        }

        setFormData((prev) => ({
            ...prev,

            images: prev.images.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            ),
        }));

        setImagePreviews((prev) =>
            prev.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    const validateForm = () => {
        if (!formData.name.trim()) {
            return "Vehicle name is required.";
        }

        if (!formData.vehicle_type.trim()) {
            return "Vehicle type is required.";
        }

        if (!formData.fuel_type) {
            return "Fuel type is required.";
        }

        if (!formData.trip_type) {
            return "Trip type is required.";
        }

        if (
            !formData.capacity ||
            Number(formData.capacity) < 1
        ) {
            return "Capacity must be at least 1.";
        }

        if (!formData.from_location.trim()) {
            return "From location is required.";
        }

        if (!formData.to_location.trim()) {
            return "To location is required.";
        }

        if (
            formData.price === "" ||
            Number(formData.price) < 0
        ) {
            return "Please enter a valid price.";
        }

        if (
            formData.bags_per_person !== "" &&
            Number(formData.bags_per_person) < 0
        ) {
            return "Bags per person cannot be negative.";
        }

        if (
            formData.max_luggage !== "" &&
            Number(formData.max_luggage) < 0
        ) {
            return "Maximum luggage cannot be negative.";
        }

        if (
            formData.available_from &&
            formData.available_to &&
            formData.available_to <
                formData.available_from
        ) {
            return "Available To date cannot be before Available From date.";
        }

        return null;
    };

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {
            Swal.fire({
                icon: "warning",
                title: "Check Form",
                text: validationError,
                confirmButtonColor: "#351255",
            });

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE MULTIPART FORM DATA
        |--------------------------------------------------------------------------
        */

        const data = new FormData();

        data.append(
            "name",
            formData.name.trim()
        );

        data.append(
            "vehicle_type",
            formData.vehicle_type.trim()
        );

        data.append(
            "fuel_type",
            formData.fuel_type
        );

        data.append(
            "trip_type",
            formData.trip_type
        );

        data.append(
            "capacity",
            formData.capacity
        );

        data.append(
            "from_location",
            formData.from_location.trim()
        );

        data.append(
            "to_location",
            formData.to_location.trim()
        );

        data.append(
            "price",
            formData.price
        );

        /*
        |--------------------------------------------------------------------------
        | OPTIONAL FIELDS
        |--------------------------------------------------------------------------
        */

        if (formData.duration.trim()) {
            data.append(
                "duration",
                formData.duration.trim()
            );
        }

        if (
            formData.bags_per_person !== ""
        ) {
            data.append(
                "bags_per_person",
                formData.bags_per_person
            );
        }

        if (
            formData.max_luggage !== ""
        ) {
            data.append(
                "max_luggage",
                formData.max_luggage
            );
        }

        if (formData.available_from) {
            data.append(
                "available_from",
                formData.available_from
            );
        }

        if (formData.available_to) {
            data.append(
                "available_to",
                formData.available_to
            );
        }

        if (formData.description.trim()) {
            data.append(
                "description",
                formData.description.trim()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | MULTIPLE IMAGES
        |--------------------------------------------------------------------------
        */

        formData.images.forEach(
            (image) => {
                data.append(
                    "images[]",
                    image
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | Do NOT send remaining_seats.
        |
        | Backend should automatically create:
        |
        | remaining_seats = capacity
        |
        */

        try {
            setSaving(true);

            const response =
                await createVehicle(data);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Vehicle Created",
                    text:
                        response.data
                            ?.message ||
                        "Vehicle created successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                navigate("/vehicles");
            }
        } catch (error) {
            console.error(
                "Vehicle create error:",
                error
            );

            let errorMessage =
                error.response?.data
                    ?.message ||
                "Unable to create vehicle.";

            const validationErrors =
                error.response?.data
                    ?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )[0];

                if (
                    Array.isArray(
                        firstError
                    )
                ) {
                    errorMessage =
                        firstError[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Create Failed",
                text: errorMessage,
                confirmButtonColor:
                    "#351255",
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

                    <div className="create-vehicle-page">

                        {/* HEADER */}

                        <div className="create-vehicle-header">

                            <div>
                                <h1>
                                    Create Vehicle
                                </h1>

                                <p>
                                    Add a new vehicle
                                    for vehicle rental.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="create-vehicle-back-button"
                                onClick={() =>
                                    navigate(
                                        "/vehicles"
                                    )
                                }
                                disabled={saving}
                            >
                                Back to Vehicles
                            </button>

                        </div>

                        <form
                            className="create-vehicle-form"
                            onSubmit={handleSubmit}
                        >

                            {/* ================================================= */}
                            {/* VEHICLE INFORMATION */}
                            {/* ================================================= */}

                            <div className="create-vehicle-card">

                                <div className="create-vehicle-card-header">

                                    <h2>
                                        Vehicle Information
                                    </h2>

                                    <p>
                                        Enter the basic
                                        details of the
                                        vehicle.
                                    </p>

                                </div>

                                <div className="create-vehicle-card-body">

                                    <div className="create-vehicle-grid">

                                        {/* VEHICLE NAME */}

                                        <div className="create-vehicle-group">

                                            <label>
                                                Vehicle Name
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
                                                placeholder="e.g. Toyota Land Cruiser"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        {/* VEHICLE TYPE */}

                                        <div className="create-vehicle-group">

                                            <label>
                                                Vehicle Type
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                name="vehicle_type"
                                                value={
                                                    formData.vehicle_type
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 4WD SUV"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        {/* FUEL TYPE */}

                                        <div className="create-vehicle-group">

                                            <label>
                                                Fuel Type
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                name="fuel_type"
                                                value={
                                                    formData.fuel_type
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                <option value="">
                                                    Select Fuel Type
                                                </option>

                                                <option value="PETROL">
                                                    Petrol
                                                </option>

                                                <option value="DIESEL">
                                                    Diesel
                                                </option>

                                                <option value="ELECTRIC">
                                                    Electric
                                                </option>

                                                <option value="HYBRID">
                                                    Hybrid
                                                </option>
                                            </select>

                                        </div>

                                        {/* TRIP TYPE */}

                                        <div className="create-vehicle-group">

                                            <label>
                                                Trip Type
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                name="trip_type"
                                                value={
                                                    formData.trip_type
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                <option value="">
                                                    Select Trip Type
                                                </option>

                                                <option value="ONE_WAY">
                                                    One Way
                                                </option>

                                                <option value="ROUND_TRIP">
                                                    Round Trip
                                                </option>
                                            </select>

                                        </div>

                                        {/* CAPACITY */}

                                        <div className="create-vehicle-group">

                                            <label>
                                                Total Seats
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
                                                placeholder="e.g. 10"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        {/* DURATION */}

                                        <div className="create-vehicle-group">

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
                                                placeholder="e.g. 1 Day"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        {/* FROM */}

                                        <div className="create-vehicle-group">

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

                                        {/* TO */}

                                        <div className="create-vehicle-group">

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
                                                placeholder="e.g. Pokhara"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        {/* PRICE */}

                                        <div className="create-vehicle-group">

                                            <label>
                                                Price Per Person
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
                                                placeholder="e.g. 1200"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* ================================================= */}
                            {/* LUGGAGE */}
                            {/* ================================================= */}

                            <div className="create-vehicle-card">

                                <div className="create-vehicle-card-header">

                                    <h2>
                                        Luggage Information
                                    </h2>

                                    <p>
                                        Enter baggage and
                                        luggage allowance.
                                    </p>

                                </div>

                                <div className="create-vehicle-card-body">

                                    <div className="create-vehicle-grid">

                                        <div className="create-vehicle-group">

                                            <label>
                                                Bags Per Person
                                            </label>

                                            <input
                                                type="number"
                                                name="bags_per_person"
                                                min="0"
                                                value={
                                                    formData.bags_per_person
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 1"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        <div className="create-vehicle-group">

                                            <label>
                                                Max Luggage (kg)
                                            </label>

                                            <input
                                                type="number"
                                                name="max_luggage"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    formData.max_luggage
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 20"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* ================================================= */}
                            {/* AVAILABILITY */}
                            {/* ================================================= */}

                            <div className="create-vehicle-card">

                                <div className="create-vehicle-card-header">

                                    <h2>
                                        Vehicle Availability
                                    </h2>

                                    <p>
                                        Set the available
                                        rental date range.
                                    </p>

                                </div>

                                <div className="create-vehicle-card-body">

                                    <div className="create-vehicle-grid">

                                        <div className="create-vehicle-group">

                                            <label>
                                                Available From
                                            </label>

                                            <input
                                                type="date"
                                                name="available_from"
                                                value={
                                                    formData.available_from
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        <div className="create-vehicle-group">

                                            <label>
                                                Available To
                                            </label>

                                            <input
                                                type="date"
                                                name="available_to"
                                                value={
                                                    formData.available_to
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                min={
                                                    formData.available_from ||
                                                    undefined
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* ================================================= */}
                            {/* IMAGES */}
                            {/* ================================================= */}

                            <div className="create-vehicle-card">

                                <div className="create-vehicle-card-header">

                                    <h2>
                                        Vehicle Images
                                    </h2>

                                    <p>
                                        Upload images of
                                        the vehicle. This
                                        is optional.
                                    </p>

                                </div>

                                <div className="create-vehicle-card-body">

                                    <div className="create-vehicle-image-section">

                                        <div className="create-vehicle-image-upload">

                                            <label>
                                                Vehicle Images
                                            </label>

                                            <input
                                                type="file"
                                                multiple
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={
                                                    handleImageChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <span>
                                                JPG, JPEG,
                                                PNG or WEBP.
                                                Maximum 5 MB
                                                per image.
                                            </span>

                                        </div>

                                        {imagePreviews.length > 0 && (

                                            <div className="create-vehicle-images-preview-grid">

                                                {imagePreviews.map(
                                                    (
                                                        preview,
                                                        index
                                                    ) => (

                                                        <div
                                                            className="create-vehicle-image-preview"
                                                            key={
                                                                preview
                                                            }
                                                        >

                                                            <img
                                                                src={
                                                                    preview
                                                                }
                                                                alt={`Vehicle preview ${
                                                                    index +
                                                                    1
                                                                }`}
                                                            />

                                                            <p>
                                                                Image{" "}
                                                                {index +
                                                                    1}
                                                            </p>

                                                            <button
                                                                type="button"
                                                                className="create-vehicle-remove-image"
                                                                onClick={() =>
                                                                    handleRemoveImage(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving
                                                                }
                                                            >
                                                                Remove
                                                            </button>

                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* ================================================= */}
                            {/* DESCRIPTION */}
                            {/* ================================================= */}

                            <div className="create-vehicle-card">

                                <div className="create-vehicle-card-header">

                                    <h2>
                                        Description
                                    </h2>

                                    <p>
                                        Add additional
                                        information about
                                        the vehicle.
                                    </p>

                                </div>

                                <div className="create-vehicle-card-body">

                                    <div className="create-vehicle-group">

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
                                            placeholder="Enter vehicle description..."
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* ================================================= */}
                            {/* ACTIONS */}
                            {/* ================================================= */}

                            <div className="create-vehicle-actions">

                                <button
                                    type="button"
                                    className="create-vehicle-cancel"
                                    onClick={() =>
                                        navigate(
                                            "/vehicles"
                                        )
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="create-vehicle-submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Vehicle"}
                                </button>

                            </div>

                        </form>

                    </div>

                </main>

            </div>

        </div>
    );
};

export default CreateVehicle;