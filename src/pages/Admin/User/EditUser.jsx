import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";
import {
    FaArrowLeft,
    FaSave,
} from "react-icons/fa";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";

import {
    getUserById,
    updateUser,
    getAllRoles,
} from "../../../api/BackendApi";

import "./EditUser.css";

const initialForm = {
    role_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    country_code: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
};

const EditUser = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const [formData, setFormData] =
        useState(initialForm);

    const [roles, setRoles] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            const [
                userResponse,
                roleResponse,
            ] = await Promise.all([
                getUserById(id),
                getAllRoles(),
            ]);

            if (roleResponse.data?.status) {
                const roleData =
                    roleResponse.data.data;

                setRoles(
                    Array.isArray(roleData)
                        ? roleData
                        : roleData?.data || []
                );
            }

            if (userResponse.data?.status) {
                const user =
                    userResponse.data.data;

                setFormData({
                    role_id:
                        String(user.role_id || ""),

                    first_name:
                        user.first_name || "",

                    middle_name:
                        user.middle_name || "",

                    last_name:
                        user.last_name || "",

                    email:
                        user.email || "",

                    country_code:
                        user.country_code || "",

                    phone:
                        user.phone || "",

                    date_of_birth:
                        user.date_of_birth
                            ? String(
                                  user.date_of_birth
                              ).substring(0, 10)
                            : "",

                    gender:
                        user.gender || "",

                    nationality:
                        user.nationality || "",

                    address:
                        user.address || "",

                    city:
                        user.city || "",

                    state:
                        user.state || "",

                    country:
                        user.country || "",

                    postal_code:
                        user.postal_code || "",
                });
            }
        } catch (error) {
            console.error(
                "Load user error:",
                error
            );

            await Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load user.",
                confirmButtonColor: "#351255",
            });

            navigate("/admin/users");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.role_id ||
            !formData.first_name.trim() ||
            !formData.last_name.trim() ||
            !formData.email.trim()
        ) {
            Swal.fire({
                icon: "warning",
                title: "Required Fields",
                text: "Please complete all required fields.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const payload = {
            role_id:
                Number(formData.role_id),

            first_name:
                formData.first_name.trim(),

            middle_name:
                formData.middle_name || null,

            last_name:
                formData.last_name.trim(),

            email:
                formData.email.trim(),

            country_code:
                formData.country_code || null,

            phone:
                formData.phone || null,

            date_of_birth:
                formData.date_of_birth || null,

            gender:
                formData.gender || null,

            nationality:
                formData.nationality || null,

            address:
                formData.address || null,

            city:
                formData.city || null,

            state:
                formData.state || null,

            country:
                formData.country || null,

            postal_code:
                formData.postal_code || null,
        };

        try {
            setSaving(true);

            const response =
                await updateUser(
                    id,
                    payload
                );

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text:
                        response.data.message ||
                        "User updated successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/admin/users");
            }
        } catch (error) {
            let message =
                error.response?.data?.message ||
                "Unable to update user.";

            const errors =
                error.response?.data?.errors;

            if (errors) {
                const first =
                    Object.values(errors)[0];

                if (Array.isArray(first)) {
                    message = first[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: message,
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />

                <div className="dashboard-main">
                    <Navbar />

                    <main className="dashboard-content">
                        <div className="edit-user-loading">
                            Loading user...
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="edit-user-page">

                        <div className="edit-user-header">
                            <div>
                                <h1>Edit User</h1>

                                <p>
                                    Update user account and personal information.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="edit-user-back-btn"
                                onClick={() =>
                                    navigate("/admin/users")
                                }
                            >
                                <FaArrowLeft />
                                Back
                            </button>
                        </div>

                        <div className="edit-user-card">

                            <div className="edit-user-card-header">
                                <h2>User Information</h2>

                                <p>
                                    Update the selected user's details.
                                </p>
                            </div>

                            <form
                                className="edit-user-form"
                                onSubmit={handleSubmit}
                            >

                                <div className="edit-user-section">
                                    <h3>Account Information</h3>

                                    <div className="edit-user-grid">

                                        <div className="edit-user-form-group">
                                            <label>
                                                Role
                                                <span className="required">*</span>
                                            </label>

                                            <select
                                                name="role_id"
                                                value={formData.role_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">
                                                    Select Role
                                                </option>

                                                {roles.map((role) => (
                                                    <option
                                                        key={role.id}
                                                        value={role.id}
                                                    >
                                                        {role.name ||
                                                            role.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>
                                                Email
                                                <span className="required">*</span>
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="edit-user-section">
                                    <h3>Personal Information</h3>

                                    <div className="edit-user-grid">

                                        <div className="edit-user-form-group">
                                            <label>
                                                First Name
                                                <span className="required">*</span>
                                            </label>

                                            <input
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>Middle Name</label>

                                            <input
                                                name="middle_name"
                                                value={formData.middle_name}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>
                                                Last Name
                                                <span className="required">*</span>
                                            </label>

                                            <input
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>Date of Birth</label>

                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>Gender</label>

                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                            >
                                                <option value="">
                                                    Select Gender
                                                </option>

                                                <option value="MALE">
                                                    Male
                                                </option>

                                                <option value="FEMALE">
                                                    Female
                                                </option>

                                                <option value="OTHER">
                                                    Other
                                                </option>
                                            </select>
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>Nationality</label>

                                            <input
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="edit-user-section">
                                    <h3>Contact Information</h3>

                                    <div className="edit-user-grid">

                                        <div className="edit-user-form-group">
                                            <label>Country Code</label>

                                            <input
                                                name="country_code"
                                                value={formData.country_code}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>Phone</label>

                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group edit-user-full-field">
                                            <label>Address</label>

                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>City</label>

                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>State</label>

                                            <input
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>Country</label>

                                            <input
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="edit-user-form-group">
                                            <label>Postal Code</label>

                                            <input
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleChange}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="edit-user-actions">

                                    <button
                                        type="button"
                                        className="edit-user-cancel-btn"
                                        onClick={() =>
                                            navigate("/admin/users")
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="edit-user-save-btn"
                                        disabled={saving}
                                    >
                                        <FaSave />

                                        {saving
                                            ? "Saving..."
                                            : "Update User"}
                                    </button>

                                </div>

                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EditUser;