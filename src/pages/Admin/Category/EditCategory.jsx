import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
    getAllCategoriesCms,
    updateCategory
} from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./EditCategory.css";

const EditCategory = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchCategory = async () => {
        try {
            setLoading(true);

            const response = await getAllCategoriesCms();

            if (response.data?.status) {
                const categories = response.data.data || [];

                const category = categories.find(
                    (item) => String(item.id) === String(id)
                );

                if (!category) {
                    await Swal.fire({
                        icon: "error",
                        title: "Not Found",
                        text: "Category not found.",
                        confirmButtonColor: "#351255",
                    });

                    navigate("/categories");
                    return;
                }

                setName(category.name || "");
            }
        } catch (error) {
            console.error("Category fetch error:", error);

            await Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch category.",
                confirmButtonColor: "#351255",
            });

            navigate("/categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, [id]);

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
            setSaving(true);

            const data = {
                name: name.trim(),
            };

            const response = await updateCategory(id, data);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Category Updated",
                    text:
                        response.data?.message ||
                        "Category updated successfully.",
                    confirmButtonColor: "#351255",
                });

                navigate("/categories");
            }
        } catch (error) {
            console.error("Category update error:", error);

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update category.";

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
            setSaving(false);
        }
    };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">

                    <div className="edit-category-page">

                        <div className="edit-category-header">
                            <div>
                                <h1>Edit Category</h1>
                                <p>
                                    Update package category information.
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

                        <div className="edit-category-card">

                            <div className="edit-category-card-header">
                                <h2>Category Information</h2>
                                <p>
                                    Update the details of this category.
                                </p>
                            </div>

                            {loading ? (
                                <div className="edit-category-loading">
                                    <div className="edit-category-loader"></div>
                                    Loading category...
                                </div>
                            ) : (
                                <form
                                    className="edit-category-form"
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
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="form-actions">

                                        <button
                                            type="button"
                                            className="cancel-button"
                                            onClick={() =>
                                                navigate("/categories")
                                            }
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="update-category-button"
                                            disabled={saving}
                                        >
                                            {saving
                                                ? "Updating..."
                                                : "Update Category"}
                                        </button>

                                    </div>
                                </form>
                            )}

                        </div>

                    </div>

                </main>

            </div>
        </div>
    );
};

export default EditCategory;