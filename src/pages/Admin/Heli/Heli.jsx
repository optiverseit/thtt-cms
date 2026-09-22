import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";

import {
    getAllHelisCms,
    changeHeliStatus,
    deleteHeli,
} from "../../../api/BackendApi";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";
import "./Heli.css";

const Heli = () => {
    const navigate = useNavigate();

    const [helis, setHelis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLoadingId, setStatusLoadingId] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchHelis();
    }, [page]);

    const fetchHelis = async () => {
        try {
            setLoading(true);

            const response = await getAllHelisCms(page);

            if (response.data?.status) {
                setHelis(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Heli fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load helicopters.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (heli) => {
        const newStatus =
            heli.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result = await Swal.fire({
            icon: "question",
            title: "Change Status?",
            text: `Change "${heli.name}" to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Change",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#351255",
            cancelButtonColor: "#77717d",
        });

        if (!result.isConfirmed) return;

        try {
            setStatusLoadingId(heli.id);

            const response =
                await changeHeliStatus(heli.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        "Helicopter status changed successfully.",
                    timer: 1300,
                    showConfirmButton: false,
                });

                fetchHelis();
            }
        } catch (error) {
            console.error(
                "Heli status error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change helicopter status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDelete = async (heli) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Helicopter?",
            text: `Are you sure you want to delete "${heli.name}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {
            const response =
                await deleteHeli(heli.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Helicopter deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                fetchHelis();
            }
        } catch (error) {
            console.error(
                "Heli delete error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete helicopter.",
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
                    <div className="heli-page">

                        <div className="heli-header">
                            <div>
                                <h1>Helicopters</h1>
                                <p>
                                    Manage helicopters available
                                    for travel packages.
                                </p>
                            </div>

                            <button
                                className="create-heli-button"
                                onClick={() =>
                                    navigate("/helis/create")
                                }
                            >
                                + Create Helicopter
                            </button>
                        </div>

                        <div className="heli-card">

                            {loading ? (
                                <div className="heli-loading">
                                    <div className="heli-loader"></div>
                                    <p>
                                        Loading helicopters...
                                    </p>
                                </div>
                            ) : helis.length === 0 ? (
                                <div className="heli-empty">
                                    <h3>
                                        No Helicopters Found
                                    </h3>

                                    <p>
                                        Create your first
                                        helicopter to get started.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="heli-table-wrapper">

                                        <table className="heli-table">
                                            <thead>
                                                <tr>
                                                    <th>S.N.</th>
                                                    <th>
                                                        Helicopter
                                                    </th>
                                                    <th>Route</th>
                                                    <th>
                                                        Capacity
                                                    </th>
                                                    <th>
                                                        Duration
                                                    </th>
                                                    <th>Price</th>
                                                    <th>Status</th>
                                                    <th className="action-column">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {helis.map(
                                                    (heli, index) => (
                                                        <tr
                                                            key={
                                                                heli.id
                                                            }
                                                        >
                                                            <td>
                                                                {(page - 1) * 10 + index + 1}
                                                            </td>

                                                            <td>
                                                                <div className="heli-info">

                                                                    <div className="heli-image">
                                                                        {heli.image ? (
                                                                            <img
                                                                                src={
                                                                                    heli.image
                                                                                }
                                                                                alt={
                                                                                    heli.name
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <div className="heli-image-placeholder">
                                                                                {heli.name
                                                                                    ?.charAt(
                                                                                        0
                                                                                    )
                                                                                    .toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="heli-details">
                                                                        <span className="heli-name">
                                                                            {
                                                                                heli.name
                                                                            }
                                                                        </span>

                                                                        {heli.description && (
                                                                            <span className="heli-description">
                                                                                {
                                                                                    heli.description
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className="heli-route">
                                                                    <span>
                                                                        {
                                                                            heli.from_location
                                                                        }
                                                                    </span>

                                                                    <span className="heli-route-arrow">
                                                                        →
                                                                    </span>

                                                                    <span>
                                                                        {
                                                                            heli.to_location
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span className="heli-capacity">
                                                                    {
                                                                        heli.capacity
                                                                    }{" "}
                                                                    people
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {heli.duration ||
                                                                    "-"}
                                                            </td>

                                                            <td>
                                                                <span className="heli-price">
                                                                    Rs.{" "}
                                                                    {
                                                                        heli.price
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <button
                                                                    className={`heli-status ${
                                                                        heli.status ===
                                                                        "ACTIVE"
                                                                            ? "heli-status-active"
                                                                            : "heli-status-inactive"
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            heli
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        statusLoadingId ===
                                                                        heli.id
                                                                    }
                                                                >
                                                                    {statusLoadingId ===
                                                                    heli.id
                                                                        ? "Updating..."
                                                                        : heli.status}
                                                                </button>
                                                            </td>

                                                            <td className="action-column">
                                                                <div className="action-buttons">

                                                                    <button
                                                                        className="edit-button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/helis/edit/${heli.id}`
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaPen />
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        className="delete-button"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                heli
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaTrash />
                                                                        Delete
                                                                    </button>

                                                                </div>
                                                            </td>

                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Pagination
                                        page={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Heli;