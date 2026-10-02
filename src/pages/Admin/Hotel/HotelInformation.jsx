import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
  getHotels,
  getHotelInformationCms,
  createHotelInformation,
  updateHotelInformation,
  changeHotelInformationStatus,
  deleteHotelInformation,
} from "../../../api/BackendApi";

import "./HotelInformation.css";

const INFORMATION_TYPES = [
  {
    value: "HIGHLIGHT",
    label: "Highlight",
  },
  {
    value: "AMENITY",
    label: "Amenity",
  },
  {
    value: "INCLUSION",
    label: "Inclusion",
  },
  {
    value: "EXCLUSION",
    label: "Exclusion",
  },
  {
    value: "WHAT_TO_BRING",
    label: "What To Bring",
  },
];

const createEmptyInformation = () => ({
  content: "",
  display_order: 0,
  status: "ACTIVE",
});

const HotelInformation = () => {
  const [information, setInformation] = useState([]);
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
  const [type, setType] = useState("");

  const [informationRows, setInformationRows] = useState([
    createEmptyInformation(),
  ]);

  // =========================================================
  // LOAD CMS INFORMATION
  // =========================================================

  useEffect(() => {
    fetchInformation(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchInformation = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getHotelInformationCms(page);

      const paginationData = response.data?.data;

      setInformation(paginationData?.data || []);
      setCurrentPage(paginationData?.current_page || 1);
      setLastPage(paginationData?.last_page || 1);
      setTotal(paginationData?.total || 0);
    } catch (error) {
      console.error(
        "Failed to fetch hotel information:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to fetch hotel information.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD HOTELS
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
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setHotelId("");
    setType("");

    setInformationRows([
      createEmptyInformation(),
    ]);

    setIsEditing(false);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  // =========================================================
  // MULTIPLE INFORMATION ROWS
  // =========================================================

  const handleInformationChange = (
    index,
    field,
    value
  ) => {
    setInformationRows((previous) =>
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

  const addInformationRow = () => {
    setInformationRows((previous) => [
      ...previous,
      createEmptyInformation(),
    ]);
  };

  const removeInformationRow = (index) => {
    if (informationRows.length === 1) {
      return;
    }

    setInformationRows((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
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

    if (!type) {
      Swal.fire({
        icon: "warning",
        title: "Type Required",
        text: "Please select an information type.",
      });

      return;
    }

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        type,

        information: informationRows.map(
          (item) => ({
            content: item.content,

            display_order:
              item.display_order === ""
                ? 0
                : Number(item.display_order),

            status: item.status || "ACTIVE",
          })
        ),
      };

      const response =
        await createHotelInformation(payload);

      await Swal.fire({
        icon: "success",
        title: "Created",
        text:
          response.data?.message ||
          "Hotel information created successfully.",
      });

      setShowModal(false);
      resetForm();

      if (currentPage === 1) {
        await fetchInformation(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error(
        "Failed to create hotel information:",
        error
      );

      const validationErrors =
        error.response?.data?.errors;

      const firstError = validationErrors
        ? Object.values(validationErrors)?.[0]?.[0]
        : null;

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          firstError ||
          error.response?.data?.message ||
          "Failed to create hotel information.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditingId(item.id);

    setHotelId(String(item.hotel_id));
    setType(item.type || "");

    setInformationRows([
      {
        content: item.content || "",

        display_order:
          item.display_order ?? 0,

        status:
          item.status || "ACTIVE",
      },
    ]);

    setShowModal(true);
  };

  // =========================================================
  // UPDATE SINGLE INFORMATION
  // =========================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingId) {
      return;
    }

    const item = informationRows[0];

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        type,

        content: item.content,

        display_order:
          item.display_order === ""
            ? 0
            : Number(item.display_order),

        status: item.status,
      };

      const response =
        await updateHotelInformation(
          editingId,
          payload
        );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel information updated successfully.",
      });

      setShowModal(false);
      resetForm();

      await fetchInformation(currentPage);
    } catch (error) {
      console.error(
        "Failed to update hotel information:",
        error
      );

      const validationErrors =
        error.response?.data?.errors;

      const firstError = validationErrors
        ? Object.values(validationErrors)?.[0]?.[0]
        : null;

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          firstError ||
          error.response?.data?.message ||
          "Failed to update hotel information.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CHANGE STATUS
  // =========================================================

  const handleStatusChange = async (item) => {
    const nextStatus =
      item.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const result = await Swal.fire({
      icon: "question",
      title: "Change status?",
      text: `Change this information to ${nextStatus}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response =
        await changeHotelInformationStatus(
          item.id
        );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Status changed successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchInformation(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to change status.",
      });
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete information?",
      text:
        "This hotel information will be permanently deleted.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response =
        await deleteHotelInformation(item.id);

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text:
          response.data?.message ||
          "Hotel information deleted successfully.",
      });

      await fetchInformation(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to delete hotel information.",
      });
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getTypeLabel = (value) => {
    return (
      INFORMATION_TYPES.find(
        (item) => item.value === value
      )?.label || value
    );
  };

  const getHotelName = (item) => {
    return (
      item.hotel?.hotel_name ||
      item.hotel?.name ||
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
          <div className="hotel-information-page">
            <div className="hotel-information-page-header">
              <div>
                <h1>Hotel Information</h1>

                <p>
                  Manage highlights, amenities,
                  inclusions, exclusions and what to
                  bring.
                </p>
              </div>

              <button
                type="button"
                className="hotel-information-add-button"
                onClick={openCreateModal}
              >
                + Add Information
              </button>
            </div>

            <div className="hotel-information-card">
              <div className="hotel-information-card-header">
                <div>
                  <h2>Information List</h2>

                  <p>
                    {total}{" "}
                    {total === 1
                      ? "information item"
                      : "information items"}
                  </p>
                </div>
              </div>

              <div className="hotel-information-table-wrapper">
                <table className="hotel-information-table">
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Hotel</th>
                      <th>Type</th>
                      <th>Content</th>
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
                          className="hotel-information-empty"
                        >
                          Loading hotel information...
                        </td>
                      </tr>
                    ) : information.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="hotel-information-empty"
                        >
                          No hotel information found.
                        </td>
                      </tr>
                    ) : (
                      information.map(
                        (item, index) => (
                          <tr key={item.id}>
                            <td>
                              {(currentPage - 1) *
                                10 +
                                index +
                                1}
                            </td>

                            <td>
                              <strong>
                                {getHotelName(item)}
                              </strong>
                            </td>

                            <td>
                              <span className="hotel-information-type">
                                {getTypeLabel(
                                  item.type
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="hotel-information-content">
                                {item.content}
                              </div>
                            </td>

                            <td>
                              {item.display_order ??
                                0}
                            </td>

                            <td>
                              <button
                                type="button"
                                className={`hotel-information-status ${
                                  item.status ===
                                  "ACTIVE"
                                    ? "active"
                                    : "inactive"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    item
                                  )
                                }
                              >
                                {item.status}
                              </button>
                            </td>

                            <td>
                              <div className="hotel-information-actions">
                                <button
                                  type="button"
                                  className="hotel-information-edit"
                                  onClick={() =>
                                    openEditModal(
                                      item
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="hotel-information-delete"
                                  onClick={() =>
                                    handleDelete(
                                      item
                                    )
                                  }
                                >
                                  Delete
                                </button>
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
                <div className="hotel-information-pagination">
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
          className="hotel-information-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="hotel-information-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="hotel-information-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Edit Hotel Information"
                    : "Add Hotel Information"}
                </h2>

                <p>
                  {isEditing
                    ? "Update this hotel information item."
                    : "Choose a hotel and type, then add one or more items."}
                </p>
              </div>

              <button
                type="button"
                className="hotel-information-modal-close"
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
              <div className="hotel-information-modal-body">
                <div className="hotel-information-main-grid">
                  <div className="hotel-information-form-group">
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

                  <div className="hotel-information-form-group">
                    <label>
                      Information Type *
                    </label>

                    <select
                      value={type}
                      onChange={(event) =>
                        setType(
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">
                        Select Type
                      </option>

                      {INFORMATION_TYPES.map(
                        (item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {informationRows.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="hotel-information-row-card"
                    >
                      <div className="hotel-information-row-header">
                        <h3>
                          {isEditing
                            ? "Information"
                            : `Information ${
                                index + 1
                              }`}
                        </h3>

                        {!isEditing &&
                          informationRows.length >
                            1 && (
                            <button
                              type="button"
                              className="hotel-information-remove"
                              onClick={() =>
                                removeInformationRow(
                                  index
                                )
                              }
                            >
                              Remove
                            </button>
                          )}
                      </div>

                      <div className="hotel-information-form-group">
                        <label>Content *</label>

                        <textarea
                          rows="4"
                          value={item.content}
                          onChange={(event) =>
                            handleInformationChange(
                              index,
                              "content",
                              event.target.value
                            )
                          }
                          placeholder="Enter information..."
                          required
                        />
                      </div>

                      <div className="hotel-information-row-fields">
                        <div className="hotel-information-form-group">
                          <label>
                            Display Order
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.display_order
                            }
                            onChange={(event) =>
                              handleInformationChange(
                                index,
                                "display_order",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div className="hotel-information-form-group">
                          <label>Status</label>

                          <select
                            value={item.status}
                            onChange={(event) =>
                              handleInformationChange(
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
                  )
                )}

                {!isEditing && (
                  <button
                    type="button"
                    className="hotel-information-add-row"
                    onClick={addInformationRow}
                  >
                    + Add Another Information
                  </button>
                )}
              </div>

              <div className="hotel-information-modal-footer">
                <button
                  type="button"
                  className="hotel-information-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-information-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update Information"
                    : `Create ${
                        informationRows.length
                      } ${
                        informationRows.length ===
                        1
                          ? "Item"
                          : "Items"
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

export default HotelInformation;