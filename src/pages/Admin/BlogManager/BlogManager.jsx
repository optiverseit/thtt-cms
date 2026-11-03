import { useEffect, useState } from "react";
import { FaPen, FaTrash, FaTimes, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
    getBlogsCms,
    createBlog,
    updateBlog,
    changeBlogStatus,
    deleteBlog,
    getActiveCategories,
} from "../../../api/BackendApi";

import "./BlogManager.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const emptyForm = {
    category_id: "",
    title: "",
    excerpt: "",
    read_time: "",
    author_name: "",
    quote: "",
    content: "",
    is_latest_news: false,
};

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "strike", "underline"],
        [{ color: [] }, { background: [] }],
        ["link"],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["clean"],
    ],
};

const quillFormats = [
    "header", "bold", "italic", "strike", "underline",
    "color", "background", "link", "align", "list", "indent",
];

const BlogManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [statusLoadingId, setStatusLoadingId] = useState(null);

    // Form
    const [form, setForm] = useState(emptyForm);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [insights, setInsights] = useState([]); // [{title, description}]

    // Images
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    /* ---------------- Fetching ---------------- */

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await getBlogsCms(page);
            if (response.data?.status) {
                const paginated = response.data.data;
                setBlogs(paginated.data || []);
                setTotalPages(paginated.last_page || 1);
                setTotalItems(paginated.total || 0);
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to fetch blogs.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getActiveCategories();
            const payload = response.data?.data;
            // Supports both a plain array and a paginated response
            setCategories(Array.isArray(payload) ? payload : payload?.data || []);
        } catch (error) {
            console.error("Category fetch error:", error);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [page]);

    useEffect(() => {
        fetchCategories();
    }, []);

    /* ---------------- Modal open / close ---------------- */

    const resetForm = () => {
        setForm(emptyForm);
        setTags([]);
        setTagInput("");
        setInsights([]);
        setImageFile(null);
        setImagePreview("");
        setAvatarFile(null);
        setAvatarPreview("");
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setIsEditMode(false);
        setCurrentId(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (blog) => {
        resetForm();
        setIsEditMode(true);
        setCurrentId(blog.id);
        setForm({
            category_id: blog.category_id || "",
            title: blog.title || "",
            excerpt: blog.excerpt || "",
            read_time: blog.read_time || "",
            author_name: blog.author_name || "",
            quote: blog.quote || "",
            content: blog.content || "",
            is_latest_news: !!blog.is_latest_news,
        });
        setTags(Array.isArray(blog.tags) ? blog.tags : []);
        setInsights(
            (blog.insights || []).map((i) => ({
                title: i.title || "",
                description: i.description || "",
            }))
        );
        setImagePreview(blog.image || "");
        setAvatarPreview(blog.author_avatar || "");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (submitting) return;
        setIsModalOpen(false);
    };

    /* ---------------- Form handlers ---------------- */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Tags
    const addTag = () => {
        const value = tagInput.trim().replace(/,$/, "");
        if (!value || tags.includes(value)) {
            setTagInput("");
            return;
        }
        setTags([...tags, value]);
        setTagInput("");
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        }
    };

    const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

    // Insights
    const addInsight = () => setInsights([...insights, { title: "", description: "" }]);

    const updateInsight = (index, field, value) => {
        setInsights(insights.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const removeInsight = (index) => setInsights(insights.filter((_, i) => i !== index));

    /* ---------------- Submit ---------------- */

    const buildFormData = () => {
        const data = new FormData();

        data.append("category_id", form.category_id);
        data.append("title", form.title);
        data.append("excerpt", form.excerpt);
        data.append("read_time", form.read_time);
        data.append("author_name", form.author_name);
        data.append("quote", form.quote);
        data.append("content", form.content === "<p><br></p>" ? "" : form.content);
        // Laravel's boolean rule accepts 1/0, not "true"/"false"
        data.append("is_latest_news", form.is_latest_news ? 1 : 0);

        tags.forEach((tag) => data.append("tags[]", tag));

        // Only send complete insights (title and description are required by the API)
        insights
            .filter((i) => i.title.trim() && i.description.trim())
            .forEach((item, index) => {
                data.append(`insights[${index}][title]`, item.title.trim());
                data.append(`insights[${index}][description]`, item.description.trim());
            });

        if (imageFile) data.append("image", imageFile);
        if (avatarFile) data.append("author_avatar", avatarFile);

        return data;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!form.category_id) {
            Swal.fire({ icon: "warning", title: "Warning", text: "Please select a category.", confirmButtonColor: "#351255" });
            return;
        }
        if (!form.title.trim()) {
            Swal.fire({ icon: "warning", title: "Warning", text: "Please enter a blog title.", confirmButtonColor: "#351255" });
            return;
        }

        try {
            setSubmitting(true);
            const payload = buildFormData();
            const response = isEditMode
                ? await updateBlog(currentId, payload)
                : await createBlog(payload);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.message || "Operation successful.",
                    confirmButtonColor: "#351255",
                });
                setIsModalOpen(false);
                resetForm();
                fetchBlogs();
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)?.[0]?.[0] : null;
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: firstError || error.response?.data?.message || "Validation or server error occurred.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------------- Status / Delete ---------------- */

    const handleStatusChange = async (blog) => {
        const newStatus = blog.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
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
            setStatusLoadingId(blog.id);
            const response = await changeBlogStatus(blog.id);
            if (response.data?.status) fetchBlogs();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to update status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDelete = async (blog) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Blog?",
            text: `Delete "${blog.title}" and its image permanently?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });
        if (!result.isConfirmed) return;

        try {
            const response = await deleteBlog(blog.id);
            if (response.data?.status) {
                Swal.fire({ icon: "success", title: "Deleted", text: "Blog deleted successfully.", confirmButtonColor: "#351255" });
                // Step back a page if we just removed the last row on this page
                if (blogs.length === 1 && page > 1) setPage(page - 1);
                else fetchBlogs();
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to delete blog.",
                confirmButtonColor: "#351255",
            });
        }
    };

    /* ---------------- Render ---------------- */

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="category-page">
                        <div className="category-header">
                            <div>
                                <h1>Blogs</h1>
                                <p>Create and manage blog posts shown on the website.</p>
                            </div>
                            <button className="create-category-button" onClick={handleOpenCreateModal}>
                                <span>+</span> Create Blog
                            </button>
                        </div>

                        <div className="category-table-card">
                            <div className="category-table-header">
                                <div>
                                    <h2>Blog List</h2>
                                    <p>{totalItems} {totalItems === 1 ? "blog" : "blogs"}</p>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="category-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Image</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Author</th>
                                            <th>Latest News</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th className="action-column">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="9" className="table-message">
                                                    <div className="category-loader"></div>
                                                    Loading blogs...
                                                </td>
                                            </tr>
                                        ) : blogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="table-message">No blogs found. Create your first blog.</td>
                                            </tr>
                                        ) : (
                                            blogs.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{(page - 1) * 10 + index + 1}</td>
                                                    <td>
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.title} className="blog-table-image" />
                                                        ) : (
                                                            <span>-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="category-name blog-title-cell">{item.title}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge-count">
                                                            {item.category?.name || item.category?.title || "-"}
                                                        </span>
                                                    </td>
                                                    <td>{item.author_name || "-"}</td>
                                                    <td>
                                                        <span className={`badge-count ${item.is_latest_news ? "blog-badge-yes" : ""}`}>
                                                            {item.is_latest_news ? "Yes" : "No"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`status-badge ${
                                                                item.status === "ACTIVE" ? "status-active" : "status-inactive"
                                                            }`}
                                                            onClick={() => statusLoadingId !== item.id && handleStatusChange(item)}
                                                        >
                                                            {statusLoadingId === item.id ? "Loading..." : item.status}
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

                            <Pagination
                                page={page}
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-card blog-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? "Edit Blog" : "Create Blog"}</h2>
                            <button className="modal-close-btn" type="button" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="modal-form blog-modal-form">
                            <div className="blog-form-grid">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleChange}
                                        required
                                        className="modal-select"
                                    >
                                        <option value="" disabled>-- Select Category --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name || cat.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter blog title"
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Author Name</label>
                                    <input
                                        type="text"
                                        name="author_name"
                                        value={form.author_name}
                                        onChange={handleChange}
                                        placeholder="Adventure Desk"
                                        maxLength={255}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Read Time</label>
                                    <input
                                        type="text"
                                        name="read_time"
                                        value={form.read_time}
                                        onChange={handleChange}
                                        placeholder="5 min read"
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Excerpt</label>
                                <textarea
                                    name="excerpt"
                                    value={form.excerpt}
                                    onChange={handleChange}
                                    placeholder="Short summary shown on blog cards"
                                    rows={3}
                                />
                            </div>

                            <div className="blog-form-grid">
                                <div className="form-group">
                                    <label>Cover Image</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleImageChange}
                                    />
                                    <small className="form-hint">JPG, PNG or WEBP. Max 5MB.{isEditMode && " Leave empty to keep current image."}</small>
                                    {imagePreview && (
                                        <div className="blog-cover-preview">
                                            <img src={imagePreview} alt="Cover preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Author Avatar</label>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleAvatarChange}
                                    />
                                    <small className="form-hint">JPG, PNG or WEBP. Max 2MB.</small>
                                    {avatarPreview && (
                                        <div className="image-preview-item blog-avatar-preview">
                                            <img src={avatarPreview} alt="Avatar preview" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Content</label>
                                <div className="blog-rich-editor">
                                    <ReactQuill
                                        theme="snow"
                                        value={form.content}
                                        onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Write the full blog content..."
                                    />
                                </div>
                                <small className="form-hint">Formatting, colors, alignment, lists and links are saved as configured.</small>
                            </div>

                            <div className="form-group">
                                <label>Quote</label>
                                <textarea
                                    name="quote"
                                    value={form.quote}
                                    onChange={handleChange}
                                    placeholder="Highlighted quote shown inside the blog"
                                    rows={2}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tags</label>
                                <div className="blog-tag-box">
                                    {tags.map((tag) => (
                                        <span key={tag} className="blog-tag-chip">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                                                <FaTimes />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        onBlur={addTag}
                                        placeholder={tags.length ? "Add another tag" : "Type a tag and press Enter"}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="blog-section-head">
                                    <label>Key Insights</label>
                                    <button type="button" className="blog-add-btn" onClick={addInsight}>
                                        <FaPlus /> Add Insight
                                    </button>
                                </div>

                                {insights.length === 0 && (
                                    <small className="form-hint">No insights added yet.</small>
                                )}

                                {insights.map((item, index) => (
                                    <div key={index} className="blog-insight-item">
                                        <div className="blog-insight-fields">
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateInsight(index, "title", e.target.value)}
                                                placeholder="Insight title"
                                                maxLength={255}
                                            />
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => updateInsight(index, "description", e.target.value)}
                                                placeholder="Insight description"
                                                rows={2}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="blog-insight-remove"
                                            onClick={() => removeInsight(index)}
                                            aria-label="Remove insight"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <label className="blog-checkbox">
                                <input
                                    type="checkbox"
                                    name="is_latest_news"
                                    checked={form.is_latest_news}
                                    onChange={handleChange}
                                />
                                Show in Latest News sidebar
                            </label>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="create-category-button" disabled={submitting}>
                                    {submitting ? "Saving..." : isEditMode ? "Update Blog" : "Create Blog"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManager;
