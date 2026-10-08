
import { useEffect, useState } from "react";
import {
    FaTrash,
    FaEye,
    FaTimes,
    FaExternalLinkAlt,
    FaEdit,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
    getAllBookingsCms,
    deleteBooking,
    getHeliBookingDocuments,
    updateBookingStatusCms,
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

    // UPDATE STATUS MODAL
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusBooking, setStatusBooking] = useState(null);
    const [bookingStatus, setBookingStatus] = useState("PENDING");
    const [paymentStatus, setPaymentStatus] = useState("PENDING");
    const [savingStatus, setSavingStatus] = useState(false);

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
    // =========================================================
    const handleDelete = async (booking) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Booking?",
            text: `Are you sure you want to delete "${booking.booking_reference || `Booking #${booking.id}`
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
    // UPDATE STATUS
    // =========================================================
    const getPayLaterPayment = (booking) => {
        const payments = Array.isArray(booking?.payments)
            ? booking.payments
            : [];

        return [...payments]
            .filter((payment) => payment.provider === "PAYLATER")
            .sort((a, b) => Number(b.id) - Number(a.id))[0] || null;
    };

    const canEditPaymentStatus = (booking) => {
        if (!booking) return false;

        const payments = Array.isArray(booking.payments)
            ? booking.payments
            : [];

        const payLaterPayment = getPayLaterPayment(booking);

        if (!payLaterPayment) return false;

        if (booking.payment_status === "PAID") return false;

        if (payLaterPayment.status === "PAID") return false;

        if (payments.some((payment) => payment.status === "PAID")) {
            return false;
        }

        return true;
    };

    const handleOpenStatusModal = (booking) => {
        setStatusBooking(booking);
        setBookingStatus(booking.status || "PENDING");
        setPaymentStatus(booking.payment_status || "PENDING");
        setShowStatusModal(true);
    };

    const closeStatusModal = () => {
        if (savingStatus) return;

        setShowStatusModal(false);
        setStatusBooking(null);
    };


    const handleUpdateStatus = async () => {
        if (!statusBooking || savingStatus) return;

        const bookingId = statusBooking.id;
        const payload = {};

        if (bookingStatus !== statusBooking.status) {
            payload.status = bookingStatus;
        }

        if (
            canEditPaymentStatus(statusBooking) &&
            paymentStatus !== statusBooking.payment_status
        ) {
            payload.payment_status = paymentStatus;
        }

        if (Object.keys(payload).length === 0) {
            setShowStatusModal(false);
            setStatusBooking(null);

            await Swal.fire({
                icon: "info",
                title: "No Changes",
                text: "You have not changed any status.",
                confirmButtonColor: "#351255",
            });
            return;
        }

        // Close the modal before opening SweetAlert.
        setShowStatusModal(false);
        setStatusBooking(null);

        // Let React render the closed modal first.
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (payload.payment_status === "PAID") {
            const confirmation = await Swal.fire({
                icon: "warning",
                title: "Confirm Payment?",
                text:
                    "This will mark the PAYLATER payment as PAID. " +
                    "You cannot change its payment status afterward.",
                showCancelButton: true,
                confirmButtonText: "Yes, Mark as Paid",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#351255",
            });

            if (!confirmation.isConfirmed) {
                return;
            }
        }

        try {
            setSavingStatus(true);

            const response = await updateBookingStatusCms(
                bookingId,
                payload
            );

            if (response.data?.status) {
                await fetchBookings();

                await Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text:
                        response.data?.message ||
                        "Booking status updated successfully.",
                    confirmButtonColor: "#351255",
                });
            } else {
                throw new Error(
                    response.data?.message || "Update failed."
                );
            }
        } catch (error) {
            console.error("Booking status update error:", error);

            await Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to update booking status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSavingStatus(false);
        }
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

    const renderDetailField = (label, value) => (
        <div>
            <span>{label}</span>
            <strong>{value ?? "-"}</strong>
        </div>
    );

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
                                    View and manage customer bookings in
                                    Trip Himalaya.
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
                                            bookings.map((booking, index) => (
                                                <tr key={booking.id}>
                                                    <td>
                                                        {(page - 1) * 10 +
                                                            index +
                                                            1}
                                                    </td>

                                                    <td>
                                                        <span className="booking-reference">
                                                            {booking.booking_reference ??
                                                                "null"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {booking.user?.email ??
                                                            "null"}
                                                    </td>

                                                    <td>
                                                        <span className="booking-type">
                                                            {booking.booking_type ??
                                                                "null"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {booking.package?.title ??
                                                            "null"}
                                                    </td>

                                                    <td>
                                                        {booking.pricing_tier
                                                            ?.service ??
                                                            "null"}
                                                    </td>

                                                    <td>
                                                        {getVehicleId(booking)}
                                                    </td>

                                                    <td>
                                                        {getHeliId(booking)}
                                                    </td>

                                                    <td>
                                                        {booking.number_of_people ??
                                                            "null"}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            booking.start_date
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            booking.end_date
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span className="booking-amount">
                                                            {formatAmount(
                                                                booking.total_amount
                                                            )}
                                                        </span>
                                                    </td>

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

                                                    <td>
                                                        {booking.created_at
                                                            ? new Date(
                                                                booking.created_at
                                                            ).toLocaleDateString()
                                                            : "null"}
                                                    </td>

                                                    <td className="action-column">
                                                        <div className="action-buttons">
                                                            <button
                                                                type="button"
                                                                className="view-document-button"
                                                                onClick={() =>
                                                                    booking.booking_type ===
                                                                        "HELI"
                                                                        ? handleViewDocuments(
                                                                            booking
                                                                        )
                                                                        : handleViewDetail(
                                                                            booking
                                                                        )
                                                                }
                                                            >
                                                                <FaEye />
                                                                View Detail
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="view-document-button"
                                                                onClick={() =>
                                                                    handleOpenStatusModal(
                                                                        booking
                                                                    )
                                                                }
                                                            >
                                                                <FaEdit />
                                                                Update Status
                                                            </button>

                                                            {/*
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

            {/* =====================================================
                UPDATE STATUS MODAL
            ===================================================== */}
            {showStatusModal && statusBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={closeStatusModal}
                >
                    <div
                        className="booking-document-modal"
                        style={{
                            maxWidth: "520px",
                            width: "95%",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="booking-modal-header">
                            <div>
                                <h2>Update Booking Status</h2>
                                <p>
                                    {statusBooking.booking_reference ||
                                        `Booking #${statusBooking.id}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="booking-modal-close"
                                onClick={closeStatusModal}
                                disabled={savingStatus}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="booking-modal-body">
                            <div className="booking-modal-summary">
                                {renderDetailField(
                                    "Booking ID",
                                    statusBooking.id
                                )}

                                {renderDetailField(
                                    "Booking Type",
                                    statusBooking.booking_type
                                )}

                                {renderDetailField(
                                    "Total Amount",
                                    formatAmount(
                                        statusBooking.total_amount
                                    )
                                )}

                                {renderDetailField(
                                    "Payment Provider",
                                    getPayLaterPayment(statusBooking)
                                        ? "PAYLATER"
                                        : statusBooking.payments?.[0]
                                            ?.provider || "-"
                                )}
                            </div>

                            <div
                                style={{
                                    marginTop: "24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "18px",
                                }}
                            >
                                <div>
                                    <label
                                        htmlFor="booking-status-select"
                                        style={{
                                            display: "block",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                            color: "#351255",
                                        }}
                                    >
                                        Booking Status
                                    </label>

                                    <select
                                        id="booking-status-select"
                                        value={bookingStatus}
                                        onChange={(e) => setBookingStatus(e.target.value)}
                                        disabled={savingStatus}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #ddd",
                                            background: "#fff",
                                            color: "#351255",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="CONFIRMED">CONFIRMED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-status-select"
                                        style={{
                                            display: "block",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                            color: "#351255",
                                        }}
                                    >
                                        Payment Status
                                    </label>

                                    <select
                                        id="payment-status-select"
                                        value={paymentStatus}
                                        onChange={(e) =>
                                            setPaymentStatus(
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            savingStatus ||
                                            !canEditPaymentStatus(
                                                statusBooking
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #ddd",
                                            background:
                                                canEditPaymentStatus(
                                                    statusBooking
                                                )
                                                    ? "#fff"
                                                    : "#f5f5f5",
                                            cursor:
                                                canEditPaymentStatus(
                                                    statusBooking
                                                )
                                                    ? "pointer"
                                                    : "not-allowed",
                                        }}
                                    >
                                        <option value="PENDING">
                                            PENDING
                                        </option>
                                        <option value="PAID">
                                            PAID
                                        </option>
                                        <option value="FAILED">
                                            FAILED
                                        </option>
                                    </select>

                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "#777",
                                            marginTop: "8px",
                                        }}
                                    >
                                        {statusBooking.payment_status ===
                                            "PAID"
                                            ? "This booking is already paid. Payment status cannot be changed."
                                            : canEditPaymentStatus(
                                                statusBooking
                                            )
                                                ? "Payment status can be updated because this is an unpaid PAYLATER booking."
                                                : "Payment status can only be updated for unpaid PAYLATER bookings."}
                                    </p>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                    marginTop: "28px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={closeStatusModal}
                                    disabled={savingStatus}
                                    style={{
                                        padding: "11px 18px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        background: "#fff",
                                        color: "#351255",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleUpdateStatus}
                                    disabled={savingStatus}
                                    style={{
                                        padding: "11px 20px",
                                        border: "none",
                                        borderRadius: "8px",
                                        background: "#351255",
                                        color: "#fff",
                                        fontWeight: 600,
                                        cursor: savingStatus
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: savingStatus ? 0.6 : 1,
                                    }}
                                >
                                    {savingStatus
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                PACKAGE BOOKING DETAIL MODAL
            ===================================================== */}
            {showDetailModal && selectedDetailBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={closeDetailModal}
                >
                    <div
                        className="booking-document-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="booking-modal-header">
                            <div>
                                <h2>Booking Details</h2>
                                <p>
                                    {selectedDetailBooking.booking_reference ||
                                        `Booking #${selectedDetailBooking.id}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="booking-modal-close"
                                onClick={closeDetailModal}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="booking-modal-body">
                            <div className="booking-modal-summary">
                                {renderDetailField(
                                    "Booking ID",
                                    selectedDetailBooking.id
                                )}

                                {renderDetailField(
                                    "Booking Reference",
                                    selectedDetailBooking.booking_reference
                                )}

                                {renderDetailField(
                                    "Booking Type",
                                    selectedDetailBooking.booking_type
                                )}

                                {renderDetailField(
                                    "Package",
                                    selectedDetailBooking.package?.title
                                )}

                                {renderDetailField(
                                    "Pricing Tier",
                                    selectedDetailBooking.pricing_tier
                                        ?.service
                                )}

                                {renderDetailField(
                                    "Age Group",
                                    selectedDetailBooking.pricing_tier
                                        ?.age_group
                                )}

                                {renderDetailField(
                                    "Number of People",
                                    selectedDetailBooking.number_of_people
                                )}

                                {renderDetailField(
                                    "Start Date",
                                    formatDate(
                                        selectedDetailBooking.start_date
                                    )
                                )}

                                {renderDetailField(
                                    "End Date",
                                    formatDate(
                                        selectedDetailBooking.end_date
                                    )
                                )}

                                {renderDetailField(
                                    "Total Amount",
                                    formatAmount(
                                        selectedDetailBooking.total_amount
                                    )
                                )}

                                {renderDetailField(
                                    "Status",
                                    selectedDetailBooking.status
                                )}

                                {renderDetailField(
                                    "Payment Status",
                                    selectedDetailBooking.payment_status
                                )}
                            </div>

                            {/* USER DETAILS */}
                            <div style={{ marginTop: "24px" }}>
                                <h3
                                    style={{
                                        marginBottom: "15px",
                                        color: "#351255",
                                    }}
                                >
                                    User Details
                                </h3>

                                <div className="booking-modal-summary">
                                    {renderDetailField(
                                        "Name",
                                        [
                                            selectedDetailBooking.user
                                                ?.first_name,
                                            selectedDetailBooking.user
                                                ?.middle_name,
                                            selectedDetailBooking.user
                                                ?.last_name,
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || "-"
                                    )}

                                    {renderDetailField(
                                        "Email",
                                        selectedDetailBooking.user?.email
                                    )}

                                    {renderDetailField(
                                        "Phone",
                                        `${selectedDetailBooking.user
                                            ?.country_code || ""
                                        }${selectedDetailBooking.user
                                            ?.phone || "-"
                                        }`
                                    )}

                                    {renderDetailField(
                                        "Gender",
                                        selectedDetailBooking.user?.gender
                                    )}

                                    {renderDetailField(
                                        "Date of Birth",
                                        selectedDetailBooking.user
                                            ?.date_of_birth
                                            ? formatDate(
                                                selectedDetailBooking.user
                                                    .date_of_birth
                                            )
                                            : "-"
                                    )}

                                    {renderDetailField(
                                        "Nationality",
                                        selectedDetailBooking.user
                                            ?.nationality
                                    )}

                                    {renderDetailField(
                                        "Address",
                                        selectedDetailBooking.user?.address
                                    )}

                                    {renderDetailField(
                                        "City",
                                        selectedDetailBooking.user?.city
                                    )}

                                    {renderDetailField(
                                        "State",
                                        selectedDetailBooking.user?.state
                                    )}

                                    {renderDetailField(
                                        "Country",
                                        selectedDetailBooking.user?.country
                                    )}

                                    {renderDetailField(
                                        "Postal Code",
                                        selectedDetailBooking.user
                                            ?.postal_code
                                    )}
                                </div>
                            </div>

                            {/* PACKAGE APPLICANT DETAILS */}
                            {selectedDetailBooking.package_applicants
                                ?.length > 0 && (
                                    <div style={{ marginTop: "24px" }}>
                                        <h3
                                            style={{
                                                marginBottom: "15px",
                                                color: "#351255",
                                            }}
                                        >
                                            Applicant Details
                                        </h3>

                                        {selectedDetailBooking.package_applicants.map(
                                            (applicant, index) => (
                                                <div
                                                    key={applicant.id || index}
                                                    style={{
                                                        marginBottom: "18px",
                                                    }}
                                                >
                                                    {selectedDetailBooking
                                                        .package_applicants
                                                        .length > 1 && (
                                                            <h4
                                                                style={{
                                                                    marginBottom:
                                                                        "10px",
                                                                    color: "#351255",
                                                                }}
                                                            >
                                                                Applicant {index + 1}
                                                            </h4>
                                                        )}

                                                    <div className="booking-modal-summary">
                                                        {renderDetailField(
                                                            "Full Name",
                                                            applicant.full_name
                                                        )}

                                                        {renderDetailField(
                                                            "Email Address",
                                                            applicant.email
                                                        )}

                                                        {renderDetailField(
                                                            "Phone / WhatsApp",
                                                            applicant.phone_whatsapp
                                                        )}

                                                        {renderDetailField(
                                                            "Travel Date",
                                                            formatDate(
                                                                selectedDetailBooking.start_date
                                                            )
                                                        )}

                                                        {renderDetailField(
                                                            "Nationality",
                                                            applicant.nationality
                                                        )}

                                                        {renderDetailField(
                                                            "Pickup / Hotel in Nepal",
                                                            applicant.pickup_hotel
                                                        )}

                                                        {renderDetailField(
                                                            "Dietary / Health Notes",
                                                            applicant.dietary_health_notes
                                                        )}
                                                    </div>

                                                    {applicant.document && (
                                                        <div
                                                            className="booking-document-files"
                                                            style={{
                                                                marginTop: "12px",
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
            ===================================================== */}
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
                                {renderDetailField(
                                    "Booking ID",
                                    selectedBooking.id
                                )}

                                {renderDetailField(
                                    "Package ID",
                                    selectedBooking.package_id
                                )}

                                {renderDetailField(
                                    "Passengers",
                                    selectedBooking.number_of_people
                                )}

                                {renderDetailField(
                                    "Start Date",
                                    formatDate(selectedBooking.start_date)
                                )}
                            </div>

                            {documentLoading ? (
                                <div className="booking-document-empty">
                                    <div className="booking-loader"></div>
                                    Loading documents...
                                </div>
                            ) : heliDocuments.length === 0 ? (
                                <div className="booking-document-empty">
                                    No traveller documents found for this
                                    booking.
                                </div>
                            ) : (
                                <div className="booking-traveller-list">
                                    {heliDocuments.map((document, index) => (
                                        <div
                                            className="booking-traveller-card"
                                            key={document.id || index}
                                        >
                                            <div className="booking-traveller-header">
                                                <div>
                                                    <span>
                                                        Traveller{" "}
                                                        {index + 1}
                                                    </span>

                                                    <h3>
                                                        {document.name ||
                                                            "Unnamed Traveller"}
                                                    </h3>
                                                </div>

                                                <span className="booking-traveller-number">
                                                    #{index + 1}
                                                </span>
                                            </div>

                                            <div className="booking-traveller-info">
                                                {renderDetailField(
                                                    "Name",
                                                    document.name
                                                )}

                                                {renderDetailField(
                                                    "Nationality",
                                                    document.nationality
                                                )}

                                                {renderDetailField(
                                                    "Identity Number",
                                                    document.identity_number
                                                )}

                                                {renderDetailField(
                                                    "Weight",
                                                    document.weight != null
                                                        ? `${document.weight} kg`
                                                        : "-"
                                                )}

                                                {renderDetailField(
                                                    "Luggage",
                                                    document.luggage != null
                                                        ? `${document.luggage} kg`
                                                        : "-"
                                                )}

                                                {renderDetailField(
                                                    "Email Address",
                                                    document.email
                                                )}

                                                {renderDetailField(
                                                    "WhatsApp Phone Number",
                                                    document.whatsapp_phone
                                                )}

                                                {renderDetailField(
                                                    "Preferred Flight Date",
                                                    document.preferred_flight_date
                                                        ? formatDate(
                                                            document.preferred_flight_date
                                                        )
                                                        : "-"
                                                )}

                                                {renderDetailField(
                                                    "Pickup Hotel in Kathmandu / Pokhara",
                                                    document.pickup_hotel
                                                )}
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
