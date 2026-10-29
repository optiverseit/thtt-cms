import { useEffect, useState } from "react";
import { FaPen, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

import {
    getGalleriesCms,
    createGallery,
    updateGallery,
    changeGalleryStatus,
    deleteGallery,
    getAllCategoriesCms // Using your provided category function
} from "../../../api/BackendApi";

import "./GalleryManager.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const GalleryManager = () => {
    const [galleries, setGalleries] = useState([]);
    const [categories, setCategories] = useState([]);
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
    const [categoryId, setCategoryId] = useState("");
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [newImages, setNewImages] = useState([]); // File objects
    const [previewImages, setPreviewImages] = useState([]); // Object URLs for live preview
    const [existingImages, setExistingImages] = useState([]); // Array from server {id, image}
    const [removeImageIds, setRemoveImageIds] = useState([]); // IDs to delete
    const [submitting, setSubmitting] = useState(false);

    const fetchGalleries = async () => {
        try {
            setLoading(true);
            const response = await getGalleriesCms(page);

            if (response.data?.status) {
                setGalleries(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
                setTotalItems(response.data.data.total || 0);
            }
        } catch (error) {
            console.error("Gallery fetch error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to fetch galleries.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            // Fetch all or first page categories for select box dropdown
            const response = await getAllCategoriesCms(1);
            if (response.data?.status) {
                setCategories(response.data.data.data || []);
            }
        } catch (error) {
            console.error("Category fetch error for select dropdown:", error);
        }
    };

    useEffect(() => {
        fetchGalleries();
        fetchCategories();
    }, [page]);

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCurrentId(null);
        setCategoryId("");
        setTitle("");
        setLocation("");
        setNewImages([]);
        setPreviewImages([]);
        setExistingImages([]);
        setRemoveImageIds([]);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (galleryData) => {
        setIsEditMode(true);
        setCurrentId(galleryData.id);
        setCategoryId(galleryData.category_id || "");
        setTitle(galleryData.title || "");
        setLocation(galleryData.location || "");
        setNewImages([]);
        setPreviewImages([]);
        setExistingImages(galleryData.images || []);
        setRemoveImageIds([]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Handle selecting multiple files and creating preview URLs
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const updatedFiles = [...newImages, ...files];
        setNewImages(updatedFiles);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviews]);
    };

    // Remove newly selected preview image before submit
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

        if (!categoryId || !title.trim()) {
            Swal.fire({ icon: "warning", title: "Warning", text: "Category and Title are required.", confirmButtonColor: "#351255" });
            return;
        }

        const formData = new FormData();
        formData.append("category_id", categoryId);
        formData.append("title", title);
        formData.append("location", location);

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
                response = await updateGallery(currentId, formData);
            } else {
                response = await createGallery(formData);
            }

            if (response.data?.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.message || "Operation successful.",
                    confirmButtonColor: "#351255",
                });
                setIsModalOpen(false);
                fetchGalleries();
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

    const handleStatusChange = async (galleryData) => {
        const newStatus = galleryData.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
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
            const response = await changeGalleryStatus(galleryData.id);
            if (response.data?.status) {
                fetchGalleries();
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Failed", text: "Unable to update status." });
        }
    };

    const handleDelete = async (galleryData) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Gallery?",
            text: `Delete "${galleryData.title}" and its associated images?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deleteGallery(galleryData.id);
            if (response.data?.status) {
                Swal.fire({ icon: "success", title: "Deleted", text: "Gallery deleted successfully.", confirmButtonColor: "#351255" });
                fetchGalleries();
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Failed", text: "Unable to delete gallery." });
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
                                <h1>Gallery Management</h1>
                                <p>Manage photo galleries, titles, categories, and locations.</p>
                            </div>
                            <button className="create-category-button" onClick={handleOpenCreateModal}>
                                <span>+</span> Create Gallery
                            </button>
                        </div>

                        <div className="category-table-card">
                            <div className="category-table-header">
                                <div>
                                    <h2>Gallery List</h2>
                                    <p>{totalItems} {totalItems === 1 ? "gallery" : "galleries"}</p>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="category-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Location</th>
                                            <th>Images Count</th>
                                            <th>Status</th>
                                            <th className="action-column">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="table-message">
                                                    <div className="category-loader"></div>
                                                    Loading galleries...
                                                </td>
                                            </tr>
                                        ) : galleries.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="table-message">No galleries found.</td>
                                            </tr>
                                        ) : (
                                            galleries.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{(page - 1) * 10 + index + 1}</td>
                                                    <td>
                                                        <span className="category-name">{item.title}</span>
                                                    </td>
                                                    <td>{item.category?.name || "-"}</td>
                                                    <td>{item.location || "-"}</td>
                                                    <td>
                                                        <span className="badge-count">
                                                            {item.images?.length || 0} Images
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
                            <h2>{isEditMode ? "Edit Gallery" : "Create Gallery"}</h2>
                            <button className="modal-close-btn" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                    className="modal-select"
                                >
                                    <option value="" disabled>-- Select Category --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Gallery Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Everest Base Camp Highlights"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Location (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Solukhumbu, Nepal"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>

                            {/* Existing Images preview during edit */}
                            {isEditMode && existingImages.length > 0 && (
                                <div className="form-group">
                                    <label>Existing Images</label>
                                    <div className="existing-images-grid">
                                        {existingImages.map((img) => (
                                            <div key={img.id} className="image-preview-item">
                                                <img src={img.image} alt="Gallery" />
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
                                <label>{isEditMode ? "Upload New Images" : "Upload Images (Multiple)"}</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleFileChange}
                                />
                                <small className="form-hint">You can select multiple images at once.</small>
                            </div>

                            {/* Live Preview for Newly Selected Images */}
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
                                    {submitting ? "Saving..." : isEditMode ? "Update Gallery" : "Create Gallery"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryManager;