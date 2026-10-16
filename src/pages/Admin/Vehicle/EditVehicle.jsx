import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
    getVehicleById,
    updateVehicle,
} from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./EditVehicle.css";
const EditVehicle = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    /*
    |--------------------------------------------------------------------------
    | EXISTING + NEW IMAGES
    |--------------------------------------------------------------------------
    */
    const [existingImages, setExistingImages] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const imageInputRef = useRef(null);
    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */
    const [formData, setFormData] = useState({
        name: "",
        vehicle_type: "",
        fuel_type: "",
        trip_type: "",
        capacity: "",
        // remaining_seats: "",
        reserved_seats: "",
        routes: [{ from_location: "", to_location: "" }],
        duration: "",
        bags_per_person: "",
        max_luggage: "",
        available_from: "",
        available_to: "",
        price: "",
        description: "",
    });
    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE FOR HTML DATE INPUT
    |--------------------------------------------------------------------------
    */
    const formatDateForInput = (date) => {
        if (!date) return "";
        return String(date).split("T")[0];
    };
    /*
    |--------------------------------------------------------------------------
    | FETCH VEHICLE
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        fetchVehicle();
    }, [id]);
    const fetchVehicle = async () => {
        try {
            setLoading(true);
            const response = await getVehicleById(id);
            if (!response.data?.status || !response.data?.data) {
                await Swal.fire({
                    icon: "error",
                    title: "Vehicle Not Found",
                    text: "The requested vehicle could not be found.",
                    confirmButtonColor: "#351255",
                });
                navigate("/vehicles");
                return;
            }
            const vehicle = response.data.data;
            /*
            |--------------------------------------------------------------------------
            | SET FORM
            |--------------------------------------------------------------------------
            */
            setFormData({
                name: vehicle.name || "",
                vehicle_type:
                    vehicle.vehicle_type || "",
                fuel_type:
                    vehicle.fuel_type || "",
                trip_type:
                    vehicle.trip_type || "",
                capacity:
                    vehicle.capacity ?? "",
                // remaining_seats: vehicle.remaining_seats ?? "",
                reserved_seats: vehicle.reserved_seats ?? "",
                routes: Array.isArray(vehicle.routes) && vehicle.routes.length > 0
                    ? vehicle.routes.map((route) => ({
                        from_location: route.from_location || "",
                        to_location: route.to_location || "",
                    }))
                    : [{ from_location: "", to_location: "" }],
                duration:
                    vehicle.duration || "",
                bags_per_person:
                    vehicle.bags_per_person ?? "",
                max_luggage:
                    vehicle.max_luggage ?? "",
                available_from:
                    formatDateForInput(
                        vehicle.available_from
                    ),
                available_to:
                    formatDateForInput(
                        vehicle.available_to
                    ),
                price:
                    vehicle.price ?? "",
                description:
                    vehicle.description || "",
            });
            /*
            |--------------------------------------------------------------------------
            | EXISTING IMAGES
            |--------------------------------------------------------------------------
            */
            setRemovedImageIds([]);
            setExistingImages(
                Array.isArray(vehicle.images)
                    ? vehicle.images
                    : []
            );
        } catch (error) {
            console.error(
                "Vehicle fetch error:",
                error
            );
            await Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load vehicle.",
                confirmButtonColor: "#351255",
            });
            navigate("/vehicles");
        } finally {
            setLoading(false);
        }
    };
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
    // MULTIPLE ROUTES
    const handleRouteChange = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            routes: prev.routes.map((route, routeIndex) =>
                routeIndex === index ? { ...route, [field]: value } : route
            ),
        }));
    };
    const handleAddRoute = () => {
        setFormData((prev) => ({
            ...prev,
            routes: [...prev.routes, { from_location: "", to_location: "" }],
        }));
    };
    const handleRemoveRoute = (index) => {
        setFormData((prev) => ({
            ...prev,
            routes: prev.routes.filter((_, routeIndex) => routeIndex !== index),
        }));
    };
    /*
    |--------------------------------------------------------------------------
    | SELECT NEW IMAGES
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
        | VALIDATE EACH IMAGE
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
        | APPEND FILES
        |--------------------------------------------------------------------------
        */
        setNewImages((prev) => [
            ...prev,
            ...files,
        ]);
        const previews = files.map((file) =>
            URL.createObjectURL(file)
        );
        setNewImagePreviews((prev) => [
            ...prev,
            ...previews,
        ]);
        /*
        |--------------------------------------------------------------------------
        | RESET INPUT
        |--------------------------------------------------------------------------
        */
        e.target.value = "";
    };
    /*
    |--------------------------------------------------------------------------
    | REMOVE NEWLY SELECTED IMAGE
    |--------------------------------------------------------------------------
    */
    const handleRemoveExistingImage = (image) => {
        if (image.id == null) return;
        setRemovedImageIds((prev) => [...prev, image.id]);
        setExistingImages((prev) => prev.filter((item) => item.id !== image.id));
    };
    const handleRemoveNewImage = (index) => {
        const preview =
            newImagePreviews[index];
        if (
            preview &&
            preview.startsWith("blob:")
        ) {
            URL.revokeObjectURL(preview);
        }
        setNewImages((prev) =>
            prev.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            )
        );
        setNewImagePreviews((prev) =>
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
/*
        if (
            formData.remaining_seats === "" ||
            Number(formData.remaining_seats) < 0
        ) {
            return "Remaining seats cannot be negative.";
        }
        if (
            Number(formData.remaining_seats) >
            Number(formData.capacity)
        ) {
            return "Remaining seats cannot be greater than total seats.";
        }
*/
        if (formData.reserved_seats !== "" && (Number(formData.reserved_seats) < 0 || Number(formData.reserved_seats) > Number(formData.capacity) || !Number.isInteger(Number(formData.reserved_seats)))) {
            return "Reserved seats must be a whole number between 0 and capacity.";
        }
        if (formData.routes.length === 0) {
            return "At least one route is required.";
        }
        for (const [index, route] of formData.routes.entries()) {
            if (!route.from_location.trim()) {
                return `From location is required for route ${index + 1}.`;
            }
            if (!route.to_location.trim()) {
                return `To location is required for route ${index + 1}.`;
            }
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
        const reservedSeatsInput = e.currentTarget.elements.namedItem("reserved_seats");
        const reservedSeatsValue = reservedSeatsInput ? reservedSeatsInput.value : formData.reserved_seats;
        const data = new FormData();
        /*
        |--------------------------------------------------------------------------
        | REQUIRED DATA
        |--------------------------------------------------------------------------
        */
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
        /*
        data.append(
            "remaining_seats",
            formData.remaining_seats
        );
        */
        if (reservedSeatsValue !== "") {
            data.append("reserved_seats", reservedSeatsValue);
        }
        formData.routes.forEach((route, index) => {
            data.append(`routes[${index}][from_location]`, route.from_location.trim());
            data.append(`routes[${index}][to_location]`, route.to_location.trim());
        });
        data.append(
            "price",
            formData.price
        );
        /*
        |--------------------------------------------------------------------------
        | OPTIONAL DATA
        |--------------------------------------------------------------------------
        */
        if (formData.duration.trim()) {
            data.append(
                "duration",
                formData.duration.trim()
            );
        }
        if (formData.bags_per_person !== "") {
            data.append(
                "bags_per_person",
                formData.bags_per_person
            );
        }
        if (formData.max_luggage !== "") {
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
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | remaining_seats is intentionally NOT sent.
        |
        | Backend controls seat availability.
        |
        */
        /*
        |--------------------------------------------------------------------------
        | NEW IMAGES
        |--------------------------------------------------------------------------
        */
        removedImageIds.forEach((imageId) => data.append("deleted_image_ids[]", imageId));
        newImages.forEach((image) => {
            data.append(
                "images[]",
                image
            );
        });
        try {
            setSaving(true);
            const response =
                await updateVehicle(
                    id,
                    data
                );
            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Vehicle Updated",
                    text:
                        response.data?.message ||
                        "Vehicle updated successfully.",
                    confirmButtonColor: "#351255",
                });
                navigate("/vehicles");
            }
        } catch (error) {
            console.error(
                "Vehicle update error:",
                error
            );
            let errorMessage =
                error.response?.data?.message ||
                "Unable to update vehicle.";
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
    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */
    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <div className="dashboard-main">
                    <Navbar />
                    <main className="dashboard-content">
                        <div className="edit-vehicle-loading">
                            <div className="edit-vehicle-loader"></div>
                            <p>
                                Loading vehicle...
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }
    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="edit-vehicle-page">
                        {/* HEADER */}
                        <div className="edit-vehicle-header">
                            <div>
                                <h1>
                                    Edit Vehicle
                                </h1>
                                <p>
                                    Update vehicle
                                    information and
                                    images.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="edit-vehicle-back-button"
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
                            className="edit-vehicle-form"
                            onSubmit={handleSubmit}
                        >
                            {/* ================================================= */}
                            {/* VEHICLE INFORMATION */}
                            {/* ================================================= */}
                            <div className="edit-vehicle-card">
                                <div className="edit-vehicle-card-header">
                                    <h2>
                                        Vehicle Information
                                    </h2>
                                    <p>
                                        Update the basic
                                        details of the
                                        vehicle.
                                    </p>
                                </div>
                                <div className="edit-vehicle-card-body">
                                    <div className="edit-vehicle-grid">
                                        {/* NAME */}
                                        <div className="edit-vehicle-group">
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
                                        <div className="edit-vehicle-group">
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
                                        <div className="edit-vehicle-group">
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
                                        <div className="edit-vehicle-group">
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
                                        <div className="edit-vehicle-group">
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
                                        {/* REMAINING SEATS */}
                                        {/*
                                        <div className="edit-vehicle-group">
                                            <label>Remaining Seats</label>
                                            <input
                                                type="number"
                                                name="remaining_seats"
                                                min="0"
                                                max={formData.capacity || undefined}
                                                value={formData.remaining_seats}
                                                onChange={handleChange}
                                                placeholder="e.g. 8"
                                                disabled={saving}
                                            />
                                        </div>
                                        */}
                                        {/* RESERVED SEATS */}
                                        <div className="edit-vehicle-group">
                                            <label>Reserved Seats</label>
                                            <input type="number" name="reserved_seats" min="0" max={formData.capacity || undefined} value={formData.reserved_seats} onChange={handleChange} placeholder="e.g. 8" disabled={saving} />
                                        </div>
                                        {/* MULTIPLE ROUTES */}
                                        <div className="edit-vehicle-routes">
                                            <div className="edit-vehicle-section-top">
                                                <label className="edit-vehicle-section-label">
                                                    Vehicle Routes <span className="required">*</span>
                                                </label>
                                                <button type="button" className="edit-vehicle-add-route" onClick={handleAddRoute} disabled={saving}>
                                                    + Add Route
                                                </button>
                                            </div>
                                            {formData.routes.map((route, index) => (
                                                <div className="edit-vehicle-route-card" key={index}>
                                                    <div className="edit-vehicle-route-card-top">
                                                        <span className="edit-vehicle-route-number">Route {index + 1}</span>
                                                        <button type="button" className="edit-vehicle-remove-route" onClick={() => handleRemoveRoute(index)} disabled={saving || formData.routes.length === 1}>Remove</button>
                                                    </div>
                                                    <div className="edit-vehicle-route-row">
                                                        <div className="edit-vehicle-group">
                                                            <label>From Location <span className="required">*</span></label>
                                                            <input type="text" value={route.from_location} onChange={(e) => handleRouteChange(index, "from_location", e.target.value)} placeholder="e.g. Kathmandu" disabled={saving} />
                                                        </div>
                                                        <div className="edit-vehicle-group">
                                                            <label>To Location <span className="required">*</span></label>
                                                            <input type="text" value={route.to_location} onChange={(e) => handleRouteChange(index, "to_location", e.target.value)} placeholder="e.g. Pokhara" disabled={saving} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* DURATION */}
                                        <div className="edit-vehicle-group">
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
                                        {/* PRICE */}
                                        <div className="edit-vehicle-group">
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
                            {/* LUGGAGE INFORMATION */}
                            {/* ================================================= */}
                            <div className="edit-vehicle-card">
                                <div className="edit-vehicle-card-header">
                                    <h2>
                                        Luggage Information
                                    </h2>
                                    <p>
                                        Update baggage and
                                        luggage allowance.
                                    </p>
                                </div>
                                <div className="edit-vehicle-card-body">
                                    <div className="edit-vehicle-grid">
                                        {/* BAGS PER PERSON */}
                                        <div className="edit-vehicle-group">
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
                                        {/* MAX LUGGAGE */}
                                        <div className="edit-vehicle-group">
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
                            <div className="edit-vehicle-card">
                                <div className="edit-vehicle-card-header">
                                    <h2>
                                        Vehicle Availability
                                    </h2>
                                    <p>
                                        Set the available
                                        rental date range.
                                    </p>
                                </div>
                                <div className="edit-vehicle-card-body">
                                    <div className="edit-vehicle-grid">
                                        {/* AVAILABLE FROM */}
                                        <div className="edit-vehicle-group">
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
                                        {/* AVAILABLE TO */}
                                        <div className="edit-vehicle-group">
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
                            {/* VEHICLE IMAGES */}
                            {/* ================================================= */}
                            <div className="edit-vehicle-card">
                                <div className="edit-vehicle-card-header">
                                    <h2>
                                        Vehicle Images
                                    </h2>
                                    <p>
                                        View current images
                                        or add additional
                                        images.
                                    </p>
                                </div>
                                <div className="edit-vehicle-card-body">
                                    <div className="edit-vehicle-image-section">
                                        <div className="edit-vehicle-image-toolbar">
                                            <div>
                                                <label className="edit-vehicle-section-label">Vehicle Images</label>
                                                <p>JPG, JPEG, PNG or WEBP. Maximum 5 MB per image.</p>
                                            </div>
                                            <input ref={imageInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={handleImageChange} disabled={saving} className="edit-vehicle-hidden-file" />
                                            <button type="button" className="edit-vehicle-add-image" onClick={() => imageInputRef.current?.click()} disabled={saving}>
                                                + Add Image
                                            </button>
                                        </div>
                                        {existingImages.length > 0 && (
                                            <div className="edit-vehicle-existing-images">
                                                <label className="edit-vehicle-section-label">Current Images</label>
                                                <div className="edit-vehicle-images-preview-grid">
                                                    {existingImages.map((image, index) => {
                                                        const imageUrl = image.image || image.image_url;
                                                        if (!imageUrl) return null;
                                                        return (
                                                            <div className="edit-vehicle-image-tile" key={image.id || index}>
                                                                <img src={imageUrl} alt={`Vehicle ${index + 1}`} />
                                                                <button type="button" className="edit-vehicle-remove-image" onClick={() => handleRemoveExistingImage(image)} disabled={saving || image.id == null}>Remove</button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {newImagePreviews.length > 0 && (
                                            <div className="edit-vehicle-new-images">
                                                <label className="edit-vehicle-section-label">New Images</label>
                                                <div className="edit-vehicle-images-preview-grid">
                                                    {newImagePreviews.map((preview, index) => (
                                                        <div className="edit-vehicle-image-tile" key={preview}>
                                                            <img src={preview} alt={`New vehicle ${index + 1}`} />
                                                            <button type="button" className="edit-vehicle-remove-image" onClick={() => handleRemoveNewImage(index)} disabled={saving}>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* ================================================= */}
                            {/* DESCRIPTION */}
                            {/* ================================================= */}
                            <div className="edit-vehicle-card">
                                <div className="edit-vehicle-card-header">
                                    <h2>
                                        Description
                                    </h2>
                                    <p>
                                        Update additional
                                        information about
                                        the vehicle.
                                    </p>
                                </div>
                                <div className="edit-vehicle-card-body">
                                    <div className="edit-vehicle-group">
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
                            <div className="edit-vehicle-actions">
                                <button
                                    type="button"
                                    className="edit-vehicle-cancel"
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
                                    className="edit-vehicle-submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Update Vehicle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default EditVehicle;
