import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaPlus,
    FaPen,
    FaTrash,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";
import {
    getAllUsersCms,
    searchUsersCms,
    changeUserStatus,
    deleteUser,
} from "../../../api/BackendApi";
import "./User.css";
const User = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusUpdatingId, setStatusUpdatingId] =
        useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const searchRequestId = useRef(0);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(timer);
    }, [search]);
    const handleSearchChange = (e) => {
        searchRequestId.current += 1;
        setSearch(e.target.value);
        setPage(1);
        setLoading(true);
    };
    const clearSearch = () => {
        searchRequestId.current += 1;
        setSearch("");
        setDebouncedSearch("");
        setPage(1);
        setLoading(true);
    };
    // ==========================================
    // FETCH USERS
    // ==========================================
    const fetchUsers = async () => {
        const requestId = ++searchRequestId.current;
        try {
            setLoading(true);
            const response =
                debouncedSearch ? await searchUsersCms(debouncedSearch, page) : await getAllUsersCms(page);
            if (requestId !== searchRequestId.current) return;
            if (response.data?.status) {
                const responseData =
                    response.data.data;
                // Supports Laravel paginate()
                setUsers(
                    Array.isArray(responseData)
                        ? responseData
                        : responseData?.data || []
                );
                setTotalPages(
                    responseData?.last_page || 1
                );
            }
        } catch (error) {
            if (requestId !== searchRequestId.current) return;
            console.error(
                "Fetch users error:",
                error
            );
            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load users.",
                confirmButtonColor: "#351255",
            });
        } finally {
            if (requestId === searchRequestId.current) setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, [page, debouncedSearch]);
    // ==========================================
    // STATUS
    // ==========================================
    const handleStatusChange = async (user) => {
        if (statusUpdatingId === user.id) {
            return;
        }
        const newStatus =
            user.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";
        const result = await Swal.fire({
            icon: "warning",
            title: "Change Status?",
            text: `Are you sure you want to change this user to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#351255",
            cancelButtonColor: "#77717d",
        });
        if (!result.isConfirmed) {
            return;
        }
        try {
            setStatusUpdatingId(user.id);
            const response =
                await changeUserStatus(user.id);
            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data.message ||
                        `User status changed to ${newStatus}.`,
                    confirmButtonColor: "#351255",
                });
                await fetchUsers();
            }
        } catch (error) {
            console.error(
                "User status change error:",
                error
            );
            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change user status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setStatusUpdatingId(null);
        }
    };
    // ==========================================
    // DELETE
    // ==========================================
    const handleDelete = async (user) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete User?",
            text: `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#f52d91",
            cancelButtonColor: "#77717d",
        });
        if (!result.isConfirmed) {
            return;
        }
        try {
            const response =
                await deleteUser(user.id);
            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "User deleted successfully.",
                    confirmButtonColor: "#351255",
                });
                await fetchUsers();
            }
        } catch (error) {
            console.error(
                "Delete user error:",
                error
            );
            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete user.",
                confirmButtonColor: "#351255",
            });
        }
    };
    // ==========================================
    // FULL NAME
    // ==========================================
    const getFullName = (user) => {
        return [
            user.first_name,
            user.middle_name,
            user.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    };
    // ==========================================
    // PHONE
    // ==========================================
    const getPhone = (user) => {
        if (!user.phone) {
            return "-";
        }
        return `${user.country_code || ""} ${user.phone}`.trim();
    };
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="user-page">
                        {/* HEADER */}
                        <div className="user-header">
                            <div>
                                <h1>User Management</h1>
                                <p>
                                    Manage users, roles, status and account information.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="user-create-btn"
                                onClick={() =>
                                    navigate("/users/create")
                                }
                            >
                                <FaPlus />
                                Create User
                            </button>
                        </div>
                        {/* TABLE CARD */}
                        <div className="user-table-card">
                            <div className="user-card-header">
                                <h2>Users</h2>
                                <p>
                                    View and manage registered users.
                                </p>
                                <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                                    <FaSearch style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#777", pointerEvents: "none" }} />
                                    <input type="text" value={search} onChange={handleSearchChange} placeholder="Search users..." aria-label="Search users" style={{ width: "100%", boxSizing: "border-box", padding: "11px 36px 11px 38px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outlineColor: "#351255" }} />
                                    {search && (
                                        <button type="button" onClick={clearSearch} aria-label="Clear search" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "#777" }}>
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {loading ? (
                                <div className="user-empty">
                                    Loading...
                                </div>
                            ) : users.length === 0 ? (
                                <div className="user-empty">
                                    No users found.
                                </div>
                            ) : (
                                <>
                                    <div className="user-table-wrapper">
                                        <table className="user-table">
                                            <thead>
                                                <tr>
                                                    <th>S.N.</th>
                                                    <th>User</th>
                                                    <th>Role</th>
                                                    <th>Phone</th>
                                                    <th>Location</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(
                                                    (user, index) => (
                                                        <tr key={user.id}>
                                                            <td>
                                                                {(page - 1) * 10 +
                                                                    index +
                                                                    1}
                                                            </td>
                                                            <td>
                                                                <div className="user-info">
                                                                    <strong>
                                                                        {getFullName(user)}
                                                                    </strong>
                                                                    <span>
                                                                        {user.email}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="user-role">
                                                                    {user.role?.name ||
                                                                        user.role?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {getPhone(user)}
                                                            </td>
                                                            <td>
                                                                <div className="user-location">
                                                                    <strong>
                                                                        {user.city ||
                                                                            user.country ||
                                                                            "-"}
                                                                    </strong>
                                                                    {user.city &&
                                                                        user.country && (
                                                                            <span>
                                                                                {user.country}
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </td>
                                                            {/* CLICKABLE STATUS */}
                                                            <td>
                                                                <span
                                                                    className={`user-status ${
                                                                        user.status === "ACTIVE"
                                                                            ? "active"
                                                                            : "inactive"
                                                                    } ${
                                                                        statusUpdatingId ===
                                                                        user.id
                                                                            ? "updating"
                                                                            : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (
                                                                            statusUpdatingId !==
                                                                            user.id
                                                                        ) {
                                                                            handleStatusChange(
                                                                                user
                                                                            );
                                                                        }
                                                                    }}
                                                                    role="button"
                                                                    tabIndex={
                                                                        statusUpdatingId ===
                                                                        user.id
                                                                            ? -1
                                                                            : 0
                                                                    }
                                                                    title="Click to change status"
                                                                >
                                                                    {statusUpdatingId ===
                                                                    user.id
                                                                        ? "UPDATING..."
                                                                        : user.status}
                                                                </span>
                                                            </td>
                                                            {/* ACTIONS */}
                                                            <td>
                                                                <div className="user-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="user-edit-btn"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/users/edit/${user.id}`
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="user-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                user
                                                                            )
                                                                        }
                                                                        title="Delete"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {totalPages > 1 && (
                                        <Pagination
                                            page={page}
                                            totalPages={totalPages}
                                            onPageChange={setPage}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default User;
