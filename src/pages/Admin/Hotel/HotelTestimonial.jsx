import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
  getHotels,
  getHotelTestimonialsCms,
  createHotelTestimonials,
  updateHotelTestimonial,
  changeHotelTestimonialStatus,
  deleteHotelTestimonial,
} from "../../../api/BackendApi";

import "./HotelTestimonial.css";

const createEmptyTestimonial = () => ({
  guest_name: "",
  guest_country: "",
  rating: 5,
  review: "",
  display_order: 0,
  status: "ACTIVE",
});

const HotelTestimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [hotelId, setHotelId] = useState("");

  const [testimonialRows, setTestimonialRows] = useState([
    createEmptyTestimonial(),
  ]);

  useEffect(() => {
    fetchTestimonials(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchHotels();
  }, []);

  // =========================================================
  // FETCH TESTIMONIALS
  // =========================================================

  const fetchTestimonials = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getHotelTestimonialsCms(page);
      const paginationData = response.data?.data;

      setTestimonials(paginationData?.data || []);
      setCurrentPage(paginationData?.current_page || 1);
      setLastPage(paginationData?.last_page || 1);
      setTotal(paginationData?.total || 0);
    } catch (error) {
      console.error("Failed to fetch hotel testimonials:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to fetch hotel testimonials.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH HOTELS
  // =========================================================

  const fetchHotels = async () => {
    try {
      const response = await getHotels();
      const data = response.data?.data;

      if (Array.isArray(data)) {
        setHotels(data);
      } else if (Array.isArray(data?.data)) {
        setHotels(data.data);
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
      setHotels([]);
    }
  };

  // =========================================================
  // FORM
  // =========================================================

  const resetForm = () => {
    setHotelId("");
    setTestimonialRows([createEmptyTestimonial()]);
    setIsEditing(false);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // =========================================================
  // TESTIMONIAL ROWS
  // =========================================================

  const handleTestimonialChange = (index, field, value) => {
    setTestimonialRows((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addTestimonialRow = () => {
    setTestimonialRows((previous) => [
      ...previous,
      createEmptyTestimonial(),
    ]);
  };

  const removeTestimonialRow = (index) => {
    if (testimonialRows.length === 1) return;

    setTestimonialRows((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!hotelId) {
      Swal.fire({
        icon: "warning",
        title: "Hotel Required",
        text: "Please select a hotel.",
      });

      return;
    }

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        testimonials: testimonialRows.map((item) => ({
          guest_name: item.guest_name.trim(),

          guest_country: item.guest_country.trim()
            ? item.guest_country.trim()
            : null,

          rating: Number(item.rating),

          review: item.review.trim(),

          display_order:
            item.display_order === ""
              ? 0
              : Number(item.display_order),

          status: item.status || "ACTIVE",
        })),
      };

      const response = await createHotelTestimonials(payload);

      await Swal.fire({
        icon: "success",
        title: "Created",
        text:
          response.data?.message ||
          "Hotel testimonials created successfully.",
      });

      setShowModal(false);
      resetForm();

      if (currentPage === 1) {
        await fetchTestimonials(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to create testimonials:", error);

      const errors = error.response?.data?.errors;

      const firstError = errors
        ? Object.values(errors)?.[0]?.[0]
        : null;

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          firstError ||
          error.response?.data?.message ||
          "Failed to create hotel testimonials.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (testimonial) => {
    setIsEditing(true);
    setEditingId(testimonial.id);

    setHotelId(String(testimonial.hotel_id));

    setTestimonialRows([
      {
        guest_name: testimonial.guest_name || "",
        guest_country: testimonial.guest_country || "",
        rating: testimonial.rating ?? 5,
        review: testimonial.review || "",
        display_order: testimonial.display_order ?? 0,
        status: testimonial.status || "ACTIVE",
      },
    ]);

    setShowModal(true);
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingId) return;

    const item = testimonialRows[0];

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        guest_name: item.guest_name.trim(),

        guest_country: item.guest_country.trim()
          ? item.guest_country.trim()
          : null,

        rating: Number(item.rating),

        review: item.review.trim(),

        display_order:
          item.display_order === ""
            ? 0
            : Number(item.display_order),

        status: item.status,
      };

      const response = await updateHotelTestimonial(
        editingId,
        payload
      );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel testimonial updated successfully.",
      });

      setShowModal(false);
      resetForm();

      await fetchTestimonials(currentPage);
    } catch (error) {
      console.error("Failed to update testimonial:", error);

      const errors = error.response?.data?.errors;

      const firstError = errors
        ? Object.values(errors)?.[0]?.[0]
        : null;

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          firstError ||
          error.response?.data?.message ||
          "Failed to update hotel testimonial.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange = async (testimonial) => {
    const nextStatus =
      testimonial.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const result = await Swal.fire({
      icon: "question",
      title: "Change status?",
      text: `Change this testimonial to ${nextStatus}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await changeHotelTestimonialStatus(
        testimonial.id
      );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Testimonial status changed successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchTestimonials(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to change testimonial status.",
      });
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (testimonial) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete testimonial?",
      text: "This testimonial will be permanently deleted.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteHotelTestimonial(
        testimonial.id
      );

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text:
          response.data?.message ||
          "Hotel testimonial deleted successfully.",
      });

      await fetchTestimonials(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to delete hotel testimonial.",
      });
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getHotelName = (testimonial) => {
    return (
      testimonial.hotel?.hotel_name ||
      testimonial.hotel?.name ||
      "-"
    );
  };

  const renderStars = (rating) => {
    const value = Number(rating) || 0;

    return "★".repeat(value) + "☆".repeat(5 - value);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <main className="dashboard-content">
          <div className="hotel-testimonial-page">
            <div className="hotel-testimonial-page-header">
              <div>
                <h1>Hotel Testimonials</h1>
                <p>
                  Manage guest reviews and ratings for hotels.
                </p>
              </div>

              <button
                type="button"
                className="hotel-testimonial-add-button"
                onClick={openCreateModal}
              >
                + Add Testimonials
              </button>
            </div>

            <div className="hotel-testimonial-card">
              <div className="hotel-testimonial-card-header">
                <div>
                  <h2>Testimonial List</h2>
                  <p>
                    {total}{" "}
                    {total === 1
                      ? "testimonial"
                      : "testimonials"}
                  </p>
                </div>
              </div>

              <div className="hotel-testimonial-table-wrapper">
                <table className="hotel-testimonial-table">
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Hotel</th>
                      <th>Guest</th>
                      <th>Country</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="hotel-testimonial-empty"
                        >
                          Loading hotel testimonials...
                        </td>
                      </tr>
                    ) : testimonials.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="hotel-testimonial-empty"
                        >
                          No hotel testimonials found.
                        </td>
                      </tr>
                    ) : (
                      testimonials.map((testimonial, index) => (
                        <tr key={testimonial.id}>
                          <td>
                            {(currentPage - 1) * 10 + index + 1}
                          </td>

                          <td>
                            <strong>
                              {getHotelName(testimonial)}
                            </strong>
                          </td>

                          <td>{testimonial.guest_name}</td>

                          <td>
                            {testimonial.guest_country || "-"}
                          </td>

                          <td>
                            <span
                              className="hotel-testimonial-rating"
                              title={`${testimonial.rating}/5`}
                            >
                              {renderStars(testimonial.rating)}
                            </span>
                          </td>

                          <td>
                            <div className="hotel-testimonial-review">
                              {testimonial.review}
                            </div>
                          </td>

                          <td>
                            {testimonial.display_order ?? 0}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`hotel-testimonial-status ${
                                testimonial.status === "ACTIVE"
                                  ? "active"
                                  : "inactive"
                              }`}
                              onClick={() =>
                                handleStatusChange(testimonial)
                              }
                            >
                              {testimonial.status}
                            </button>
                          </td>

                          <td>
                            <div className="hotel-testimonial-actions">
                              <button
                                type="button"
                                className="hotel-testimonial-edit"
                                onClick={() =>
                                  openEditModal(testimonial)
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="hotel-testimonial-delete"
                                onClick={() =>
                                  handleDelete(testimonial)
                                }
                              >
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

              {!loading && lastPage > 1 && (
                <div className="hotel-testimonial-pagination">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div
          className="hotel-testimonial-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="hotel-testimonial-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hotel-testimonial-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Edit Hotel Testimonial"
                    : "Add Hotel Testimonials"}
                </h2>

                <p>
                  {isEditing
                    ? "Update this guest testimonial."
                    : "Select a hotel and add one or more guest testimonials."}
                </p>
              </div>

              <button
                type="button"
                className="hotel-testimonial-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                isEditing
                  ? handleUpdate
                  : handleCreate
              }
            >
              <div className="hotel-testimonial-modal-body">
                <div className="hotel-testimonial-hotel-field">
                  <div className="hotel-testimonial-form-group">
                    <label>Hotel *</label>

                    <select
                      value={hotelId}
                      onChange={(event) =>
                        setHotelId(event.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select Hotel
                      </option>

                      {hotels.map((hotel) => (
                        <option
                          key={hotel.id}
                          value={hotel.id}
                        >
                          {hotel.hotel_name ||
                            hotel.name ||
                            `Hotel #${hotel.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {testimonialRows.map((item, index) => (
                  <div
                    key={index}
                    className="hotel-testimonial-row-card"
                  >
                    <div className="hotel-testimonial-row-header">
                      <h3>
                        {isEditing
                          ? "Testimonial"
                          : `Testimonial ${index + 1}`}
                      </h3>

                      {!isEditing &&
                        testimonialRows.length > 1 && (
                          <button
                            type="button"
                            className="hotel-testimonial-remove"
                            onClick={() =>
                              removeTestimonialRow(index)
                            }
                          >
                            Remove
                          </button>
                        )}
                    </div>

                    <div className="hotel-testimonial-fields-grid">
                      <div className="hotel-testimonial-form-group">
                        <label>Guest Name *</label>

                        <input
                          type="text"
                          value={item.guest_name}
                          onChange={(event) =>
                            handleTestimonialChange(
                              index,
                              "guest_name",
                              event.target.value
                            )
                          }
                          placeholder="Guest name"
                          required
                        />
                      </div>

                      <div className="hotel-testimonial-form-group">
                        <label>Guest Country</label>

                        <input
                          type="text"
                          value={item.guest_country}
                          onChange={(event) =>
                            handleTestimonialChange(
                              index,
                              "guest_country",
                              event.target.value
                            )
                          }
                          placeholder="e.g. Australia"
                        />
                      </div>

                      <div className="hotel-testimonial-form-group">
                        <label>Rating *</label>

                        <select
                          value={item.rating}
                          onChange={(event) =>
                            handleTestimonialChange(
                              index,
                              "rating",
                              event.target.value
                            )
                          }
                          required
                        >
                          <option value="5">
                            5 - Excellent
                          </option>
                          <option value="4">
                            4 - Very Good
                          </option>
                          <option value="3">
                            3 - Good
                          </option>
                          <option value="2">
                            2 - Fair
                          </option>
                          <option value="1">
                            1 - Poor
                          </option>
                        </select>
                      </div>

                      <div className="hotel-testimonial-form-group">
                        <label>Display Order</label>

                        <input
                          type="number"
                          min="0"
                          value={item.display_order}
                          onChange={(event) =>
                            handleTestimonialChange(
                              index,
                              "display_order",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="hotel-testimonial-form-group">
                        <label>Status</label>

                        <select
                          value={item.status}
                          onChange={(event) =>
                            handleTestimonialChange(
                              index,
                              "status",
                              event.target.value
                            )
                          }
                        >
                          <option value="ACTIVE">
                            Active
                          </option>

                          <option value="INACTIVE">
                            Inactive
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="hotel-testimonial-form-group hotel-testimonial-review-field">
                      <label>Review *</label>

                      <textarea
                        rows="4"
                        value={item.review}
                        onChange={(event) =>
                          handleTestimonialChange(
                            index,
                            "review",
                            event.target.value
                          )
                        }
                        placeholder="Enter guest review..."
                        required
                      />
                    </div>
                  </div>
                ))}

                {!isEditing && (
                  <button
                    type="button"
                    className="hotel-testimonial-add-row"
                    onClick={addTestimonialRow}
                  >
                    + Add Another Testimonial
                  </button>
                )}
              </div>

              <div className="hotel-testimonial-modal-footer">
                <button
                  type="button"
                  className="hotel-testimonial-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-testimonial-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update Testimonial"
                    : `Create ${testimonialRows.length} ${
                        testimonialRows.length === 1
                          ? "Testimonial"
                          : "Testimonials"
                      }`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelTestimonial;