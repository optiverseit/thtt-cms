import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
  getHotels,
  getHotelFaqsCms,
  createHotelFaqs,
  updateHotelFaq,
  changeHotelFaqStatus,
  deleteHotelFaq,
} from "../../../api/BackendApi";

import "./HotelFaq.css";

const createEmptyFaq = () => ({
  question: "",
  answer: "",
  display_order: 0,
  status: "ACTIVE",
});

const HotelFaq = () => {
  const [faqs, setFaqs] = useState([]);
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

  const [faqRows, setFaqRows] = useState([
    createEmptyFaq(),
  ]);

  useEffect(() => {
    fetchFaqs(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchHotels();
  }, []);

  // =========================================================
  // FETCH FAQS
  // =========================================================

  const fetchFaqs = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getHotelFaqsCms(page);
      const paginationData = response.data?.data;

      setFaqs(paginationData?.data || []);
      setCurrentPage(paginationData?.current_page || 1);
      setLastPage(paginationData?.last_page || 1);
      setTotal(paginationData?.total || 0);
    } catch (error) {
      console.error("Failed to fetch hotel FAQs:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to fetch hotel FAQs.",
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
  // RESET
  // =========================================================

  const resetForm = () => {
    setHotelId("");
    setFaqRows([createEmptyFaq()]);
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
  // FAQ ROWS
  // =========================================================

  const handleFaqChange = (index, field, value) => {
    setFaqRows((previous) =>
      previous.map((faq, faqIndex) =>
        faqIndex === index
          ? {
              ...faq,
              [field]: value,
            }
          : faq
      )
    );
  };

  const addFaqRow = () => {
    setFaqRows((previous) => [
      ...previous,
      createEmptyFaq(),
    ]);
  };

  const removeFaqRow = (index) => {
    if (faqRows.length === 1) return;

    setFaqRows((previous) =>
      previous.filter(
        (_, faqIndex) => faqIndex !== index
      )
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

        faqs: faqRows.map((faq) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),

          display_order:
            faq.display_order === ""
              ? 0
              : Number(faq.display_order),

          status: faq.status || "ACTIVE",
        })),
      };

      const response = await createHotelFaqs(payload);

      await Swal.fire({
        icon: "success",
        title: "Created",
        text:
          response.data?.message ||
          "Hotel FAQs created successfully.",
      });

      setShowModal(false);
      resetForm();

      if (currentPage === 1) {
        await fetchFaqs(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to create hotel FAQs:", error);

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
          "Failed to create hotel FAQs.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEditModal = (faq) => {
    setIsEditing(true);
    setEditingId(faq.id);

    setHotelId(String(faq.hotel_id));

    setFaqRows([
      {
        question: faq.question || "",
        answer: faq.answer || "",
        display_order: faq.display_order ?? 0,
        status: faq.status || "ACTIVE",
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

    const faq = faqRows[0];

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        question: faq.question.trim(),
        answer: faq.answer.trim(),

        display_order:
          faq.display_order === ""
            ? 0
            : Number(faq.display_order),

        status: faq.status,
      };

      const response = await updateHotelFaq(
        editingId,
        payload
      );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel FAQ updated successfully.",
      });

      setShowModal(false);
      resetForm();

      await fetchFaqs(currentPage);
    } catch (error) {
      console.error("Failed to update hotel FAQ:", error);

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
          "Failed to update hotel FAQ.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange = async (faq) => {
    const nextStatus =
      faq.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const result = await Swal.fire({
      icon: "question",
      title: "Change status?",
      text: `Change this FAQ to ${nextStatus}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await changeHotelFaqStatus(
        faq.id
      );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel FAQ status changed successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchFaqs(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to change FAQ status.",
      });
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (faq) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete FAQ?",
      text: "This hotel FAQ will be permanently deleted.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteHotelFaq(faq.id);

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text:
          response.data?.message ||
          "Hotel FAQ deleted successfully.",
      });

      await fetchFaqs(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to delete hotel FAQ.",
      });
    }
  };

  // =========================================================
  // HOTEL NAME
  // =========================================================

  const getHotelName = (faq) => {
    return (
      faq.hotel?.hotel_name ||
      faq.hotel?.name ||
      "-"
    );
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
          <div className="hotel-faq-page">

            <div className="hotel-faq-page-header">
              <div>
                <h1>Hotel FAQs</h1>
                <p>
                  Manage frequently asked questions for hotels.
                </p>
              </div>

              <button
                type="button"
                className="hotel-faq-add-button"
                onClick={openCreateModal}
              >
                + Add FAQs
              </button>
            </div>

            <div className="hotel-faq-card">

              <div className="hotel-faq-card-header">
                <div>
                  <h2>FAQ List</h2>

                  <p>
                    {total}{" "}
                    {total === 1 ? "FAQ" : "FAQs"}
                  </p>
                </div>
              </div>

              <div className="hotel-faq-table-wrapper">
                <table className="hotel-faq-table">

                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Hotel</th>
                      <th>Question</th>
                      <th>Answer</th>
                      <th>Display Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="hotel-faq-empty"
                        >
                          Loading hotel FAQs...
                        </td>
                      </tr>
                    ) : faqs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="hotel-faq-empty"
                        >
                          No hotel FAQs found.
                        </td>
                      </tr>
                    ) : (
                      faqs.map((faq, index) => (
                        <tr key={faq.id}>

                          <td>
                            {(currentPage - 1) * 10 +
                              index +
                              1}
                          </td>

                          <td>
                            <strong>
                              {getHotelName(faq)}
                            </strong>
                          </td>

                          <td>
                            <div className="hotel-faq-question">
                              {faq.question}
                            </div>
                          </td>

                          <td>
                            <div className="hotel-faq-answer">
                              {faq.answer}
                            </div>
                          </td>

                          <td>
                            {faq.display_order ?? 0}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`hotel-faq-status ${
                                faq.status === "ACTIVE"
                                  ? "active"
                                  : "inactive"
                              }`}
                              onClick={() =>
                                handleStatusChange(faq)
                              }
                            >
                              {faq.status}
                            </button>
                          </td>

                          <td>
                            <div className="hotel-faq-actions">

                              <button
                                type="button"
                                className="hotel-faq-edit"
                                onClick={() =>
                                  openEditModal(faq)
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="hotel-faq-delete"
                                onClick={() =>
                                  handleDelete(faq)
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
                <div className="hotel-faq-pagination">
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

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="hotel-faq-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="hotel-faq-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="hotel-faq-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Edit Hotel FAQ"
                    : "Add Hotel FAQs"}
                </h2>

                <p>
                  {isEditing
                    ? "Update this frequently asked question."
                    : "Select a hotel and add one or more frequently asked questions."}
                </p>
              </div>

              <button
                type="button"
                className="hotel-faq-modal-close"
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

              <div className="hotel-faq-modal-body">

                <div className="hotel-faq-hotel-field">

                  <div className="hotel-faq-form-group">
                    <label>Hotel *</label>

                    <select
                      value={hotelId}
                      onChange={(event) =>
                        setHotelId(
                          event.target.value
                        )
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

                {faqRows.map((faq, index) => (
                  <div
                    key={index}
                    className="hotel-faq-row-card"
                  >

                    <div className="hotel-faq-row-header">

                      <h3>
                        {isEditing
                          ? "FAQ"
                          : `FAQ ${index + 1}`}
                      </h3>

                      {!isEditing &&
                        faqRows.length > 1 && (
                          <button
                            type="button"
                            className="hotel-faq-remove"
                            onClick={() =>
                              removeFaqRow(index)
                            }
                          >
                            Remove
                          </button>
                        )}

                    </div>

                    <div className="hotel-faq-form-group">
                      <label>Question *</label>

                      <input
                        type="text"
                        maxLength="255"
                        value={faq.question}
                        onChange={(event) =>
                          handleFaqChange(
                            index,
                            "question",
                            event.target.value
                          )
                        }
                        placeholder="Enter question"
                        required
                      />
                    </div>

                    <div className="hotel-faq-form-group hotel-faq-answer-field">
                      <label>Answer *</label>

                      <textarea
                        rows="5"
                        value={faq.answer}
                        onChange={(event) =>
                          handleFaqChange(
                            index,
                            "answer",
                            event.target.value
                          )
                        }
                        placeholder="Enter answer"
                        required
                      />
                    </div>

                    <div className="hotel-faq-row-fields">

                      <div className="hotel-faq-form-group">
                        <label>Display Order</label>

                        <input
                          type="number"
                          min="0"
                          value={faq.display_order}
                          onChange={(event) =>
                            handleFaqChange(
                              index,
                              "display_order",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="hotel-faq-form-group">
                        <label>Status</label>

                        <select
                          value={faq.status}
                          onChange={(event) =>
                            handleFaqChange(
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

                  </div>
                ))}

                {!isEditing && (
                  <button
                    type="button"
                    className="hotel-faq-add-row"
                    onClick={addFaqRow}
                  >
                    + Add Another FAQ
                  </button>
                )}

              </div>

              <div className="hotel-faq-modal-footer">

                <button
                  type="button"
                  className="hotel-faq-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-faq-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update FAQ"
                    : `Create ${faqRows.length} ${
                        faqRows.length === 1
                          ? "FAQ"
                          : "FAQs"
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

export default HotelFaq;