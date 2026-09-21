import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPen, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import {
    getAllCategoriesCms,
    changeCategoryStatus,
    deleteCategory
} from "../../../api/BackendApi";
import "./Category.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/SideBar/SideBar";

const Category = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setLoading(true);

            const response = await getAllCategoriesCms();

            if (response.data?.status) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error("Category fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch categories.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleStatusChange = async (category) => {
        const newStatus =
            category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        const result = await Swal.fire({
            icon: "warning",
            title: "Change Status?",
            text: `Are you sure you want to change this category to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#351255",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await changeCategoryStatus(category.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text: `Category status changed to ${response.data.data.status}.`,
                    confirmButtonColor: "#351255",
                });

                fetchCategories();
            }
        } catch (error) {
            console.error("Category status change error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change category status.",
                confirmButtonColor: "#351255",
            });
        }
    };

    const handleDelete = async (category) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Category?",
            text: `Are you sure you want to delete "${category.name}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await deleteCategory(category.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Category deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                fetchCategories();
            }
        } catch (error) {
            console.error("Category delete error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete category.",
                confirmButtonColor: "#351255",
            });
        }
    };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">

                    <div className="category-page">

                        <div className="category-header">
                            <div>
                                <h1>Categories</h1>

                                <p>
                                    Manage package categories available in Trip Himalaya.
                                </p>
                            </div>

                            <button
                                className="create-category-button"
                                onClick={() => navigate("/categories/create")}
                            >
                                <span>+</span>
                                Create Category
                            </button>
                        </div>

                        <div className="category-table-card">

                            <div className="category-table-header">
                                <div>
                                    <h2>Category List</h2>

                                    <p>
                                        {categories.length}{" "}
                                        {categories.length === 1
                                            ? "category"
                                            : "categories"}
                                    </p>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="category-table">

                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Category Name</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th className="action-column">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="table-message"
                                                >
                                                    <div className="category-loader"></div>
                                                    Loading categories...
                                                </td>
                                            </tr>
                                        ) : categories.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="table-message"
                                                >
                                                    No categories found.
                                                </td>
                                            </tr>
                                        ) : (
                                            categories.map((category, index) => (
                                                <tr key={category.id}>

                                                    <td>{index + 1}</td>

                                                    <td>
                                                        <span className="category-name">
                                                            {category.name}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`status-badge ${category.status === "ACTIVE"
                                                                    ? "status-active"
                                                                    : "status-inactive"
                                                                }`}
                                                            onClick={() =>
                                                                handleStatusChange(category)
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            {category.status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {category.created_at
                                                            ? new Date(
                                                                category.created_at
                                                            ).toLocaleDateString()
                                                            : "-"}
                                                    </td>

                                                    <td className="action-column">
                                                        <button
                                                            className="edit-button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/categories/edit/${category.id}`
                                                                )
                                                            }
                                                        >
                                                            <FaPen />
                                                        </button>

                                                        <button
                                                        className="delete-button"
                                                        onClick={() => handleDelete(category)}
        >
                                                         <FaTrash />
                                                    </button>
                                                </td>

                                                </tr>
                                    ))
                                        )}
                                </tbody>

                            </table>
                        </div>
                    </div>

            </div>

        </main>

            </div >
        </div >
    );
};

export default Category;