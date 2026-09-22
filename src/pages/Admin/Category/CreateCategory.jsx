import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createCategory } from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./CreateCategory.css";

const CreateCategory = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Category Name Required",
                text: "Please enter a category name.",
                confirmButtonColor: "#351255",
            });
            return;
        }

        try {
            setLoading(true);

            const data = {
                name: name.trim(),
            };

            const response = await createCategory(data);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Category Created",
                    text:
                        response.data?.message ||
                        "Category created successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/categories");
            }
        } catch (error) {
            console.error("Create category error:", error);

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create category.";

            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                const firstError = Object.values(validationErrors)[0];

                if (Array.isArray(firstError)) {
                    errorMessage = firstError[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: errorMessage,
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">

                    <div className="create-category-page">

                        <div className="create-category-header">
                            <div>
                                <h1>Create Category</h1>
                                <p>
                                    Add a new package category to Trip Himalaya.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="back-button"
                                onClick={() => navigate("/categories")}
                            >
                                Back to Categories
                            </button>
                        </div>

                        <div className="create-category-card">

                            <div className="create-category-card-header">
                                <h2>Category Information</h2>
                                <p>
                                    Enter the details for the new category.
                                </p>
                            </div>

                            <form
                                className="create-category-form"
                                onSubmit={handleSubmit}
                            >

                                <div className="form-group">
                                    <label htmlFor="name">
                                        Category Name
                                        <span className="required">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter category name"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() =>
                                            navigate("/categories")
                                        }
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-category-button"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Creating..."
                                            : "Create Category"}
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

export default CreateCategory;