import { useEffect, useState } from "react";
import { FaPen, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

import {
    getPagesCms,
    createPage,
    updatePage,
    changePageStatus,
    deletePage
} from "../../../api/BackendApi";

import "./PageManager.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const PageManager = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form State
    const [name, setName] = useState("");
    const [newImages, setNewImages] = useState([]); // File objects
    const [previewImages, setPreviewImages] = useState([]); // Object URLs for live preview
    const [existingImages, setExistingImages] = useState([]); // Array from server {id, image}
    const [removeImageIds, setRemoveImageIds] = useState([]); // IDs to delete
    const [submitting, setSubmitting] = useState(false);

    // Available Page and Service Options from Navbar
    const pageOptions = [
        { label: "Home", value: "home" },
        { label: "About", value: "about" },
        { label: "Services", value: "services" },
        { label: "Packages", value: "packages" },
        { label: "Blog", value: "blog" },
        { label: "Gallery", value: "gallery" },
        { label: "Travel Guide", value: "travel-guide" },
        { label: "Air Ticket", value: "air-ticket" },
        { label: "Tours", value: "tours" },
        { label: "Adventure Activities", value: "adventure-activities" },
        { label: "Trekking", value: "trekking" },
        { label: "Hotel Booking", value: "hotel-booking" },
        { label: "Visa Services", value: "visa-services" },
        { label: "Travel Insurance", value: "travel-insurance" },
        { label: "Vehicle Rental", value: "vehicle-rental" },
        { label: "Heli Services", value: "heli-services" },
        { label: "Online Shram", value: "online-shram" },
        { label: "Documentation", value: "documentation" }
    ];

    const fetchPages = async () => {
        try {
            setLoading(true);
            const response = await getPagesCms(page);

            if (response.data?.status) {
                setPages(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
                setTotalItems(response.data.data.total || 0);
            }
        } catch (error) {
            console.error("Page fetch error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to fetch pages.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, [page]);

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCurrentId(null);
        setName("");
        setNewImages([]);
        setPreviewImages([]);
        setExistingImages([]);
        setRemoveImageIds([]);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (pageData) => {
        setIsEditMode(true);
        setCurrentId(pageData.id);
        setName(pageData.name);
        setNewImages([]);
        setPreviewImages([]);
        setExistingImages(pageData.background_images || []);
        setRemoveImageIds([]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Handle selecting multiple files and creating preview URLs
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Append new files to existing selected new files (optional, or replace)
        const updatedFiles = [...newImages, ...files];
        setNewImages(updatedFiles);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviews]);
    };

    // Remove a newly selected preview image before submit
    const handleRemoveNewImage = (index) => {
        const updatedFiles = newImages.filter((_, i) => i !== index);
        const updatedPreviews = previewImages.filter((_, i) => i !== index);
        
        setNewImages(updatedFiles);
        setPreviewImages(updatedPreviews);
    };

    const handleRemoveExistingImage = (imageId) => {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
        setRemoveImageIds([...removeImageIds, imageId]);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            Swal.fire({ icon: "warning", title: "Warning", text: "Please select a page name.", confirmButtonColor: "#351255" });
            return;
        }

        const formData = new FormData();
        formData.append("name", name);

        for (let i = 0; i < newImages.length; i++) {
            formData.append("images[]", newImages[i]);
        }

        if (isEditMode) {
            for (let i = 0; i < removeImageIds.length; i++) {
                formData.append("remove_image_ids[]", removeImageIds[i]);
            }
        }

        try {
            setSubmitting(true);
            let response;

            if (isEditMode) {
                response = await updatePage(currentId, formData);
            } else {
                response = await createPage(formData);
            }

            if (response.data?.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.message || "Operation successful.",
                    confirmButtonColor: "#351255",
                });
                setIsModalOpen(false);
                fetchPages();
            }
        } catch (error) {
            console.error("Submit error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Validation or server error occurred.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (pageData) => {
        const newStatus = pageData.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
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
            const response = await changePageStatus(pageData.id);
            if (response.data?.status) {
                fetchPages();
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Failed", text: "Unable to update status." });
        }
    };

    const handleDelete = async (pageData) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Page?",
            text: `Delete "${pageData.name}" and all its background images?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deletePage(pageData.id);
            if (response.data?.status) {
                Swal.fire({ icon: "success", title: "Deleted", text: "Page deleted successfully.", confirmButtonColor: "#351255" });
                fetchPages();
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Failed", text: "Unable to delete page." });
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="category-page">
                        <div className="category-header">
                            <div>
                                <h1>Page Background Images</h1>
                                <p>Manage background banner images for website pages.</p>
                            </div>
                            <button className="create-category-button" onClick={handleOpenCreateModal}>
                                <span>+</span> Create Page Image
                            </button>
                        </div>

                        <div className="category-table-card">
                            <div className="category-table-header">
                                <div>
                                    <h2>Pages List</h2>
                                    <p>{totalItems} {totalItems === 1 ? "page" : "pages"}</p>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="category-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Page Name</th>
                                            <th>Images Count</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th className="action-column">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="table-message">
                                                    <div className="category-loader"></div>
                                                    Loading pages...
                                                </td>
                                            </tr>
                                        ) : pages.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-message">No pages found.</td>
                                            </tr>
                                        ) : (
                                            pages.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{(page - 1) * 10 + index + 1}</td>
                                                    <td>
                                                        <span className="category-name">{item.name}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge-count">
                                                            {item.background_images?.length || 0} Images
                                                        </span>
                                                    </td>
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
                                                    <td>
                                                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
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
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2>{isEditMode ? "Edit Page Images" : "Create Page Images"}</h2>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Select Page / Service</label>
                                <select
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="modal-select"
                                >
                                    <option value="" disabled>-- Select Page Identifier --</option>
                                    {pageOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Existing Images preview during edit */}
                            {isEditMode && existingImages.length > 0 && (
                                <div className="form-group">
                                    <label>Existing Background Images</label>
                                    <div className="existing-images-grid">
                                        {existingImages.map((img) => (
                                            <div key={img.id} className="image-preview-item">
                                                <img src={img.image} alt="Background" />
                                                <button
                                                    type="button"
                                                    className="remove-img-badge"
                                                    onClick={() => handleRemoveExistingImage(img.id)}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Multiple Image Input */}
                            <div className="form-group">
                                <label>{isEditMode ? "Upload New Images" : "Upload Background Images (Multiple)"}</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleFileChange}
                                />
                                <small className="form-hint">You can select multiple images at once.</small>
                            </div>

                            {/* Live Preview for Newly Selected Images with Remove Button */}
                            {previewImages.length > 0 && (
                                <div className="form-group">
                                    <label>Selected Images Preview ({previewImages.length})</label>
                                    <div className="existing-images-grid">
                                        {previewImages.map((src, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={src} alt={`Preview ${index}`} />
                                                <button
                                                    type="button"
                                                    className="remove-img-badge"
                                                    onClick={() => handleRemoveNewImage(index)}
                                                    title="Remove image"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="create-category-button" disabled={submitting}>
                                    {submitting ? "Saving..." : isEditMode ? "Update Page" : "Create Page"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageManager;