import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAllCategoriesCms } from "../../../api/BackendApi";
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
                                                            Edit
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

            </div>
        </div>
    );
};

export default Category;