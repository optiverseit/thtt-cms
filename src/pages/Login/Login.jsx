import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, googleLogin } from "../../api/BackendApi";
import Swal from "sweetalert2";
import { GoogleLogin } from "@react-oauth/google";
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

                    <GoogleLogin
                        onSuccess={(credentialResponse) => {
                            handleGoogleLogin(credentialResponse.credential);
                        }}
                        onError={() => {
                            Swal.fire({
                                icon: "error",
                                title: "Google Login Failed",
                                text: "Unable to authenticate with Google.",
                                confirmButtonColor: "#351255",
                            });
                        }}
                    />

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