
import { useEffect, useRef, useState } from "react";
import { FaPen, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { getAllRolesCms, createRole, updateRole, changeRoleStatus, deleteRole } from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";
import "./Role.css";

const initialFormData = { name: "", slug: "", description: "", status: "ACTIVE" };

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

const Role = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRoles, setTotalRoles] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [changingStatusId, setChangingStatusId] = useState(null);
    const statusLock = useRef(false);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await getAllRolesCms(page);
            if (response.data?.status) {
                const result = response.data.data;
                if (Array.isArray(result?.data)) {
                    setRoles(result.data);
                    setTotalPages(result.last_page || 1);
                    setTotalRoles(result.total || 0);
                } else if (Array.isArray(result)) {
                    setRoles(result);
                    setTotalPages(1);
                    setTotalRoles(result.length);
                } else {
                    setRoles([]);
                    setTotalPages(1);
                    setTotalRoles(0);
                }
            } else {
                throw new Error(response.data?.message || "Unable to fetch roles.");
            }
        } catch (error) {
            console.error("Role fetch error:", error);
            setRoles([]);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || error.message || "Unable to fetch roles.",
                confirmButtonColor: "#351255"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [page]);

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedRole(null);
        setFormData({ ...initialFormData });
        setErrors({});
        setModalOpen(true);
    };

    const openEditModal = (role) => {
        setModalMode("edit");
        setSelectedRole(role);
        setFormData({
            name: role.name || "",
            slug: role.slug || "",
            description: role.description || "",
            status: role.status || "ACTIVE"
        });
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        if (submitting) return;
        setModalOpen(false);
        setSelectedRole(null);
        setFormData({ ...initialFormData });
        setErrors({});
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "name" ? { slug: generateSlug(value) } : {})
        }));
        if (errors[name] || (name === "name" && errors.slug)) {
            setErrors((previous) => ({
                ...previous,
                [name]: null,
                ...(name === "name" ? { slug: null } : {})
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;
        try {
            setSubmitting(true);
            setErrors({});
            const payload = {
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                description: formData.description.trim() || null,
                status: formData.status
            };
            const response = modalMode === "create"
                ? await createRole(payload)
                : await updateRole(selectedRole.id, payload);

            if (!response.data?.status) {
                throw new Error(response.data?.message || "Unable to save role.");
            }

            closeModalAfterSave();

            await Swal.fire({
                icon: "success",
                title: modalMode === "create" ? "Role Created" : "Role Updated",
                text: response.data?.message || "Role saved successfully.",
                confirmButtonColor: "#351255"
            });

            if (modalMode === "create" && page !== 1) {
                setPage(1);
            } else {
                fetchRoles();
            }
        } catch (error) {
            console.error("Role submit error:", error);
            if (error.response?.status === 422 && error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                return;
            }
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || error.message || "Unable to save role.",
                confirmButtonColor: "#351255"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const closeModalAfterSave = () => {
        setModalOpen(false);
        setSelectedRole(null);
        setFormData({ ...initialFormData });
        setErrors({});
    };

    const handleDelete = async (role) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Role?",
            text: `Are you sure you want to delete "${role.name}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255"
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deleteRole(role.id);
            if (!response.data?.status) {
                throw new Error(response.data?.message || "Unable to delete role.");
            }

            await Swal.fire({
                icon: "success",
                title: "Deleted",
                text: response.data?.message || "Role deleted successfully.",
                confirmButtonColor: "#351255"
            });

            if (roles.length === 1 && page > 1) {
                setPage(previous => previous - 1);
            } else {
                fetchRoles();
            }
        } catch (error) {
            console.error("Role delete error:", error);
            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: error.response?.data?.message || error.message || "Unable to delete role.",
                confirmButtonColor: "#351255"
            });
        }
    };

    const handleStatusChange = async (role) => {
        if (statusLock.current) return;
        statusLock.current = true;
        const newStatus = role.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        try {
            const result = await Swal.fire({
                icon: "question",
                title: "Change Status?",
                text: `Are you sure you want to change ${role.name} from ${role.status} to ${newStatus}?`,
                showCancelButton: true,
                confirmButtonText: `Yes, make ${newStatus}`,
                cancelButtonText: "Cancel",
                confirmButtonColor: newStatus === "ACTIVE" ? "#18794e" : "#b42345",
                cancelButtonColor: "#6b7280"
            });

            if (!result.isConfirmed) return;

            setChangingStatusId(role.id);
            const response = await changeRoleStatus(role.id);

            if (!response.data?.status) {
                throw new Error(response.data?.message || "Unable to update status.");
            }

            setRoles(previous =>
                previous.map(item =>
                    item.id === role.id
                        ? { ...item, status: response.data.data?.status || newStatus }
                        : item
                )
            );

            await Swal.fire({
                icon: "success",
                title: "Status Updated",
                text: response.data?.message || "Role status changed successfully.",
                confirmButtonColor: "#351255"
            });
        } catch (error) {
            console.error("Role status error:", error);
            await Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || error.message || "Unable to change role status.",
                confirmButtonColor: "#351255"
            });
        } finally {
            setChangingStatusId(null);
            statusLock.current = false;
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="role-page">
                        <div className="role-header">
                            <div>
                                <h1>Role Management</h1>
                                <p>Manage user roles and their availability in the system.</p>
                            </div>
                            <button type="button" className="role-create-button" onClick={openCreateModal}>
                                <span>+</span> Create Role
                            </button>
                        </div>

                        <div className="role-table-card">
                            <div className="role-table-header">
                                <div>
                                    <h2>Role List</h2>
                                    <p>{totalRoles} {totalRoles === 1 ? "role" : "roles"}</p>
                                </div>
                            </div>

                            <div className="role-table-responsive">
                                <table className="role-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Role Name</th>
                                            <th>Slug</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="role-table-message">
                                                    <div className="role-loader"></div>
                                                    Loading roles...
                                                </td>
                                            </tr>
                                        ) : roles.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="role-table-message">No roles found.</td>
                                            </tr>
                                        ) : roles.map((role, index) => (
                                            <tr key={role.id}>
                                                <td>{(page - 1) * 10 + index + 1}</td>
                                                <td><span className="role-name">{role.name || "-"}</span></td>
                                                <td><span className="role-slug">{role.slug || "-"}</span></td>
                                                <td>
                                                    <div className="role-description" title={role.description || ""}>
                                                        {role.description || "-"}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`role-status ${role.status === "ACTIVE" ? "role-status-active" : "role-status-inactive"}`}
                                                        onClick={() => handleStatusChange(role)}
                                                        disabled={changingStatusId !== null || loading}
                                                        title="Click to change status"
                                                    >
                                                        {changingStatusId === role.id ? (
                                                            <>
                                                                <span className="role-status-spinner"></span>
                                                                UPDATING...
                                                            </>
                                                        ) : role.status || "-"}
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="role-actions">
                                                        <button type="button" className="role-edit-button" onClick={() => openEditModal(role)} title="Edit Role">
                                                            <FaPen />
                                                        </button>
                                                        <button type="button" className="role-delete-button" onClick={() => handleDelete(role)} title="Delete Role">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="role-pagination">
                                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {modalOpen && (
                <div className="role-modal-overlay" onMouseDown={closeModal}>
                    <div className="role-modal" onMouseDown={event => event.stopPropagation()}>
                        <div className="role-modal-header">
                            <div>
                                <h2>{modalMode === "create" ? "Create Role" : "Edit Role"}</h2>
                                <p>
                                    {modalMode === "create"
                                        ? "Add a new role to the system."
                                        : `Update ${selectedRole?.name || "role"}.`}
                                </p>
                            </div>
                            <button type="button" className="role-modal-close" onClick={closeModal} disabled={submitting}>
                                <FaTimes />
                            </button>
                        </div>

                        <form className="role-form" onSubmit={handleSubmit}>
                            <div className="role-form-grid">
                                <div className="role-form-group">
                                    <label htmlFor="role-name">Role Name *</label>
                                    <input
                                        id="role-name"
                                        type="text"
                                        name="name"
                                        maxLength={50}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Booking Admin"
                                        required
                                    />
                                    {errors.name && <span className="role-field-error">{errors.name[0]}</span>}
                                </div>

                                <div className="role-form-group">
                                    <label htmlFor="role-slug">Slug *</label>
                                    <input
                                        id="role-slug"
                                        type="text"
                                        name="slug"
                                        maxLength={50}
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        placeholder="Automatically generated from role name"
                                        required
                                    />
                                    {errors.slug && <span className="role-field-error">{errors.slug[0]}</span>}
                                </div>

                                <div className="role-form-group">
                                    <label htmlFor="role-status">Status *</label>
                                    <select id="role-status" name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                    {errors.status && <span className="role-field-error">{errors.status[0]}</span>}
                                </div>

                                <div className="role-form-group role-form-full">
                                    <label htmlFor="role-description">Description</label>
                                    <textarea
                                        id="role-description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Enter role description..."
                                    />
                                    {errors.description && <span className="role-field-error">{errors.description[0]}</span>}
                                </div>
                            </div>

                            <div className="role-modal-actions">
                                <button type="button" className="role-cancel-button" onClick={closeModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="role-submit-button" disabled={submitting}>
                                    {submitting ? "Saving..." : modalMode === "create" ? "Create Role" : "Update Role"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Role;
