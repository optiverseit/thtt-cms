import { useEffect, useState } from "react";
import {
    FaTrash,
    FaEye,
    FaTimes,
    FaExternalLinkAlt,
} from "react-icons/fa";
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

    // HELI DOCUMENT MODAL
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [heliDocuments, setHeliDocuments] = useState([]);
    const [documentLoading, setDocumentLoading] = useState(false);

    // PACKAGE DETAIL MODAL
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailBooking, setSelectedDetailBooking] = useState(null);

    // =========================================================
    // FETCH BOOKINGS
    // =========================================================
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

    // =========================================================
    // DELETE BOOKING
    // KEEPING THE ORIGINAL DELETE FLOW
    // =========================================================
    const handleDelete = async (booking) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Booking?",
            text: `Are you sure you want to delete "${
                booking.booking_reference ||
                `Booking #${booking.id}`
            }"?`,
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
                    text:
                        response.data?.message ||
                        "Booking deleted successfully.",
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
                text:
                    error.response?.data?.message ||
                    "Unable to delete booking.",
                confirmButtonColor: "#351255",
            });
        }
    };

    // =========================================================
    // PACKAGE VIEW DETAIL
    // =========================================================
    const handleViewDetail = (booking) => {
        setSelectedDetailBooking(booking);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDetailBooking(null);
    };

    // =========================================================
    // HELI VIEW DETAIL
    // SAME EXISTING DOCUMENT FLOW
    // =========================================================
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

    // =========================================================
    // HELPERS
    // =========================================================
    const formatDate = (date) => {
        if (!date) return "null";
        return new Date(date).toLocaleDateString();
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) {
            return "null";
        }
        return `NPR ${Number(amount).toLocaleString()}`;
    };

    const getVehicleId = (booking) => {
        const transport =
            booking.transports?.find(
                (item) => item.vehicle_id
            );
        return transport?.vehicle_id ?? "null";
    };

    const getHeliId = (booking) => {
        const transport =
            booking.transports?.find(
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

    // =========================================================
    // RENDER
    // =========================================================
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

                        {/* TABLE */}
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
                                            <th>User Email</th>
                                            <th>Type</th>
                                            <th>Package Name</th>
                                            <th>Pricing Tier</th>
                                            <th>Vehicle ID</th>
                                            <th>Heli ID</th>
                                            <th>People</th>
                                            <th>Travel Date</th>
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
                                            bookings.map(
                                                (booking, index) => (
                                                    <tr key={booking.id}>
                                                        {/* S.N. */}
                                                        <td>
                                                            {(page - 1) * 10 +
                                                                index +
                                                                1}
                                                        </td>

                                                        {/* BOOKING REFERENCE */}
                                                        <td>
                                                            <span className="booking-reference">
                                                                {booking.booking_reference ??
                                                                    "null"}
                                                            </span>
                                                        </td>

                                                        {/* USER EMAIL */}
                                                        <td>
                                                            {booking.user?.email ??
                                                                "null"}
                                                        </td>

                                                        {/* TYPE */}
                                                        <td>
                                                            <span className="booking-type">
                                                                {booking.booking_type ??
                                                                    "null"}
                                                            </span>
                                                        </td>

                                                        {/* PACKAGE NAME */}
                                                        <td>
                                                            {booking.package?.title ??
                                                                "null"}
                                                        </td>

                                                        {/* PRICING TIER */}
                                                        <td>
                                                            {booking.pricing_tier?.service ??
                                                                "null"}
                                                        </td>

                                                        {/* VEHICLE */}
                                                        <td>
                                                            {getVehicleId(
                                                                booking
                                                            )}
                                                        </td>

                                                        {/* HELI */}
                                                        <td>
                                                            {getHeliId(
                                                                booking
                                                            )}
                                                        </td>

                                                        {/* PEOPLE */}
                                                        <td>
                                                            {booking.number_of_people ??
                                                                "null"}
                                                        </td>

                                                        {/* START DATE */}
                                                        <td>
                                                            {formatDate(
                                                                booking.start_date
                                                            )}
                                                        </td>

                                                        {/* END DATE */}
                                                        <td>
                                                            {formatDate(
                                                                booking.end_date
                                                            )}
                                                        </td>

                                                        {/* TOTAL */}
                                                        <td>
                                                            <span className="booking-amount">
                                                                {formatAmount(
                                                                    booking.total_amount
                                                                )}
                                                            </span>
                                                        </td>

                                                        {/* STATUS */}
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

                                                        {/* PAYMENT STATUS */}
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

                                                        {/* CREATED */}
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
                                                                {booking.booking_type ===
                                                                "HELI" ? (
                                                                    <button
                                                                        type="button"
                                                                        className="view-document-button"
                                                                        onClick={() =>
                                                                            handleViewDocuments(
                                                                                booking
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaEye />
                                                                        View Detail
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        {/* PACKAGE VIEW DETAIL */}
                                                                        <button
                                                                            type="button"
                                                                            className="view-document-button"
                                                                            onClick={() =>
                                                                                handleViewDetail(
                                                                                    booking
                                                                                )
                                                                            }
                                                                        >
                                                                            <FaEye />
                                                                            View Detail
                                                                        </button>

                                                                        {/*
                                                                        DELETE BUTTON TEMPORARILY COMMENTED OUT.
                                                                        DELETE FUNCTION, IMPORT AND LOGIC
                                                                        ARE STILL KEPT ABOVE.

                                                                        <button
                                                                            type="button"
                                                                            className="delete-button"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    booking
                                                                                )
                                                                            }
                                                                        >
                                                                            <FaTrash />
                                                                            Delete
                                                                        </button>
                                                                        */}
                                                                    </>
                                                                )}
                                                            </div>
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

            {/* =====================================================
                PACKAGE BOOKING DETAIL MODAL
            ===================================================== */}
            {showDetailModal &&
                selectedDetailBooking && (
                    <div
                        className="booking-modal-overlay"
                        onClick={closeDetailModal}
                    >
                        <div
                            className="booking-document-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            {/* HEADER */}
                            <div className="booking-modal-header">
                                <div>
                                    <h2>
                                        Booking Details
                                    </h2>
                                    <p>
                                        {selectedDetailBooking.booking_reference ||
                                            `Booking #${selectedDetailBooking.id}`}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="booking-modal-close"
                                    onClick={
                                        closeDetailModal
                                    }
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="booking-modal-body">
                                {/* BOOKING */}
                                <div className="booking-modal-summary">
                                    <div>
                                        <span>
                                            Booking ID
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.id ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Booking Reference
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.booking_reference ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Booking Type
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.booking_type ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Package
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.package
                                                ?.title ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Pricing Tier
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.pricing_tier
                                                ?.service ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Age Group
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.pricing_tier
                                                ?.age_group ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Number of People
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.number_of_people ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Start Date
                                        </span>
                                        <strong>
                                            {formatDate(
                                                selectedDetailBooking.start_date
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            End Date
                                        </span>
                                        <strong>
                                            {formatDate(
                                                selectedDetailBooking.end_date
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Total Amount
                                        </span>
                                        <strong>
                                            {formatAmount(
                                                selectedDetailBooking.total_amount
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Status
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.status ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Payment Status
                                        </span>
                                        <strong>
                                            {selectedDetailBooking.payment_status ??
                                                "-"}
                                        </strong>
                                    </div>
                                </div>

                                {/* USER DETAILS */}
                                <div
                                    style={{
                                        marginTop: "24px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            marginBottom:
                                                "15px",
                                            color: "#351255",
                                        }}
                                    >
                                        User Details
                                    </h3>

                                    <div className="booking-modal-summary">
                                        <div>
                                            <span>
                                                Name
                                            </span>
                                            <strong>
                                                {[
                                                    selectedDetailBooking
                                                        .user
                                                        ?.first_name,
                                                    selectedDetailBooking
                                                        .user
                                                        ?.middle_name,
                                                    selectedDetailBooking
                                                        .user
                                                        ?.last_name,
                                                ]
                                                    .filter(
                                                        Boolean
                                                    )
                                                    .join(
                                                        " "
                                                    ) ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Email
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.email ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Phone
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.country_code ||
                                                    ""}
                                                {selectedDetailBooking.user
                                                    ?.phone ||
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Gender
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.gender ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Date of Birth
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.date_of_birth
                                                    ? formatDate(
                                                        selectedDetailBooking
                                                            .user
                                                            .date_of_birth
                                                    )
                                                    : "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Nationality
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.nationality ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Address
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.address ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                City
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.city ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                State
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.state ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Country
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.country ??
                                                    "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Postal Code
                                            </span>
                                            <strong>
                                                {selectedDetailBooking.user
                                                    ?.postal_code ??
                                                    "-"}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                {/* PACKAGE APPLICANT DETAILS */}
                                {selectedDetailBooking.package_applicants &&
                                    selectedDetailBooking.package_applicants.length >
                                        0 && (
                                        <div
                                            style={{
                                                marginTop:
                                                    "24px",
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    marginBottom:
                                                        "15px",
                                                    color:
                                                        "#351255",
                                                }}
                                            >
                                                Applicant Details
                                            </h3>

                                            {selectedDetailBooking.package_applicants.map(
                                                (
                                                    applicant,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            applicant.id ||
                                                            index
                                                        }
                                                        style={{
                                                            marginBottom:
                                                                "18px",
                                                        }}
                                                    >
                                                        {selectedDetailBooking.package_applicants.length >
                                                            1 && (
                                                            <h4
                                                                style={{
                                                                    marginBottom:
                                                                        "10px",
                                                                    color:
                                                                        "#351255",
                                                                }}
                                                            >
                                                                Applicant{" "}
                                                                {index +
                                                                    1}
                                                            </h4>
                                                        )}

                                                        <div className="booking-modal-summary">
                                                            <div>
                                                                <span>
                                                                    Full Name
                                                                </span>
                                                                <strong>
                                                                    {applicant.full_name ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Email Address
                                                                </span>
                                                                <strong>
                                                                    {applicant.email ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Phone / WhatsApp
                                                                </span>
                                                                <strong>
                                                                    {applicant.phone_whatsapp ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Travel Date
                                                                </span>
                                                                <strong>
                                                                    {formatDate(
                                                                        selectedDetailBooking.start_date
                                                                    )}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Nationality
                                                                </span>
                                                                <strong>
                                                                    {applicant.nationality ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Pickup / Hotel in Nepal
                                                                </span>
                                                                <strong>
                                                                    {applicant.pickup_hotel ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span>
                                                                    Dietary / Health Notes
                                                                </span>
                                                                <strong>
                                                                    {applicant.dietary_health_notes ||
                                                                        "-"}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        {applicant.document && (
                                                            <div
                                                                className="booking-document-files"
                                                                style={{
                                                                    marginTop:
                                                                        "12px",
                                                                }}
                                                            >
                                                                <a
                                                                    href={
                                                                        applicant.document
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="booking-document-link"
                                                                >
                                                                    <FaExternalLinkAlt />
                                                                    Applicant Document
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

            {/* =====================================================
                HELI DOCUMENT MODAL
                EXISTING FLOW
            ===================================================== */}
            {showDocumentModal &&
                selectedBooking && (
                    <div
                        className="booking-modal-overlay"
                        onClick={
                            closeDocumentModal
                        }
                    >
                        <div
                            className="booking-document-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            {/* HEADER */}
                            <div className="booking-modal-header">
                                <div>
                                    <h2>
                                        Helicopter Booking Documents
                                    </h2>
                                    <p>
                                        {selectedBooking.booking_reference ||
                                            `Booking #${selectedBooking.id}`}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="booking-modal-close"
                                    onClick={
                                        closeDocumentModal
                                    }
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="booking-modal-body">
                                <div className="booking-modal-summary">
                                    <div>
                                        <span>
                                            Booking ID
                                        </span>
                                        <strong>
                                            {selectedBooking.id}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Package ID
                                        </span>
                                        <strong>
                                            {selectedBooking.package_id ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Passengers
                                        </span>
                                        <strong>
                                            {selectedBooking.number_of_people ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Start Date
                                        </span>
                                        <strong>
                                            {formatDate(
                                                selectedBooking.start_date
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                {documentLoading ? (
                                    <div className="booking-document-empty">
                                        <div className="booking-loader"></div>
                                        Loading documents...
                                    </div>
                                ) : heliDocuments.length ===
                                  0 ? (
                                    <div className="booking-document-empty">
                                        No traveller documents found for this booking.
                                    </div>
                                ) : (
                                    <div className="booking-traveller-list">
                                        {heliDocuments.map(
                                            (
                                                document,
                                                index
                                            ) => (
                                                <div
                                                    className="booking-traveller-card"
                                                    key={
                                                        document.id ||
                                                        index
                                                    }
                                                >
                                                    <div className="booking-traveller-header">
                                                        <div>
                                                            <span>
                                                                Traveller{" "}
                                                                {index +
                                                                    1}
                                                            </span>
                                                            <h3>
                                                                {document.name ||
                                                                    "Unnamed Traveller"}
                                                            </h3>
                                                        </div>

                                                        <span className="booking-traveller-number">
                                                            #
                                                            {index +
                                                                1}
                                                        </span>
                                                    </div>

                                                    <div className="booking-traveller-info">
                                                        <div>
                                                            <span>
                                                                Name
                                                            </span>
                                                            <strong>
                                                                {document.name ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                Nationality
                                                            </span>
                                                            <strong>
                                                                {document.nationality ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                Identity Number
                                                            </span>
                                                            <strong>
                                                                {document.identity_number ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                Weight
                                                            </span>
                                                            <strong>
                                                                {document.weight
                                                                    ? `${document.weight} kg`
                                                                    : "-"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                Luggage
                                                            </span>
                                                            <strong>
                                                                {document.luggage
                                                                    ? `${document.luggage} kg`
                                                                    : "-"}
                                                            </strong>
                                                        </div>

                                                        {/* NEW HELI FIELDS */}
                                                        <div>
                                                            <span>
                                                                Email Address
                                                            </span>
                                                            <strong>
                                                                {document.email ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                WhatsApp Phone Number
                                                            </span>
                                                            <strong>
                                                                {document.phone_whatsapp ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                Preferred Flight Date
                                                            </span>
                                                            <strong>
                                                                {document.preferred_flight_date
                                                                    ? formatDate(
                                                                        document.preferred_flight_date
                                                                    )
                                                                    : "-"}
                                                            </strong>
                                                        </div>

                                                        <div>
                                                            <span>
                                                                Pickup Hotel in Kathmandu / Pokhara
                                                            </span>
                                                            <strong>
                                                                {document.pickup_hotel ||
                                                                    "-"}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div className="booking-document-files">
                                                        {document.passport_nid_image && (
                                                            <a
                                                                href={
                                                                    document.passport_nid_image
                                                                }
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
                                                                href={
                                                                    document.pp_size_photo
                                                                }
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
                                                                href={
                                                                    document.confirmed_flight_ticket_image
                                                                }
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
                                                                href={
                                                                    document.travel_insurance_image
                                                                }
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
                                            )
                                        )}
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