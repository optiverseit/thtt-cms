import { useEffect, useState } from "react";
import { FaTrash, FaEye, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import Swal from "sweetalert2";

import {
    getAllBookingsCms,
    deleteBooking,
    getHeliBookingDocuments,
} from "../../../api/BackendApi";

import "./Booking.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const Booking = () => {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);

    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [heliDocuments, setHeliDocuments] = useState([]);
    const [documentLoading, setDocumentLoading] = useState(false);

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
                text: error.response?.data?.message || "Unable to fetch bookings.",
                confirmButtonColor: "#351255",
            });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page]);

    const handleDelete = async (booking) => {

        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Booking?",
            text: `Are you sure you want to delete "${booking.booking_reference || `Booking #${booking.id}`}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {

            const response = await deleteBooking(booking.id);

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text: response.data?.message || "Booking deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (bookings.length === 1 && page > 1) {
                    setPage((prev) => prev - 1);
                } else {
                    fetchBookings();
                }
            }

        } catch (error) {

            console.error("Booking delete error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: error.response?.data?.message || "Unable to delete booking.",
                confirmButtonColor: "#351255",
            });
        }
    };

    const handleViewDocuments = async (booking) => {
        try {
            setSelectedBooking(booking);
            setShowDocumentModal(true);
            setDocumentLoading(true);
            setHeliDocuments([]);

            const response = await getHeliBookingDocuments(
                booking.id,
                booking.package_id
            );

            if (response.data?.status) {
                setHeliDocuments(response.data.data || []);
            }

        } catch (error) {
            console.error("Heli document fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch heli documents.",
                confirmButtonColor: "#351255",
            });

        } finally {
            setDocumentLoading(false);
        }
    };

    const closeDocumentModal = () => {
        setShowDocumentModal(false);
        setSelectedBooking(null);
        setHeliDocuments([]);
    };

    const formatDate = (date) => {
        if (!date) return "null";
        return new Date(date).toLocaleDateString();
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return "null";
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

    const getHeliDocuments = () => {
        return heliDocuments;
    };

    const documents = getHeliDocuments();

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">

                    <div className="booking-page">

                        {/* HEADER */}
                        <div className="booking-header">

                            <div>
                                <h1>Bookings</h1>
                                <p>
                                    View and manage customer bookings in Trip Himalaya.
                                </p>
                            </div>

                        </div>

                        {/* TABLE CARD */}
                        <div className="booking-table-card">

                            <div className="booking-table-header">

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

                            <div className="booking-table-responsive">

                                <table className="booking-table">

                                    <thead>

                                        <tr>
                                            <th>S.N.</th>
                                            <th>Booking Reference</th>
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
                                                    <div className="booking-loader"></div>
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

                                            bookings.map((booking, index) => (

                                                <tr key={booking.id}>

                                                    <td>
                                                        {(page - 1) * 10 + index + 1}
                                                    </td>

                                                    <td>
                                                        <span className="booking-reference">
                                                            {booking.booking_reference || "null"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {booking.user_id ?? "null"}
                                                    </td>

                                                    <td>
                                                        <span className="booking-type">
                                                            {booking.booking_type ?? "null"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {booking.package_id ?? "null"}
                                                    </td>

                                                    <td>
                                                        {booking.pricing_tier_id ?? "null"}
                                                    </td>

                                                    <td>
                                                        {getVehicleId(booking)}
                                                    </td>

                                                    <td>
                                                        {getHeliId(booking)}
                                                    </td>

                                                    <td>
                                                        {booking.number_of_people ?? "null"}
                                                    </td>

                                                    <td>
                                                        {formatDate(booking.start_date)}
                                                    </td>

                                                    <td>
                                                        {formatDate(booking.end_date)}
                                                    </td>

                                                    <td>
                                                        <span className="booking-amount">
                                                            {formatAmount(booking.total_amount)}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                booking.status
                                                            )}`}
                                                        >
                                                            {booking.status ?? "null"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                booking.payment_status
                                                            )}`}
                                                        >
                                                            {booking.payment_status ?? "null"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {booking.created_at
                                                            ? new Date(
                                                                booking.created_at
                                                            ).toLocaleDateString()
                                                            : "null"}
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="action-column">

                                                        <div className="action-buttons">

                                                            {booking.booking_type === "HELI" ? (

                                                                <button
                                                                    type="button"
                                                                    className="view-document-button"
                                                                    onClick={() =>
                                                                        handleViewDocuments(booking)
                                                                    }
                                                                >
                                                                    <FaEye />
                                                                    View Documents
                                                                </button>

                                                            ) : (

                                                                <button
                                                                    type="button"
                                                                    className="delete-button"
                                                                    onClick={() =>
                                                                        handleDelete(booking)
                                                                    }
                                                                >
                                                                    <FaTrash />
                                                                    Delete
                                                                </button>

                                                            )}

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

            {/* HELI DOCUMENT MODAL */}
            {showDocumentModal && selectedBooking && (

                <div
                    className="booking-modal-overlay"
                    onClick={closeDocumentModal}
                >

                    <div
                        className="booking-document-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="booking-modal-header">

                            <div>
                                <h2>Helicopter Booking Documents</h2>

                                <p>
                                    {selectedBooking.booking_reference ||
                                        `Booking #${selectedBooking.id}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="booking-modal-close"
                                onClick={closeDocumentModal}
                            >
                                <FaTimes />
                            </button>

                        </div>

                        <div className="booking-modal-body">

                            <div className="booking-modal-summary">

                                <div>
                                    <span>Booking ID</span>
                                    <strong>
                                        {selectedBooking.id}
                                    </strong>
                                </div>

                                <div>
                                    <span>Package ID</span>
                                    <strong>
                                        {selectedBooking.package_id ?? "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Passengers</span>
                                    <strong>
                                        {selectedBooking.number_of_people ?? "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Start Date</span>
                                    <strong>
                                        {formatDate(selectedBooking.start_date)}
                                    </strong>
                                </div>

                            </div>

                            {documentLoading ? (

                                <div className="booking-document-empty">
                                    <div className="booking-loader"></div>
                                    Loading documents...
                                </div>

                            ) : documents.length === 0 ? (

                                <div className="booking-document-empty">
                                    No traveller documents found for this booking.
                                </div>

                            ) : (

                                <div className="booking-traveller-list">

                                    {documents.map((document, index) => (

                                        <div
                                            className="booking-traveller-card"
                                            key={document.id || index}
                                        >

                                            <div className="booking-traveller-header">

                                                <div>
                                                    <span>
                                                        Traveller {index + 1}
                                                    </span>

                                                    <h3>
                                                        {document.name || "Unnamed Traveller"}
                                                    </h3>
                                                </div>

                                                <span className="booking-traveller-number">
                                                    #{index + 1}
                                                </span>

                                            </div>

                                            <div className="booking-traveller-info">

                                                <div>
                                                    <span>Name</span>
                                                    <strong>
                                                        {document.name || "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Nationality</span>
                                                    <strong>
                                                        {document.nationality || "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Identity Number</span>
                                                    <strong>
                                                        {document.identity_number || "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Weight</span>
                                                    <strong>
                                                        {document.weight
                                                            ? `${document.weight} kg`
                                                            : "-"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Luggage</span>
                                                    <strong>
                                                        {document.luggage
                                                            ? `${document.luggage} kg`
                                                            : "-"}
                                                    </strong>
                                                </div>

                                            </div>

                                            <div className="booking-document-files">

                                                {document.passport_nid_image && (

                                                    <a
                                                        href={document.passport_nid_image}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        Passport / NID
                                                    </a>

                                                )}

                                                {document.pp_size_photo && (

                                                    <a
                                                        href={document.pp_size_photo}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        PP Size Photo
                                                    </a>

                                                )}

                                                {document.confirmed_flight_ticket_image && (

                                                    <a
                                                        href={document.confirmed_flight_ticket_image}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        Flight Ticket
                                                    </a>

                                                )}

                                                {document.travel_insurance_image && (

                                                    <a
                                                        href={document.travel_insurance_image}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        Travel Insurance
                                                    </a>

                                                )}

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Booking;