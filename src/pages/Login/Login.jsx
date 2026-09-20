import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, googleLogin } from "../../api/BackendApi";
import Swal from "sweetalert2";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const loginData = {
                email: formData.email,
                password: formData.password,
            };

            const response = await loginUser(loginData);
            const data = response.data;

            if (data?.success && data?.token && data?.user) {
                const user = data.user;

                /*
                if (user?.role?.slug !== "admin") {
                  setError("You are not authorized to access the CMS.");
                  return;
                }
                */

                if (data?.token) {
                    localStorage.setItem("token", data.token);
                }

                /*
                // Uncomment after refresh token is implemented
                if (data?.refreshToken) {
                  localStorage.setItem("refreshToken", data.refreshToken);
                }
                */

                if (user?.id) {
                    localStorage.setItem("userId", user.id.toString());
                }

                if (user?.role?.slug) {
                    localStorage.setItem("role", user.role.slug);
                }

                if (user?.role?.name) {
                    localStorage.setItem("roleName", user.role.name);
                }

                if (user?.email) {
                    localStorage.setItem("email", user.email);
                }

                if (user?.first_name) {
                    localStorage.setItem("firstName", user.first_name);
                }

                if (user?.last_name) {
                    localStorage.setItem("lastName", user.last_name);
                }

                const fullName = [
                    user?.first_name,
                    user?.middle_name,
                    user?.last_name,
                ]
                    .filter(Boolean)
                    .join(" ");

                if (fullName) {
                    localStorage.setItem("name", fullName);
                }

                if (user?.avatar) {
                    localStorage.setItem("avatar", user.avatar);
                }

                // Show backend success message
                await Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: data.message,
                    confirmButtonText: "Continue",
                    confirmButtonColor: "#351255",
                });

                navigate("/dashboard");
            } else {
                setError(data?.message || "Invalid login response.");
            }
        } catch (error) {
            console.error("Login error:", error);

            const message =
                error.response?.data?.message ||
                "Unable to login. Please try again.";

            setError(message);

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: message,
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (idToken) => {
        setLoading(true);
        setError("");

        try {
            const response = await googleLogin(idToken);
            const data = response.data;

            if (data?.success && data?.token && data?.user) {
                const user = data.user;

                if (data?.token) {
                    localStorage.setItem("token", data.token);
                }

                /*
                // Uncomment when refresh token is implemented
                if (data?.refreshToken) {
                  localStorage.setItem("refreshToken", data.refreshToken);
                }
                */

                if (user?.id) {
                    localStorage.setItem("userId", user.id.toString());
                }

                if (user?.role?.slug) {
                    localStorage.setItem("role", user.role.slug);
                }

                if (user?.role?.name) {
                    localStorage.setItem("roleName", user.role.name);
                }

                if (user?.email) {
                    localStorage.setItem("email", user.email);
                }

                if (user?.first_name) {
                    localStorage.setItem("firstName", user.first_name);
                }

                if (user?.last_name) {
                    localStorage.setItem("lastName", user.last_name);
                }

                const fullName = [
                    user?.first_name,
                    user?.middle_name,
                    user?.last_name,
                ]
                    .filter(Boolean)
                    .join(" ");

                if (fullName) {
                    localStorage.setItem("name", fullName);
                }

                if (user?.avatar) {
                    localStorage.setItem("avatar", user.avatar);
                }

                await Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: data.message,
                    confirmButtonColor: "#351255",
                });

                navigate("/dashboard");
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Google login failed. Please try again.";

            setError(message);

            Swal.fire({
                icon: "error",
                title: "Google Login Failed",
                text: message,
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* LEFT SIDE */}

            <div className="login-left">
                <div className="login-brand">
                    <div className="brand-icon">
                        <span>▲</span>
                    </div>

                    <div className="brand-text">
                        <h2>Trip Himalaya</h2>
                        <p>TOURS & TRAVEL</p>
                    </div>
                </div>

                <div className="login-container">
                    <div className="login-header">
                        <span className="welcome-label">
                            WELCOME BACK
                        </span>

                        <h1>Login to your account</h1>

                        <p>
                            Enter your credentials to access the THTT
                            administration dashboard.
                        </p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">!</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="password-label">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={() =>
                                        navigate("/forgot-password")
                                    }
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>

                    <button
                        type="button"
                        className="google-button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                fill="#4285F4"
                                d="M21.35 12.2c0-.64-.06-1.25-.16-1.84H12v3.48h5.25a4.49 4.49 0 0 1-1.95 2.94v2.26h3.16c1.85-1.7 2.89-4.21 2.89-6.84Z"
                            />

                            <path
                                fill="#34A853"
                                d="M12 21.75c2.64 0 4.86-.87 6.48-2.37l-3.16-2.45c-.88.59-2 .94-3.32.94-2.55 0-4.71-1.72-5.49-4.04H3.25v2.52A9.75 9.75 0 0 0 12 21.75Z"
                            />

                            <path
                                fill="#FBBC05"
                                d="M6.51 13.83A5.86 5.86 0 0 1 6.2 12c0-.64.11-1.26.31-1.83V7.65H3.25A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1 4.35l3.26-2.52Z"
                            />

                            <path
                                fill="#EA4335"
                                d="M12 6.13c1.44 0 2.73.49 3.74 1.46l2.8-2.8C16.85 3.22 14.64 2.25 12 2.25a9.75 9.75 0 0 0-8.75 5.4l3.26 2.52C7.29 7.85 9.45 6.13 12 6.13Z"
                            />
                        </svg>

                        Continue with Google
                    </button>

                    <p className="cms-label">
                        THTT Content Management System
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="login-right">
                <div className="image-overlay"></div>

                <div className="right-content">
                    <span className="trip-label">
                        TRIP HIMALAYA
                    </span>

                    <h2>
                        Manage unforgettable
                        <br />
                        adventures.
                    </h2>

                    <p>
                        Manage packages, bookings, destinations
                        and everything that makes every journey
                        extraordinary.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;