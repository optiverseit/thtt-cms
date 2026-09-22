import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import {
    getAllVehiclesCms,
    changeVehicleStatus,
    deleteVehicle,
} from "../../../api/BackendApi";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./Vehicle.css";

const Vehicle = () => {
    const navigate = useNavigate();

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLoadingId, setStatusLoadingId] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);

            const response = await getAllVehiclesCms();

            if (response.data?.status) {
                setVehicles(response.data.data || []);
            }
        } catch (error) {
            console.error("Vehicle fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load vehicles.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (vehicle) => {
        const newStatus =
            vehicle.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result = await Swal.fire({
            icon: "question",
            title: "Change Status?",
            text: `Change "${vehicle.name}" to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Change",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#351255",
            cancelButtonColor: "#77717d",
        });

        if (!result.isConfirmed) return;

        try {
            setStatusLoadingId(vehicle.id);

            const response =
                await changeVehicleStatus(vehicle.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        "Vehicle status changed successfully.",
                    confirmButtonColor: "#351255",
                    timer: 1300,
                    showConfirmButton: false,
                });

                fetchVehicles();
            }
        } catch (error) {
            console.error(
                "Vehicle status error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change vehicle status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDelete = async (vehicle) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Vehicle?",
            text: `Are you sure you want to delete "${vehicle.name}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {
            const response =
                await deleteVehicle(vehicle.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Vehicle deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                fetchVehicles();
            }
        } catch (error) {
            console.error(
                "Vehicle delete error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete vehicle.",
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
                    <div className="vehicle-page">

                        <div className="vehicle-header">
                            <div>
                                <h1>Vehicles</h1>
                                <p>
                                    Manage vehicles available for
                                    travel packages.
                                </p>
                            </div>

                            <button
                                className="create-vehicle-button"
                                onClick={() =>
                                    navigate("/vehicles/create")
                                }
                            >
                                + Create Vehicle
                            </button>
                        </div>

                        <div className="vehicle-card">

                            {loading ? (
                                <div className="vehicle-loading">
                                    <div className="vehicle-loader"></div>
                                    <p>Loading vehicles...</p>
                                </div>
                            ) : vehicles.length === 0 ? (
                                <div className="vehicle-empty">
                                    <h3>No Vehicles Found</h3>
                                    <p>
                                        Create your first vehicle
                                        to get started.
                                    </p>
                                </div>
                            ) : (
                                <div className="vehicle-table-wrapper">
                                    <table className="vehicle-table">
                                        <thead>
                                            <tr>
                                                <th>S.N.</th>
                                                <th>Vehicle</th>
                                                <th>Route</th>
                                                <th>Capacity</th>
                                                <th>Duration</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th className="action-column">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {vehicles.map(
                                                (vehicle, index) => (
                                                    <tr key={vehicle.id}>

                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        <td>
                                                            <div className="vehicle-info">
                                                                <div className="vehicle-image">
                                                                    {vehicle.image ? (
                                                                        <img
                                                                            src={
                                                                                vehicle.image
                                                                            }
                                                                            alt={
                                                                                vehicle.name
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <div className="vehicle-image-placeholder">
                                                                            {vehicle.name
                                                                                ?.charAt(
                                                                                    0
                                                                                )
                                                                                .toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="vehicle-details">
                                                                    <span className="vehicle-name">
                                                                        {
                                                                            vehicle.name
                                                                        }
                                                                    </span>

                                                                    {vehicle.description && (
                                                                        <span className="vehicle-description">
                                                                            {
                                                                                vehicle.description
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="vehicle-route">
                                                                <span>
                                                                    {
                                                                        vehicle.from_location
                                                                    }
                                                                </span>

                                                                <span className="route-arrow">
                                                                    →
                                                                </span>

                                                                <span>
                                                                    {
                                                                        vehicle.to_location
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className="vehicle-capacity">
                                                                {
                                                                    vehicle.capacity
                                                                }{" "}
                                                                people
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {vehicle.duration ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            <span className="vehicle-price">
                                                                Rs.{" "}
                                                                {
                                                                    vehicle.price
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <button
                                                                className={`vehicle-status ${
                                                                    vehicle.status ===
                                                                    "ACTIVE"
                                                                        ? "vehicle-status-active"
                                                                        : "vehicle-status-inactive"
                                                                }`}
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        vehicle
                                                                    )
                                                                }
                                                                disabled={
                                                                    statusLoadingId ===
                                                                    vehicle.id
                                                                }
                                                            >
                                                                {statusLoadingId ===
                                                                vehicle.id
                                                                    ? "Updating..."
                                                                    : vehicle.status}
                                                            </button>
                                                        </td>

                                                        <td className="action-column">
                                                            <div className="action-buttons">

                                                                <button
                                                                    className="edit-button"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/vehicles/edit/${vehicle.id}`
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
                                                                            vehicle
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
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Vehicle;