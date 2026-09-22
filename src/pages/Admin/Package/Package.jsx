import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";

import {
    getAllPackagesCms,
    changePackageStatus,
    deletePackage
} from "../../../api/BackendApi";

import "./Package.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const Package = () => {
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPackages = async () => {
        try {
            setLoading(true);

            const response = await getAllPackagesCms(page);

            if (response.data?.status) {
                setPackages(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Package fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch packages.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [page]);

    const handleStatusChange = async (packageItem) => {
        const newStatus =
            packageItem.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        const result = await Swal.fire({
            icon: "warning",
            title: "Change Status?",
            text: `Are you sure you want to change "${packageItem.title}" to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#351255",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await changePackageStatus(packageItem.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        `Package status changed to ${newStatus}.`,
                    confirmButtonColor: "#351255",
                });

                fetchPackages();
            }
        } catch (error) {
            console.error("Package status change error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change package status.",
                confirmButtonColor: "#351255",
            });
        }
    };

    const handleDelete = async (packageItem) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Package?",
            text: `Are you sure you want to delete "${packageItem.title}"?`,
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
            const response = await deletePackage(packageItem.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Package deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                fetchPackages();
            }
        } catch (error) {
            console.error("Package delete error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete package.",
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

                    <div className="package-page">

                        <div className="package-header">
                            <div>
                                <h1>Packages</h1>

                                <p>
                                    Manage travel and adventure packages available in Trip Himalaya.
                                </p>
                            </div>

                            <button
                                className="create-package-button"
                                onClick={() => navigate("/packages/create")}
                            >
                                <span>+</span>
                                Create Package
                            </button>
                        </div>

                        <div className="package-table-card">

                            <div className="package-table-header">
                                <div>
                                    <h2>Package List</h2>

                                    <p>
                                        {packages.length}{" "}
                                        {packages.length === 1
                                            ? "package"
                                            : "packages"}
                                    </p>
                                </div>
                            </div>

                            <div className="package-table-responsive">

                                <table className="package-table">

                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Package</th>
                                            <th>Category</th>
                                            <th>Duration</th>
                                            <th>Price</th>
                                            <th>People</th>
                                            <th>Featured</th>
                                            <th>Status</th>
                                            <th className="package-action-column">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="package-table-message"
                                                >
                                                    <div className="package-loader"></div>
                                                    Loading packages...
                                                </td>
                                            </tr>
                                        ) : packages.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="package-table-message"
                                                >
                                                    No packages found.
                                                </td>
                                            </tr>
                                        ) : (
                                            packages.map((packageItem, index) => (
                                                <tr key={packageItem.id}>

                                                    <td>
                                                        {(page - 1) * 10 + index + 1}
                                                    </td>

                                                    <td>
                                                        <div className="package-info">

                                                            {packageItem.image ? (
                                                                <img
                                                                    src={packageItem.image}
                                                                    alt={packageItem.title}
                                                                    className="package-image"
                                                                />
                                                            ) : (
                                                                <div className="package-image-placeholder">
                                                                    No Image
                                                                </div>
                                                            )}

                                                            <div>
                                                                <span className="package-title">
                                                                    {packageItem.title}
                                                                </span>

                                                                <span className="package-location">
                                                                    {packageItem.location || "-"}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </td>

                                                    <td>
                                                        {packageItem.category?.name || "-"}
                                                    </td>

                                                    <td>
                                                        {packageItem.duration || "-"}
                                                    </td>

                                                    <td>
                                                        <span className="package-price">
                                                            {packageItem.price
                                                                ? `Rs. ${packageItem.price}`
                                                                : "-"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {packageItem.min_people}

                                                        {packageItem.max_people
                                                            ? ` - ${packageItem.max_people}`
                                                            : ""}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`featured-badge ${
                                                                packageItem.is_featured
                                                                    ? "featured-yes"
                                                                    : "featured-no"
                                                            }`}
                                                        >
                                                            {packageItem.is_featured
                                                                ? "YES"
                                                                : "NO"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`package-status-badge ${
                                                                packageItem.status === "ACTIVE"
                                                                    ? "package-status-active"
                                                                    : "package-status-inactive"
                                                            }`}
                                                            onClick={() =>
                                                                handleStatusChange(packageItem)
                                                            }
                                                        >
                                                            {packageItem.status}
                                                        </span>
                                                    </td>

                                                    <td className="package-action-column">

                                                        <div className="package-action-buttons">

                                                            <button
                                                                className="package-edit-button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/packages/edit/${packageItem.id}`
                                                                    )
                                                                }
                                                            >
                                                                <FaPen />
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="package-delete-button"
                                                                onClick={() =>
                                                                    handleDelete(packageItem)
                                                                }
                                                            >
                                                                <FaTrash />
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            ))
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
};

export default Package;