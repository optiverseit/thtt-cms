import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";

import {
    createUser,
    getAllRoles,
} from "../../../api/BackendApi";

import "./CreateUser.css";

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
    password: "",
    password_confirmation: "",
    status: "ACTIVE",
};

const CreateUser = () => {
    const navigate = useNavigate();

    const [formData, setFormData] =
        useState(initialForm);

    const [roles, setRoles] = useState([]);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response =
                await getAllRoles();

            if (response.data?.status) {
                const data =
                    response.data.data;

                setRoles(
                    Array.isArray(data)
                        ? data
                        : data?.data || []
                );
            }
        } catch (error) {
            console.error(
                "Role fetch error:",
                error
            );
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
            !formData.email.trim() ||
            !formData.password
        ) {
            Swal.fire({
                icon: "warning",
                title: "Required Fields",
                text: "Please complete all required fields.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (
            formData.password !==
            formData.password_confirmation
        ) {
            Swal.fire({
                icon: "warning",
                title: "Password Mismatch",
                text: "Password and confirmation do not match.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...formData,
                role_id:
                    Number(formData.role_id),

                middle_name:
                    formData.middle_name || null,

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

            const response =
                await createUser(payload);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Created",
                    text:
                        response.data.message ||
                        "User created successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/admin/users");
            }
        } catch (error) {
            let message =
                error.response?.data?.message ||
                "Unable to create user.";

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

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="create-user-page">

                        <div className="create-user-header">
                            <div>
                                <h1>Create User</h1>

                                <p>
                                    Create a new user account and assign a role.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="create-user-back-btn"
                                onClick={() =>
                                    navigate("/admin/users")
                                }
                            >
                                <FaArrowLeft />
                                Back
                            </button>
                        </div>

                        <div className="create-user-card">

                            <div className="create-user-card-header">
                                <h2>User Information</h2>

                                <p>
                                    Enter the user's account and personal information.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="create-user-form"
                            >

                                <div className="create-user-section">
                                    <h3>Account Information</h3>

                                    <div className="create-user-grid">

                                        <div className="create-user-form-group">
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

                                        <div className="create-user-form-group">
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

                                        <div className="create-user-form-group">
                                            <label>
                                                Password
                                                <span className="required">*</span>
                                            </label>

                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                minLength={8}
                                                required
                                            />
                                        </div>

                                        <div className="create-user-form-group">
                                            <label>
                                                Confirm Password
                                                <span className="required">*</span>
                                            </label>

                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                value={
                                                    formData.password_confirmation
                                                }
                                                onChange={handleChange}
                                                minLength={8}
                                                required
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="create-user-section">
                                    <h3>Personal Information</h3>

                                    <div className="create-user-grid">

                                        <div className="create-user-form-group">
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

                                        <div className="create-user-form-group">
                                            <label>Middle Name</label>

                                            <input
                                                name="middle_name"
                                                value={formData.middle_name}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="create-user-form-group">
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

                                        <div className="create-user-form-group">
                                            <label>Date of Birth</label>

                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="create-user-form-group">
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

                                        <div className="create-user-form-group">
                                            <label>Nationality</label>

                                            <input
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="create-user-section">
                                    <h3>Contact Information</h3>

                                    <div className="create-user-grid">

                                        <div className="create-user-form-group">
                                            <label>Country Code</label>

                                            <input
                                                name="country_code"
                                                value={formData.country_code}
                                                onChange={handleChange}
                                                placeholder="+977"
                                            />
                                        </div>

                                        <div className="create-user-form-group">
                                            <label>Phone</label>

                                            <input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="create-user-form-group create-user-full-field">
                                            <label>Address</label>

                                            <input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="create-user-form-group">
                                            <label>City</label>

                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="create-user-form-group">
                                            <label>State</label>

                                            <input
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="create-user-form-group">
                                            <label>Country</label>

                                            <input
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="create-user-form-group">
                                            <label>Postal Code</label>

                                            <input
                                                name="postal_code"
                                                value={formData.postal_code}
                                                onChange={handleChange}
                                            />
                                        </div>

                                    </div>
                                </div>

                                <div className="create-user-actions">

                                    <button
                                        type="button"
                                        className="create-user-cancel-btn"
                                        onClick={() =>
                                            navigate("/admin/users")
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="create-user-save-btn"
                                        disabled={saving}
                                    >
                                        <FaSave />

                                        {saving
                                            ? "Creating..."
                                            : "Create User"}
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

export default CreateUser;