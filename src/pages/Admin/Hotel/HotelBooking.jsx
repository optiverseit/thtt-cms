import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";
import {
  getAllHotelBookingsCms,
  getHotelBookingByIdCms,
  changeHotelBookingStatusCms,
} from "../../../api/BackendApi";
import "./HotelBooking.css";
const HotelBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("PENDING");
  const [statusLoading, setStatusLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    fetchBookings(page);
  }, [page]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);
  const fetchBookings = async (currentPage = 1) => {
    try {
      setLoading(true);
      const response =
        await getAllHotelBookingsCms(currentPage);
      const paginationData = response.data?.data;
      setBookings(paginationData?.data || []);
      setPage(paginationData?.current_page || 1);
      setLastPage(paginationData?.last_page || 1);
      setTotalBookings(paginationData?.total || 0);
    } catch (error) {
      console.error(
        "Failed to fetch hotel bookings:",
        error
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };
  const handleViewBooking = async (booking) => {
    try {
      setOpenMenuId(null);
      setViewLoading(true);
      setSelectedBooking(null);
      setIsViewModalOpen(true);
      const response =
        await getHotelBookingByIdCms(booking.id);
      setSelectedBooking(response.data?.data || null);
    } catch (error) {
      console.error(
        "Failed to fetch hotel booking details:",
        error
      );
      setIsViewModalOpen(false);
      Swal.fire({ icon: "error", title: "Failed", text: error.response?.data?.message || "Failed to fetch hotel booking details.", confirmButtonColor: "#351255" });
    } finally {
      setViewLoading(false);
    }
  };
  const getPayLaterPayment = (booking) => {
    const payments = Array.isArray(booking?.payments) ? booking.payments : [];
    return [...payments].filter((payment) => payment.provider === "PAYLATER").sort((a, b) => Number(b.id) - Number(a.id))[0] || null;
  };
  const canEditPaymentStatus = (booking) => {
    if (!booking) return false;
    const payments = Array.isArray(booking.payments) ? booking.payments : [];
    const payLater = getPayLaterPayment(booking);
    return Boolean(payLater) && booking.payment_status !== "PAID" && payLater.status !== "PAID" && !payments.some((payment) => payment.status === "PAID");
  };
  const handleOpenStatusModal = async (booking) => {
    setOpenMenuId(null);
    setSelectedBooking(booking);
    setSelectedStatus(booking.status || "PENDING");
    setSelectedPaymentStatus(booking.payment_status || "PENDING");
    setCancellationReason(booking.cancellation_reason || "");
    setIsStatusModalOpen(true);
    try {
      setStatusLoading(true);
      const response = await getHotelBookingByIdCms(booking.id);
      const detail = response.data?.data;
      if (detail) {
        setSelectedBooking(detail);
        setSelectedStatus(detail.status || "PENDING");
        setSelectedPaymentStatus(detail.payment_status || "PENDING");
        setCancellationReason(detail.cancellation_reason || "");
      }
    } catch (error) {
      console.error("Failed to fetch hotel payment information:", error);
    } finally {
      setStatusLoading(false);
    }
  };
  const closeStatusModal = () => {
    if (isUpdatingStatus) return;
    setIsStatusModalOpen(false);
    setSelectedBooking(null);
    setSelectedStatus("");
    setSelectedPaymentStatus("PENDING");
    setCancellationReason("");
  };
  const handleChangeStatus = async () => {
    if (!selectedBooking || isUpdatingStatus || statusLoading) return;
    const payload = {};
    if (selectedStatus !== selectedBooking.status) {
      payload.status = selectedStatus;
      if (selectedStatus === "CANCELLED") {
        if (!cancellationReason.trim()) {
          await Swal.fire({ icon: "warning", title: "Cancellation Reason Required", text: "Cancellation reason is required.", confirmButtonColor: "#351255" });
          return;
        }
        payload.cancellation_reason = cancellationReason.trim();
      }
    }
    if (canEditPaymentStatus(selectedBooking) && selectedPaymentStatus !== selectedBooking.payment_status) {
      payload.payment_status = selectedPaymentStatus;
    }
    if (Object.keys(payload).length === 0) {
      await Swal.fire({ icon: "info", title: "No Changes", text: "No status changes made.", confirmButtonColor: "#351255" });
      return;
    }
    setIsStatusModalOpen(false);
    if (payload.payment_status === "PAID") {
      const confirmation = await Swal.fire({ icon: "warning", title: "Confirm Payment?", text: "Mark this PAYLATER payment as PAID? You cannot change its payment status afterward.", showCancelButton: true, confirmButtonText: "Yes, Mark as Paid", cancelButtonText: "Cancel", confirmButtonColor: "#351255" });
      if (!confirmation.isConfirmed) {
        setIsStatusModalOpen(true);
        return;
      }
    }
    setIsUpdatingStatus(true);
    try {
      Swal.fire({
        title: "Updating Status...",
        text: "Please wait while the booking is being updated.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
      });
      const response = await changeHotelBookingStatusCms(selectedBooking.id, payload);
      if (!response.data?.status) throw new Error(response.data?.message || "Failed to update hotel booking status.");
      Swal.close();
      setSelectedBooking(null);
      setSelectedStatus("");
      setSelectedPaymentStatus("PENDING");
      setCancellationReason("");
      await fetchBookings(page);
    } catch (error) {
      Swal.close();
      console.error("Failed to update hotel booking status:", error);
      setIsStatusModalOpen(true);
      await Swal.fire({ icon: "error", title: "Update Failed", text: error.response?.data?.message || error.message || "Failed to update hotel booking status.", confirmButtonColor: "#351255" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedBooking(null);
  };
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };
  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };
  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined
    ) {
      return "-";
    }
    return `NPR ${Number(
      amount
    ).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  const formatStatus = (status) => {
    if (!status) return "-";
    return status
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
      case "COMPLETED":
      case "CHECKED_OUT":
        return "hotel-booking-status-success";
      case "PROCESSING":
      case "CHECKED_IN":
        return "hotel-booking-status-processing";
      case "CANCELLED":
        return "hotel-booking-status-cancelled";
      case "PENDING":
      default:
        return "hotel-booking-status-pending";
    }
  };
  const getPaymentStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "hotel-payment-paid";
      case "FAILED":
      case "REFUNDED":
        return "hotel-payment-failed";
      case "PENDING":
      default:
        return "hotel-payment-pending";
    }
  };
  const getHotelName = (booking) => {
    return (
      booking?.hotel?.name ||
      booking?.hotel?.hotel_name ||
      "-"
    );
  };
  const getPricingTierName = (booking) => {
    return (
      booking?.pricing_tier?.room_name ||
      booking?.pricingTier?.room_name ||
      booking?.pricing_tier?.title ||
      booking?.pricingTier?.title ||
      booking?.pricing_tier?.room_type ||
      booking?.pricingTier?.room_type ||
      "-"
    );
  };
  const getPricingUnit = (booking) => {
    const unit = booking?.pricing_tier?.pricing_unit || booking?.pricingTier?.pricing_unit;
    if (!unit) return "-";
    return unit
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const getLatestPayment = (booking) => {
    if (
      !booking?.payments ||
      booking.payments.length === 0
    ) {
      return null;
    }
    return booking.payments[
      booking.payments.length - 1
    ];
  };
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content">
          <div className="hotel-booking-page">
            <div className="hotel-booking-header">
              <div>
                <h1>Hotel Bookings</h1>
                <p>
                  View and manage hotel bookings
                  submitted by customers.
                </p>
              </div>
            </div>
            <div className="hotel-booking-table-card">
              <div className="hotel-booking-table-header">
                <div>
                  <h2>Hotel Booking List</h2>
                  <p>
                    {totalBookings}{" "}
                    {totalBookings === 1
                      ? "booking"
                      : "bookings"}
                  </p>
                </div>
              </div>
              <div className="hotel-booking-table-responsive">
                <table className="hotel-booking-table">
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Booking Reference</th>
                      <th>Primary Guest</th>
                      <th>Hotel</th>
                      <th>Room / Tier</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Guests</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th className="hotel-booking-action-column">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="12"
                          className="hotel-booking-table-message"
                        >
                          <div className="hotel-booking-loader" />
                          Loading hotel bookings...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan="12"
                          className="hotel-booking-table-message"
                        >
                          No hotel bookings found.
                        </td>
                      </tr>
                    ) : (
                      bookings.map(
                        (booking, index) => (
                          <tr key={booking.id}>
                            <td>
                              {(page - 1) * 10 +
                                index +
                                1}
                            </td>
                            <td>
                              <span className="hotel-booking-reference">
                                {
                                  booking.booking_reference
                                }
                              </span>
                            </td>
                            <td>
                              <div className="hotel-booking-guest">
                                <strong>
                                  {
                                    booking.primary_guest_name
                                  }
                                </strong>
                                <span>
                                  {booking.email}
                                </span>
                              </div>
                            </td>
                            <td>
                              {getHotelName(booking)}
                            </td>
                            <td>
                              {getPricingTierName(
                                booking
                              )}
                            </td>
                            <td>
                              {formatDate(
                                booking.check_in_date
                              )}
                            </td>
                            <td>
                              {formatDate(
                                booking.check_out_date
                              )}
                            </td>
                            <td>
                              {booking.total_guests}
                            </td>
                            <td>
                              <span className="hotel-booking-amount">
                                {formatAmount(
                                  booking.total_amount
                                )}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`hotel-booking-status ${getStatusClass(
                                  booking.status
                                )}`}
                              >
                                {formatStatus(
                                  booking.status
                                )}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`hotel-payment-status ${getPaymentStatusClass(
                                  booking.payment_status
                                )}`}
                              >
                                {formatStatus(
                                  booking.payment_status
                                )}
                              </span>
                            </td>
                            <td className="hotel-booking-action-cell">
                              <div
                                className="hotel-booking-action-wrapper"
                                ref={
                                  openMenuId ===
                                  booking.id
                                    ? menuRef
                                    : null
                                }
                              >
                                <button
                                  type="button"
                                  className="hotel-booking-menu-button"
                                  onClick={() =>
                                    setOpenMenuId(
                                      openMenuId ===
                                        booking.id
                                        ? null
                                        : booking.id
                                    )
                                  }
                                >
                                  ⋮
                                </button>
                                {openMenuId ===
                                  booking.id && (
                                  <div className="hotel-booking-action-menu">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleViewBooking(
                                          booking
                                        )
                                      }
                                    >
                                      View Details
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenStatusModal(
                                          booking
                                        )
                                      }
                                    >
                                      Change Status
                                    </button>
                                  </div>
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
              {!loading && lastPage > 1 && (
                <div className="hotel-booking-pagination">
                  <Pagination
                    currentPage={page}
                    totalPages={lastPage}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {isViewModalOpen && (
        <div
          className="hotel-booking-modal-overlay"
          onClick={closeViewModal}
        >
          <div
            className="hotel-booking-modal hotel-booking-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="hotel-booking-modal-header">
              <div>
                <h2>Hotel Booking Details</h2>
                {selectedBooking && (
                  <p>
                    {
                      selectedBooking.booking_reference
                    }
                  </p>
                )}
              </div>
              <button
                type="button"
                className="hotel-booking-modal-close"
                onClick={closeViewModal}
              >
                ×
              </button>
            </div>
            {viewLoading ? (
              <div className="hotel-booking-modal-body">
                <div className="hotel-booking-table-message">
                  <div className="hotel-booking-loader" />
                  Loading booking details...
                </div>
              </div>
            ) : selectedBooking ? (
              <>
                <div className="hotel-booking-modal-body">
                  <div className="hotel-booking-detail-section">
                    <h3>Booking Information</h3>
                    <div className="hotel-booking-detail-grid">
                      <div className="hotel-booking-detail-item">
                        <span>
                          Booking Reference
                        </span>
                        <strong>
                          {
                            selectedBooking.booking_reference
                          }
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>
                          Booking Status
                        </span>
                        <strong>
                          {formatStatus(
                            selectedBooking.status
                          )}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>
                          Payment Status
                        </span>
                        <strong>
                          {formatStatus(
                            selectedBooking.payment_status
                          )}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Total Amount</span>
                        <strong>
                          {formatAmount(
                            selectedBooking.total_amount
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="hotel-booking-detail-section">
                    <h3>Guest Information</h3>
                    <div className="hotel-booking-detail-grid">
                      <div className="hotel-booking-detail-item">
                        <span>Primary Guest</span>
                        <strong>
                          {selectedBooking.primary_guest_name ||
                            "-"}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Email</span>
                        <strong>
                          {selectedBooking.email ||
                            "-"}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Phone Number</span>
                        <strong>
                          {selectedBooking.phone_number ||
                            "-"}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Nationality</span>
                        <strong>
                          {selectedBooking.nationality ||
                            "-"}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="hotel-booking-detail-section">
                    <h3>
                      Hotel & Stay Information
                    </h3>
                    <div className="hotel-booking-detail-grid">
                      <div className="hotel-booking-detail-item">
                        <span>Hotel</span>
                        <strong>
                          {getHotelName(
                            selectedBooking
                          )}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>
                          Room / Pricing Tier
                        </span>
                        <strong>
                          {getPricingTierName(
                            selectedBooking
                          )}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Pricing Unit</span>
                        <strong>
                          {getPricingUnit(
                            selectedBooking
                          )}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Check-in Date</span>
                        <strong>
                          {formatDate(
                            selectedBooking.check_in_date
                          )}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Check-out Date</span>
                        <strong>
                          {formatDate(
                            selectedBooking.check_out_date
                          )}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Stays</span>
                        <strong>
                          {selectedBooking.stays ??
                            "-"}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Total Guests</span>
                        <strong>
                          {selectedBooking.total_guests ??
                            "-"}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Number of Rooms</span>
                        <strong>
                          {selectedBooking.number_of_rooms ??
                            "-"}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>
                          Travelling with Children
                        </span>
                        <strong>
                          {selectedBooking.travelling_with_children
                            ? "Yes"
                            : "No"}
                        </strong>
                      </div>
                      {selectedBooking.travelling_with_children && (
                        <div className="hotel-booking-detail-item">
                          <span>
                            Number of Children
                          </span>
                          <strong>
                            {selectedBooking.number_of_children ??
                              0}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedBooking.special_requests && (
                    <div className="hotel-booking-detail-section">
                      <h3>Special Requests</h3>
                      <div className="hotel-booking-special-request">
                        {
                          selectedBooking.special_requests
                        }
                      </div>
                    </div>
                  )}
                  {selectedBooking.status ===
                    "CANCELLED" && (
                    <div className="hotel-booking-detail-section">
                      <h3>
                        Cancellation Information
                      </h3>
                      <div className="hotel-booking-detail-grid">
                        <div className="hotel-booking-detail-item">
                          <span>Cancelled At</span>
                          <strong>
                            {formatDateTime(
                              selectedBooking.cancelled_at
                            )}
                          </strong>
                        </div>
                        <div className="hotel-booking-detail-item hotel-booking-detail-full">
                          <span>
                            Cancellation Reason
                          </span>
                          <strong>
                            {selectedBooking.cancellation_reason ||
                              "-"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="hotel-booking-detail-section">
                    <h3>Payment Information</h3>
                    {getLatestPayment(
                      selectedBooking
                    ) ? (
                      <div className="hotel-booking-detail-grid">
                        <div className="hotel-booking-detail-item">
                          <span>Provider</span>
                          <strong>
                            {getLatestPayment(
                              selectedBooking
                            )?.provider || "-"}
                          </strong>
                        </div>
                        <div className="hotel-booking-detail-item">
                          <span>Amount</span>
                          <strong>
                            {formatAmount(
                              getLatestPayment(
                                selectedBooking
                              )?.amount
                            )}
                          </strong>
                        </div>
                        <div className="hotel-booking-detail-item">
                          <span>
                            Payment Status
                          </span>
                          <strong>
                            {formatStatus(
                              getLatestPayment(
                                selectedBooking
                              )?.status
                            )}
                          </strong>
                        </div>
                        <div className="hotel-booking-detail-item">
                          <span>
                            Transaction ID
                          </span>
                          <strong>
                            {getLatestPayment(
                              selectedBooking
                            )?.transaction_id ||
                              "-"}
                          </strong>
                        </div>
                        <div className="hotel-booking-detail-item">
                          <span>Paid At</span>
                          <strong>
                            {formatDateTime(
                              getLatestPayment(
                                selectedBooking
                              )?.paid_at
                            )}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <p className="hotel-booking-no-payment">
                        No payment record found.
                      </p>
                    )}
                  </div>
                  <div className="hotel-booking-detail-section">
                    <h3>System Information</h3>
                    <div className="hotel-booking-detail-grid">
                      <div className="hotel-booking-detail-item">
                        <span>User</span>
                        <strong>
                          {selectedBooking.user
                            ?.name ||
                            selectedBooking.user
                              ?.email ||
                            selectedBooking.user_id ||
                            "-"}
                        </strong>
                      </div>
                      <div className="hotel-booking-detail-item">
                        <span>Created At</span>
                        <strong>
                          {formatDateTime(
                            selectedBooking.created_at
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hotel-booking-modal-footer">
                  <button
                    type="button"
                    className="hotel-booking-secondary-button"
                    onClick={closeViewModal}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
      {isStatusModalOpen &&
        selectedBooking && (
          <div
            className="hotel-booking-modal-overlay"
            onClick={closeStatusModal}
          >
            <div
              className="hotel-booking-modal hotel-booking-status-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="hotel-booking-modal-header">
                <div>
                  <h2>
                    Change Booking Status
                  </h2>
                  <p>
                    {
                      selectedBooking.booking_reference
                    }
                  </p>
                </div>
                <button
                  type="button"
                  className="hotel-booking-modal-close"
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={
                    closeStatusModal
                  }
                >
                  ×
                </button>
              </div>
              <div className="hotel-booking-modal-body">
                <div className="hotel-booking-form-group">
                  <label>
                    Booking Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(event) => {
                      const status =
                        event.target.value;
                      setSelectedStatus(
                        status
                      );
                      if (
                        status !==
                        "CANCELLED"
                      ) {
                        setCancellationReason(
                          ""
                        );
                      }
                    }}
                  >
                    <option value="PENDING">
                      Pending
                    </option>
                    <option value="CONFIRMED">
                      Confirmed
                    </option>
                    <option value="PROCESSING">
                      Processing
                    </option>
                    <option value="CHECKED_IN">
                      Checked In
                    </option>
                    <option value="CHECKED_OUT">
                      Checked Out
                    </option>
                    <option value="CANCELLED">
                      Cancelled
                    </option>
                    <option value="COMPLETED">
                      Completed
                    </option>
                  </select>
                </div>
                {selectedStatus ===
                  "CANCELLED" && (
                  <div className="hotel-booking-form-group">
                    <label>
                      Cancellation Reason
                    </label>
                    <textarea
                      rows="4"
                      value={
                        cancellationReason
                      }
                      onChange={(event) =>
                        setCancellationReason(
                          event.target.value
                        )
                      }
                      placeholder="Enter cancellation reason"
                    />
                  </div>
                )}
                <div className="hotel-booking-form-group" style={{ marginTop: "18px" }}>
    <label>Payment Status</label>
    <select
      value={selectedPaymentStatus}
      onChange={(event) => setSelectedPaymentStatus(event.target.value)}
      disabled={isUpdatingStatus || statusLoading || !canEditPaymentStatus(selectedBooking)}
      style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", background: canEditPaymentStatus(selectedBooking) ? "#fff" : "#f5f5f5", color: "#351255" }}
    >
      <option value="PENDING">Pending</option>
      <option value="PAID">Paid</option>
      <option value="FAILED">Failed</option>
    </select>
    <p style={{ marginTop: "8px", fontSize: "12px", color: "#777" }}>
      {statusLoading ? "Checking payment details..." : selectedBooking.payment_status === "PAID" ? "This booking is already paid. Payment status cannot be changed." : canEditPaymentStatus(selectedBooking) ? "Payment status can be updated for this unpaid PAYLATER booking." : "Payment status can only be updated for an unpaid PAYLATER booking."}
    </p>
  </div>
</div>
              <div className="hotel-booking-modal-footer">
                <button
                  type="button"
                  className="hotel-booking-secondary-button"
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={
                    closeStatusModal
                  }
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="hotel-booking-primary-button"
                  disabled={
                    isUpdatingStatus
                  }
                  onClick={
                    handleChangeStatus
                  }
                >
                  {isUpdatingStatus
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
export default HotelBooking;