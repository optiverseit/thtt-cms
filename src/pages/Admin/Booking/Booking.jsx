import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

import {
    getAllBookingsCms,
    deleteBooking,
} from "../../../api/BackendApi";

import "./Booking.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const Booking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);

    const fetchBookings = async () => {
        try {
            setLoading(true);

            const response = await getAllBookingsCms(page);

            if (response.data?.status) {
                setBookings(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
                setTotalBookings(response.data.data.total || 0);
            }
        } catch (error) {
            console.error("Booking fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch bookings.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page]);

    // const handleDelete = async (booking) => {
    //     const result = await Swal.fire({
    //         icon: "warning",
    //         title: "Delete Booking?",
    //         text: `Are you sure you want to delete "${
    //             booking.booking_reference || `Booking #${booking.id}`
    //         }"?`,
    //         showCancelButton: true,
    //         confirmButtonText: "Yes, Delete",
    //         cancelButtonText: "Cancel",
    //         confirmButtonColor: "#d33",
    //         cancelButtonColor: "#351255",
    //     });

    //     if (!result.isConfirmed) {
    //         return;
    //     }

    //     try {
    //         const response = await deleteBooking(booking.id);

    //         if (response.data?.status) {
    //             await Swal.fire({
    //                 icon: "success",
    //                 title: "Deleted",
    //                 text:
    //                     response.data?.message ||
    //                     "Booking deleted successfully.",
    //                 confirmButtonColor: "#351255",
    //             });

    //             // If last item on current page was deleted,
    //             // move to previous page when possible.
    //             if (bookings.length === 1 && page > 1) {
    //                 setPage((prev) => prev - 1);
    //             } else {
    //                 fetchBookings();
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Booking delete error:", error);

    //         Swal.fire({
    //             icon: "error",
    //             title: "Delete Failed",
    //             text:
    //                 error.response?.data?.message ||
    //                 "Unable to delete booking.",
    //             confirmButtonColor: "#351255",
    //         });
    //     }
    // };

    const formatDate = (date) => {
        if (!date) {
            return "null";
        }

        return new Date(date).toLocaleDateString();
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) {
            return "null";
        }

        return `NPR ${Number(amount).toLocaleString()}`;
    };

    const getVehicleId = (booking) => {
        const transport = booking.transports?.find(
            (item) => item.vehicle_id
        );

        return transport?.vehicle_id ?? "null";
    };

    const getHeliId = (booking) => {
        const transport = booking.transports?.find(
            (item) => item.heli_id
        );

        return transport?.heli_id ?? "null";
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "CONFIRMED":
            case "COMPLETED":
            case "PAID":
                return "status-active";

            case "CANCELLED":
            case "FAILED":
                return "status-inactive";

            default:
                return "status-pending";
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="category-page">

                        {/* HEADER */}
                        <div className="category-header">
                            <div>
                                <h1>Bookings</h1>

                                <p>
                                    View and manage customer bookings in
                                    Trip Himalaya.
                                </p>
                            </div>

                            {/* 
                                No Create button.
                                Bookings are created by customers.
                            */}
                        </div>

                        <div className="category-table-card">

                            {/* TABLE HEADER */}
                            <div className="category-table-header">
                                <div>
                                    <h2>Booking List</h2>

                                    <p>
                                        {totalBookings}{" "}
                                        {totalBookings === 1
                                            ? "booking"
                                            : "bookings"}
                                    </p>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="category-table">

                                    <thead>
                                        <tr>
                                            <th>S.N.</th>

                                            <th>
                                                Booking Reference
                                            </th>

                                            <th>User ID</th>

                                            <th>Type</th>

                                            <th>Package ID</th>

                                            <th>Pricing Tier ID</th>

                                            <th>Vehicle ID</th>

                                            <th>Heli ID</th>

                                            <th>People</th>

                                            <th>Start Date</th>

                                            <th>End Date</th>

                                            <th>Total Amount</th>

                                            <th>Status</th>

                                            <th>Payment Status</th>

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
                                                    colSpan="16"
                                                    className="table-message"
                                                >
                                                    <div className="category-loader"></div>

                                                    Loading bookings...
                                                </td>
                                            </tr>
                                        ) : bookings.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="16"
                                                    className="table-message"
                                                >
                                                    No bookings found.
                                                </td>
                                            </tr>
                                        ) : (
                                            bookings.map(
                                                (booking, index) => (
                                                    <tr key={booking.id}>

                                                        {/* S.N. */}
                                                        <td>
                                                            {(page - 1) *
                                                                10 +
                                                                index +
                                                                1}
                                                        </td>

                                                        {/* Reference */}
                                                        <td>
                                                            <span className="category-name">
                                                                {booking.booking_reference ||
                                                                    "null"}
                                                            </span>
                                                        </td>

                                                        {/* User */}
                                                        <td>
                                                            {booking.user_id ??
                                                                "null"}
                                                        </td>

                                                        {/* Type */}
                                                        <td>
                                                            {booking.booking_type ??
                                                                "null"}
                                                        </td>

                                                        {/* Package */}
                                                        <td>
                                                            {booking.package_id ??
                                                                "null"}
                                                        </td>

                                                        {/* Pricing Tier */}
                                                        <td>
                                                            {booking.pricing_tier_id ??
                                                                "null"}
                                                        </td>

                                                        {/* Vehicle */}
                                                        <td>
                                                            {getVehicleId(
                                                                booking
                                                            )}
                                                        </td>

                                                        {/* Heli */}
                                                        <td>
                                                            {getHeliId(
                                                                booking
                                                            )}
                                                        </td>

                                                        {/* People */}
                                                        <td>
                                                            {booking.number_of_people ??
                                                                "null"}
                                                        </td>

                                                        {/* Start */}
                                                        <td>
                                                            {formatDate(
                                                                booking.start_date
                                                            )}
                                                        </td>

                                                        {/* End */}
                                                        <td>
                                                            {formatDate(
                                                                booking.end_date
                                                            )}
                                                        </td>

                                                        {/* Amount */}
                                                        <td>
                                                            {formatAmount(
                                                                booking.total_amount
                                                            )}
                                                        </td>

                                                        {/* STATUS - DISPLAY ONLY */}
                                                        <td>
                                                            <span
                                                                className={`status-badge ${getStatusClass(
                                                                    booking.status
                                                                )}`}
                                                            >
                                                                {booking.status ??
                                                                    "null"}
                                                            </span>
                                                        </td>

                                                        {/* PAYMENT STATUS - DISPLAY ONLY */}
                                                        <td>
                                                            <span
                                                                className={`status-badge ${getStatusClass(
                                                                    booking.payment_status
                                                                )}`}
                                                            >
                                                                {booking.payment_status ??
                                                                    "null"}
                                                            </span>
                                                        </td>

                                                        {/* Created */}
                                                        <td>
                                                            {booking.created_at
                                                                ? new Date(
                                                                      booking.created_at
                                                                  ).toLocaleDateString()
                                                                : "null"}
                                                        </td>

                                                        {/* ACTIONS */}
                                                        <td className="action-column">

                                                            {/*
                                                            EDIT DISABLED FOR NOW

                                                            <button
                                                                className="edit-button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/bookings/edit/${booking.id}`
                                                                    )
                                                                }
                                                            >
                                                                <FaPen />
                                                            </button>
                                                            */}

                                                            {/* <button
                                                                className="delete-button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        booking
                                                                    )
                                                                }
                                                            >
                                                                <FaTrash />
                                                            </button> */}

                                                        </td>
                                                    </tr>
                                                )
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
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Booking;