import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";
import { getAllDocumentsCms, createDocumentCms, updateDocumentCms, updateDocumentStatusCms, deleteDocumentCms } from "../../../api/BackendApi";
import "./Document.css";

const emptyForm = { title: "", subtitle: "", image: null, imagePreview: "", description: "", status: "ACTIVE", display_order: 0 };

const Document = () => {
    const [documents, setDocuments] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusLoadingId, setStatusLoadingId] = useState(null);

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "strike", "underline"],
            [{ color: [] }, { background: [] }],
            ["link"],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["clean"]
        ]
    };

    const quillFormats = ["header", "bold", "italic", "strike", "underline", "color", "background", "link", "align", "list", "indent"];

    useEffect(() => {
        fetchDocuments(currentPage);
    }, [currentPage]);

    const fetchDocuments = async (page = 1) => {
        try {
            setLoading(true);
            const response = await getAllDocumentsCms(page);
            const data = response.data?.data;
            setDocuments(data?.data || []);
            setCurrentPage(data?.current_page || 1);
            setLastPage(data?.last_page || 1);
            setTotal(data?.total || 0);
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || "Failed to fetch documents.", "error");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setIsEditing(false);
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (document) => {
        setIsEditing(true);
        setEditingId(document.id);
        setForm({
            title: document.title || "",
            subtitle: document.subtitle || "",
            image: null,
            imagePreview: document.image || "",
            description: document.description || "",
            status: document.status || "ACTIVE",
            display_order: document.display_order ?? 0
        });
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        resetForm();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setForm((prev) => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
    };

    const buildFormData = () => {
        const data = new FormData();
        data.append("title", form.title);
        data.append("subtitle", form.subtitle);
        data.append("description", form.description);
        data.append("status", form.status);
        data.append("display_order", String(form.display_order || 0));
        if (form.image) data.append("image", form.image);
        return data;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!form.description || form.description === "<p><br></p>") {
            Swal.fire("Description Required", "Please enter the document description.", "warning");
            return;
        }
        try {
            setSaving(true);
            const payload = buildFormData();
            const response = isEditing ? await updateDocumentCms(editingId, payload) : await createDocumentCms(payload);
            await Swal.fire("Success", response.data?.message || `Document ${isEditing ? "updated" : "created"} successfully.`, "success");
            setShowModal(false);
            resetForm();
            await fetchDocuments(currentPage);
        } catch (error) {
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)?.[0]?.[0] : null;
            Swal.fire("Failed", firstError || error.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (document) => {
        const newStatus = document.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        const result = await Swal.fire({ icon: "question", title: "Change status?", text: `Change this document to ${newStatus}?`, showCancelButton: true, confirmButtonText: "Yes, change it" });
        if (!result.isConfirmed) return;
        try {
            setStatusLoadingId(document.id);
            await updateDocumentStatusCms(document.id, newStatus);
            await fetchDocuments(currentPage);
        } catch (error) {
            Swal.fire("Failed", error.response?.data?.message || "Failed to change status.", "error");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDelete = async (document) => {
        const result = await Swal.fire({ icon: "warning", title: "Delete document?", text: "This document will be permanently deleted.", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#d33" });
        if (!result.isConfirmed) return;
        try {
            await deleteDocumentCms(document.id);
            await Swal.fire("Deleted", "Document deleted successfully.", "success");
            await fetchDocuments(currentPage);
        } catch (error) {
            Swal.fire("Failed", error.response?.data?.message || "Failed to delete document.", "error");
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="document-page">
                        <div className="document-page-header">
                            <div><h1>Documents</h1><p>Manage documentation services displayed on the website.</p></div>
                            <button type="button" className="document-add-button" onClick={openCreateModal}>+ Add Document</button>
                        </div>
                        <div className="document-card">
                            <div className="document-card-header"><div><h2>Document List</h2><p>{total} {total === 1 ? "document" : "documents"}</p></div></div>
                            <div className="document-table-wrapper">
                                <table className="document-table">
                                    <thead><tr><th>S.N.</th><th>Image</th><th>Title</th><th>Subtitle</th><th>Display Order</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {loading ? <tr><td colSpan="7" className="document-empty">Loading documents...</td></tr> : documents.length === 0 ? <tr><td colSpan="7" className="document-empty">No documents found.</td></tr> : documents.map((document, index) => (
                                            <tr key={document.id}>
                                                <td>{(currentPage - 1) * 10 + index + 1}</td>
                                                <td>{document.image ? <img src={document.image} alt={document.title} className="document-table-image" /> : <span>-</span>}</td>
                                                <td><strong>{document.title}</strong></td>
                                                <td><div className="document-subtitle">{document.subtitle || "-"}</div></td>
                                                <td>{document.display_order ?? 0}</td>
                                                <td><button type="button" disabled={statusLoadingId === document.id} className={`document-status ${document.status === "ACTIVE" ? "active" : "inactive"}`} onClick={() => handleStatusChange(document)}>{statusLoadingId === document.id ? "Loading..." : document.status}</button></td>
                                                <td><div className="document-actions"><button type="button" className="document-edit" onClick={() => openEditModal(document)}>Edit</button><button type="button" className="document-delete" onClick={() => handleDelete(document)}>Delete</button></div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!loading && lastPage > 1 && <div className="document-pagination"><Pagination currentPage={currentPage} totalPages={lastPage} onPageChange={setCurrentPage} /></div>}
                        </div>
                    </div>
                </main>
            </div>
            {showModal && <div className="document-modal-overlay" onClick={closeModal}>
                <div className="document-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="document-modal-header">
                        <div><h2>{isEditing ? "Edit Document" : "Add Document"}</h2><p>{isEditing ? "Update document information." : "Create a new documentation service."}</p></div>
                        <button type="button" className="document-modal-close" onClick={closeModal}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="document-modal-body">
                            <div className="document-main-grid">
                                <div className="document-form-group"><label>Title *</label><input name="title" value={form.title} onChange={handleChange} placeholder="Police Report & Clearance" required /></div>
                                <div className="document-form-group"><label>Subtitle *</label><input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Official Police Character Certificate..." required /></div>
                                <div className="document-form-group"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                                <div className="document-form-group"><label>Display Order</label><input type="number" min="0" name="display_order" value={form.display_order} onChange={handleChange} /></div>
                            </div>
                            <div className="document-form-group document-image-field">
                                <label>Image {!isEditing && "*"}</label>
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} required={!isEditing} />
                                {form.imagePreview && <div className="document-image-preview"><img src={form.imagePreview} alt="Preview" /></div>}
                            </div>
                            <div className="document-form-group document-description-group">
                                <label>Description *</label>
                                <div className="document-rich-editor">
                                    <ReactQuill theme="snow" value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} modules={quillModules} formats={quillFormats} placeholder="Enter complete document description..." />
                                </div>
                                <span className="document-editor-help">Formatting, colors, alignment, lists and links will be saved exactly as configured.</span>
                            </div>
                        </div>
                        <div className="document-modal-footer">
                            <button type="button" className="document-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
                            <button type="submit" className="document-save" disabled={saving}>{saving ? "Saving..." : isEditing ? "Update Document" : "Create Document"}</button>
                        </div>
                    </form>
                </div>
            </div>}
        </div>
    );
};

export default Document;