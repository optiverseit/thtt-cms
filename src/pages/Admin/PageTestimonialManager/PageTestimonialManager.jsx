import { useEffect, useState } from "react";
import { FaPen, FaTrash, FaTimes, FaStar, FaCheckCircle, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

import {
    getPageTestimonialsCms,
    createPageTestimonials,
    updatePageTestimonial,
    changePageTestimonialStatus,
    deletePageTestimonial
} from "../../../api/BackendApi";

import "./PageTestimonialManager.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

// Values must match PageTestimonial::PAGES in the backend
const pageOptions = [
    { label: "Air Ticket", value: "AIR_TICKET" },
    { label: "Tours", value: "TOURS" },
    { label: "Adventure Activities", value: "ADVENTURE_ACTIVITIES" },
    { label: "Trekking", value: "TREKKING" },
    { label: "Hotel Booking", value: "HOTEL_BOOKING" },
    { label: "Visa Services", value: "VISA_SERVICES" },
    { label: "Travel Insurance", value: "TRAVEL_INSURANCE" },
    { label: "Vehicle Rental", value: "VEHICLE_RENTAL" },
    { label: "Heli Services", value: "HELI_SERVICES" },
    { label: "Online Shram", value: "ONLINE_SHRAM" },
    { label: "Documentation", value: "DOCUMENTATION" }
];

const getPageLabel = (value) =>
    pageOptions.find((opt) => opt.value === value)?.label || value;

const createEmptyEntry = () => ({
    traveler_name: "",
    country: "",
    is_verified: false,
    rating: 5,
    review: "",
    review_date: "",
    display_order: "",
    status: "ACTIVE",
    image: null,        // File object
    preview: null,      // Object URL for new image
    existingImage: null // URL from server (edit mode)
});

const getErrorMessage = (error, fallback) => {
    const errors = error.response?.data?.errors;
    if (errors) {
        const first = Object.values(errors).flat()[0];
        if (first) return first;
    }
    return error.response?.data?.message || fallback;
};

const StarPicker = ({ value, onChange }) => (
    <div className="star-picker">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                type="button"
                key={star}
                className={`star-btn ${star <= value ? "star-filled" : ""}`}
                onClick={() => onChange(star)}
                title={`${star} star${star > 1 ? "s" : ""}`}
            >
                <FaStar />
            </button>
        ))}
    </div>
);

const PageTestimonialManager = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [pageName, setPageName] = useState("");
    const [entries, setEntries] = useState([createEmptyEntry()]);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await getPageTestimonialsCms(page);

            if (response.data?.status) {
                setTestimonials(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
                setTotalItems(response.data.data.total || 0);
            }
        } catch (error) {
            console.error("Testimonial fetch error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to fetch testimonials.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, [page]);

    /* ---------- Modal open / close ---------- */

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCurrentId(null);
        setPageName("");
        setEntries([createEmptyEntry()]);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setIsEditMode(true);
        setCurrentId(item.id);
        setPageName(item.page_name);
        setEntries([
            {
                traveler_name: item.traveler_name || "",
                country: item.country || "",
                is_verified: !!item.is_verified,
                rating: item.rating || 5,
                review: item.review || "",
                review_date: item.review_date ? item.review_date.substring(0, 10) : "",
                display_order: item.display_order ?? "",
                status: item.status || "ACTIVE",
                image: null,
                preview: null,
                existingImage: item.profile_image || null
            }
        ]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    /* ---------- Entry helpers ---------- */

    const updateEntry = (index, field, value) => {
        setEntries((prev) =>
            prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
        );
    };

    const handleAddEntry = () => {
        setEntries((prev) => [...prev, createEmptyEntry()]);
    };

    const handleRemoveEntry = (index) => {
        setEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setEntries((prev) =>
            prev.map((entry, i) => {
                if (i !== index) return entry;
                if (entry.preview) URL.revokeObjectURL(entry.preview);
                return { ...entry, image: file, preview: URL.createObjectURL(file) };
            })
        );
    };

    const handleRemoveNewImage = (index) => {
        setEntries((prev) =>
            prev.map((entry, i) => {
                if (i !== index) return entry;
                if (entry.preview) URL.revokeObjectURL(entry.preview);
                return { ...entry, image: null, preview: null };
            })
        );
    };

    /* ---------- Submit ---------- */

    const validate = () => {
        if (!pageName) {
            Swal.fire({ icon: "warning", title: "Warning", text: "Please select a page.", confirmButtonColor: "#351255" });
            return false;
        }
        for (let i = 0; i < entries.length; i++) {
            const label = entries.length > 1 ? ` (Testimonial #${i + 1})` : "";
            if (!entries[i].traveler_name.trim()) {
                Swal.fire({ icon: "warning", title: "Warning", text: `Traveler name is required${label}.`, confirmButtonColor: "#351255" });
                return false;
            }
            if (!entries[i].review.trim()) {
                Swal.fire({ icon: "warning", title: "Warning", text: `Review is required${label}.`, confirmButtonColor: "#351255" });
                return false;
            }
        }
        return true;
    };

    const appendEntryFields = (formData, entry, prefix) => {
        const key = (field) => (prefix ? `${prefix}[${field}]` : field);

        formData.append(key("traveler_name"), entry.traveler_name.trim());
        formData.append(key("country"), entry.country.trim());
        formData.append(key("is_verified"), entry.is_verified ? "1" : "0");
        formData.append(key("rating"), entry.rating);
        formData.append(key("review"), entry.review.trim());
        formData.append(key("review_date"), entry.review_date || "");
        formData.append(key("status"), entry.status);
        if (entry.display_order !== "" && entry.display_order !== null) {
            formData.append(key("display_order"), entry.display_order);
        }
        if (entry.image) {
            formData.append(key("profile_image"), entry.image);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const formData = new FormData();
        formData.append("page_name", pageName);

        if (isEditMode) {
            appendEntryFields(formData, entries[0], "");
        } else {
            entries.forEach((entry, i) => appendEntryFields(formData, entry, `testimonials[${i}]`));
        }

        try {
            setSubmitting(true);
            const response = isEditMode
                ? await updatePageTestimonial(currentId, formData)
                : await createPageTestimonials(formData);

            if (response.data?.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.message || "Operation successful.",
                    confirmButtonColor: "#351255",
                });
                setIsModalOpen(false);
                fetchTestimonials();
            }
        } catch (error) {
            console.error("Submit error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: getErrorMessage(error, "Validation or server error occurred."),
                confirmButtonColor: "#351255",
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- Status / Delete ---------- */

    const handleStatusChange = async (item) => {
        const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const result = await Swal.fire({
            icon: "warning",
            title: "Change Status?",
            text: `Change status to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes",
            confirmButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {
            const response = await changePageTestimonialStatus(item.id);
            if (response.data?.status) {
                fetchTestimonials();
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Failed", text: "Unable to update status.", confirmButtonColor: "#351255" });
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Testimonial?",
            text: `Delete the testimonial from "${item.traveler_name}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deletePageTestimonial(item.id);
            if (response.data?.status) {
                Swal.fire({ icon: "success", title: "Deleted", text: "Testimonial deleted successfully.", confirmButtonColor: "#351255" });
                // If the last item on a page was deleted, go back one page
                if (testimonials.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchTestimonials();
                }
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Failed", text: "Unable to delete testimonial.", confirmButtonColor: "#351255" });
        }
    };

    const renderStars = (rating) => (
        <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className={star <= rating ? "star-on" : "star-off"} />
            ))}
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="category-page">
                        <div className="category-header">
                            <div>
                                <h1>Page Testimonials</h1>
                                <p>Manage traveler testimonials shown on service pages.</p>
                            </div>
                            <button className="create-category-button" onClick={handleOpenCreateModal}>
                                <span>+</span> Create Testimonial
                            </button>
                        </div>

                        <div className="category-table-card">
                            <div className="category-table-header">
                                <div>
                                    <h2>Testimonials List</h2>
                                    <p>{totalItems} {totalItems === 1 ? "testimonial" : "testimonials"}</p>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="category-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Traveler</th>
                                            <th>Page</th>
                                            <th>Rating</th>
                                            <th>Review</th>
                                            <th>Order</th>
                                            <th>Status</th>
                                            <th className="action-column">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="table-message">
                                                    <div className="category-loader"></div>
                                                    Loading testimonials...
                                                </td>
                                            </tr>
                                        ) : testimonials.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="table-message">No testimonials found.</td>
                                            </tr>
                                        ) : (
                                            testimonials.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{(page - 1) * 10 + index + 1}</td>
                                                    <td>
                                                        <div className="traveler-cell">
                                                            {item.profile_image ? (
                                                                <img
                                                                    src={item.profile_image}
                                                                    alt={item.traveler_name}
                                                                    className="traveler-avatar"
                                                                />
                                                            ) : (
                                                                <div className="traveler-avatar traveler-avatar-fallback">
                                                                    {item.traveler_name?.charAt(0)?.toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="category-name">
                                                                    {item.traveler_name}
                                                                    {item.is_verified && (
                                                                        <FaCheckCircle className="verified-icon" title="Verified" />
                                                                    )}
                                                                </span>
                                                                {item.country && (
                                                                    <small className="traveler-country">{item.country}</small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge-count">{getPageLabel(item.page_name)}</span>
                                                    </td>
                                                    <td>{renderStars(item.rating)}</td>
                                                    <td>
                                                        <span className="review-preview" title={item.review}>
                                                            {item.review}
                                                        </span>
                                                    </td>
                                                    <td>{item.display_order}</td>
                                                    <td>
                                                        <span
                                                            className={`status-badge ${
                                                                item.status === "ACTIVE" ? "status-active" : "status-inactive"
                                                            }`}
                                                            onClick={() => handleStatusChange(item)}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="action-column">
                                                        <div className="action-buttons">
                                                            <button className="edit-button" onClick={() => handleOpenEditModal(item)}>
                                                                <FaPen />
                                                            </button>
                                                            <button className="delete-button" onClick={() => handleDelete(item)}>
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card modal-card-lg">
                        <div className="modal-header">
                            <h2>{isEditMode ? "Edit Testimonial" : "Create Testimonials"}</h2>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Select Page</label>
                                <select
                                    value={pageName}
                                    onChange={(e) => setPageName(e.target.value)}
                                    required
                                    className="modal-select"
                                >
                                    <option value="" disabled>-- Select Page --</option>
                                    {pageOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {entries.map((entry, index) => (
                                <div className="testimonial-entry" key={index}>
                                    {!isEditMode && (
                                        <div className="testimonial-entry-header">
                                            <span>Testimonial #{index + 1}</span>
                                            {entries.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="entry-remove-btn"
                                                    onClick={() => handleRemoveEntry(index)}
                                                >
                                                    <FaTrash /> Remove
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Traveler Name *</label>
                                            <input
                                                type="text"
                                                value={entry.traveler_name}
                                                onChange={(e) => updateEntry(index, "traveler_name", e.target.value)}
                                                placeholder="e.g. John Smith"
                                                maxLength={255}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Country</label>
                                            <input
                                                type="text"
                                                value={entry.country}
                                                onChange={(e) => updateEntry(index, "country", e.target.value)}
                                                placeholder="e.g. Australia"
                                                maxLength={100}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Rating *</label>
                                        <StarPicker
                                            value={entry.rating}
                                            onChange={(val) => updateEntry(index, "rating", val)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Review *</label>
                                        <textarea
                                            rows={4}
                                            value={entry.review}
                                            onChange={(e) => updateEntry(index, "review", e.target.value)}
                                            placeholder="Write the traveler's review..."
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Review Date</label>
                                            <input
                                                type="date"
                                                value={entry.review_date}
                                                onChange={(e) => updateEntry(index, "review_date", e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Display Order</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={entry.display_order}
                                                onChange={(e) => updateEntry(index, "display_order", e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select
                                                value={entry.status}
                                                onChange={(e) => updateEntry(index, "status", e.target.value)}
                                                className="modal-select"
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="INACTIVE">INACTIVE</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Verified Traveler</label>
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={entry.is_verified}
                                                    onChange={(e) => updateEntry(index, "is_verified", e.target.checked)}
                                                />
                                                <span>Mark as verified</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Profile Image</label>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={(e) => handleImageChange(index, e)}
                                        />
                                        <small className="form-hint">JPG, PNG or WEBP, max 5MB.</small>

                                        {(entry.preview || entry.existingImage) && (
                                            <div className="existing-images-grid profile-preview-grid">
                                                <div className="image-preview-item">
                                                    <img
                                                        src={entry.preview || entry.existingImage}
                                                        alt="Profile"
                                                    />
                                                    {entry.preview && (
                                                        <button
                                                            type="button"
                                                            className="remove-img-badge"
                                                            onClick={() => handleRemoveNewImage(index)}
                                                            title="Remove selected image"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    )}
                                                </div>
                                                <span className="preview-caption">
                                                    {entry.preview ? "New image (will replace current)" : "Current image"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {!isEditMode && (
                                <button type="button" className="add-entry-btn" onClick={handleAddEntry}>
                                    <FaPlus /> Add Another Testimonial
                                </button>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="create-category-button" disabled={submitting}>
                                    {submitting
                                        ? "Saving..."
                                        : isEditMode
                                        ? "Update Testimonial"
                                        : `Create ${entries.length > 1 ? `${entries.length} Testimonials` : "Testimonial"}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageTestimonialManager;
