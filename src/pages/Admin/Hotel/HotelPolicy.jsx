import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
  getHotels,
  getHotelPoliciesCms,
  createHotelPolicies,
  updateHotelPolicy,
  changeHotelPolicyStatus,
  deleteHotelPolicy,
} from "../../../api/BackendApi";

import "./HotelPolicy.css";

const POLICY_TYPES = [
  { value: "CHECK_IN", label: "Check In" },
  { value: "CHECK_OUT", label: "Check Out" },
  { value: "CANCELLATION", label: "Cancellation" },
  { value: "CHILDREN", label: "Children" },
  { value: "EXTRA_BED", label: "Extra Bed" },
  { value: "PETS", label: "Pets" },
  { value: "PAYMENT", label: "Payment" },
  { value: "OTHER", label: "Other" },
];

const createEmptyPolicy = () => ({
  content: "",
  display_order: 0,
  status: "ACTIVE",
});

const HotelPolicy = () => {
  const [policies, setPolicies] = useState([]);
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

  const [policyRows, setPolicyRows] = useState([
    createEmptyPolicy(),
  ]);

  useEffect(() => {
    fetchPolicies(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchHotels();
  }, []);

  // =========================================================
  // FETCH POLICIES
  // =========================================================

  const fetchPolicies = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getHotelPoliciesCms(page);

      const paginationData = response.data?.data;

      setPolicies(paginationData?.data || []);
      setCurrentPage(paginationData?.current_page || 1);
      setLastPage(paginationData?.last_page || 1);
      setTotal(paginationData?.total || 0);
    } catch (error) {
      console.error("Failed to fetch hotel policies:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to fetch hotel policies.",
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
    setType("");
    setPolicyRows([createEmptyPolicy()]);
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
  // POLICY ROWS
  // =========================================================

  const handlePolicyChange = (index, field, value) => {
    setPolicyRows((previous) =>
      previous.map((policy, policyIndex) =>
        policyIndex === index
          ? {
              ...policy,
              [field]: value,
            }
          : policy
      )
    );
  };

  const addPolicyRow = () => {
    setPolicyRows((previous) => [
      ...previous,
      createEmptyPolicy(),
    ]);
  };

  const removePolicyRow = (index) => {
    if (policyRows.length === 1) return;

    setPolicyRows((previous) =>
      previous.filter(
        (_, policyIndex) => policyIndex !== index
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
        title: "Policy Type Required",
        text: "Please select a policy type.",
      });

      return;
    }

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        type,

        policies: policyRows.map((policy) => ({
          content: policy.content,

          display_order:
            policy.display_order === ""
              ? 0
              : Number(policy.display_order),

          status: policy.status || "ACTIVE",
        })),
      };

      const response = await createHotelPolicies(payload);

      await Swal.fire({
        icon: "success",
        title: "Created",
        text:
          response.data?.message ||
          "Hotel policies created successfully.",
      });

      setShowModal(false);
      resetForm();

      if (currentPage === 1) {
        await fetchPolicies(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to create hotel policies:", error);

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
          "Failed to create hotel policies.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEditModal = (policy) => {
    setIsEditing(true);
    setEditingId(policy.id);

    setHotelId(String(policy.hotel_id));
    setType(policy.type || "");

    setPolicyRows([
      {
        content: policy.content || "",
        display_order: policy.display_order ?? 0,
        status: policy.status || "ACTIVE",
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

    const policy = policyRows[0];

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        type,

        content: policy.content,

        display_order:
          policy.display_order === ""
            ? 0
            : Number(policy.display_order),

        status: policy.status,
      };

      const response = await updateHotelPolicy(
        editingId,
        payload
      );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel policy updated successfully.",
      });

      setShowModal(false);
      resetForm();

      await fetchPolicies(currentPage);
    } catch (error) {
      console.error("Failed to update hotel policy:", error);

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
          "Failed to update hotel policy.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange = async (policy) => {
    const nextStatus =
      policy.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const result = await Swal.fire({
      icon: "question",
      title: "Change status?",
      text: `Change this policy to ${nextStatus}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
    });

    if (!result.isConfirmed) return;

    try {
      const response =
        await changeHotelPolicyStatus(policy.id);

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel policy status changed successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchPolicies(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to change policy status.",
      });
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (policy) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete policy?",
      text: "This hotel policy will be permanently deleted.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const response =
        await deleteHotelPolicy(policy.id);

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text:
          response.data?.message ||
          "Hotel policy deleted successfully.",
      });

      await fetchPolicies(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to delete hotel policy.",
      });
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getTypeLabel = (value) => {
    return (
      POLICY_TYPES.find(
        (item) => item.value === value
      )?.label || value
    );
  };

  const getHotelName = (policy) => {
    return (
      policy.hotel?.hotel_name ||
      policy.hotel?.name ||
      "-"
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <main className="dashboard-content">
          <div className="hotel-policy-page">
            <div className="hotel-policy-page-header">
              <div>
                <h1>Hotel Policies</h1>

                <p>
                  Manage check-in, check-out,
                  cancellation and other hotel policies.
                </p>
              </div>

              <button
                type="button"
                className="hotel-policy-add-button"
                onClick={openCreateModal}
              >
                + Add Policies
              </button>
            </div>

            <div className="hotel-policy-card">
              <div className="hotel-policy-card-header">
                <div>
                  <h2>Policy List</h2>

                  <p>
                    {total}{" "}
                    {total === 1
                      ? "policy"
                      : "policies"}
                  </p>
                </div>
              </div>

              <div className="hotel-policy-table-wrapper">
                <table className="hotel-policy-table">
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Hotel</th>
                      <th>Policy Type</th>
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
                          className="hotel-policy-empty"
                        >
                          Loading hotel policies...
                        </td>
                      </tr>
                    ) : policies.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="hotel-policy-empty"
                        >
                          No hotel policies found.
                        </td>
                      </tr>
                    ) : (
                      policies.map(
                        (policy, index) => (
                          <tr key={policy.id}>
                            <td>
                              {(currentPage - 1) *
                                10 +
                                index +
                                1}
                            </td>

                            <td>
                              <strong>
                                {getHotelName(
                                  policy
                                )}
                              </strong>
                            </td>

                            <td>
                              <span className="hotel-policy-type">
                                {getTypeLabel(
                                  policy.type
                                )}
                              </span>
                            </td>

                            <td>
                              <div className="hotel-policy-content">
                                {policy.content}
                              </div>
                            </td>

                            <td>
                              {policy.display_order ??
                                0}
                            </td>

                            <td>
                              <button
                                type="button"
                                className={`hotel-policy-status ${
                                  policy.status ===
                                  "ACTIVE"
                                    ? "active"
                                    : "inactive"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    policy
                                  )
                                }
                              >
                                {policy.status}
                              </button>
                            </td>

                            <td>
                              <div className="hotel-policy-actions">
                                <button
                                  type="button"
                                  className="hotel-policy-edit"
                                  onClick={() =>
                                    openEditModal(
                                      policy
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="hotel-policy-delete"
                                  onClick={() =>
                                    handleDelete(
                                      policy
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
                <div className="hotel-policy-pagination">
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
          className="hotel-policy-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="hotel-policy-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="hotel-policy-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Edit Hotel Policy"
                    : "Add Hotel Policies"}
                </h2>

                <p>
                  {isEditing
                    ? "Update this hotel policy."
                    : "Choose a hotel and policy type, then add one or more policies."}
                </p>
              </div>

              <button
                type="button"
                className="hotel-policy-modal-close"
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
              <div className="hotel-policy-modal-body">
                <div className="hotel-policy-main-grid">
                  <div className="hotel-policy-form-group">
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

                  <div className="hotel-policy-form-group">
                    <label>Policy Type *</label>

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
                        Select Policy Type
                      </option>

                      {POLICY_TYPES.map(
                        (policyType) => (
                          <option
                            key={
                              policyType.value
                            }
                            value={
                              policyType.value
                            }
                          >
                            {
                              policyType.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {policyRows.map(
                  (policy, index) => (
                    <div
                      key={index}
                      className="hotel-policy-row-card"
                    >
                      <div className="hotel-policy-row-header">
                        <h3>
                          {isEditing
                            ? "Policy"
                            : `Policy ${
                                index + 1
                              }`}
                        </h3>

                        {!isEditing &&
                          policyRows.length >
                            1 && (
                            <button
                              type="button"
                              className="hotel-policy-remove"
                              onClick={() =>
                                removePolicyRow(
                                  index
                                )
                              }
                            >
                              Remove
                            </button>
                          )}
                      </div>

                      <div className="hotel-policy-form-group">
                        <label>
                          Policy Content *
                        </label>

                        <textarea
                          rows="4"
                          value={policy.content}
                          onChange={(event) =>
                            handlePolicyChange(
                              index,
                              "content",
                              event.target.value
                            )
                          }
                          placeholder="Enter policy details..."
                          required
                        />
                      </div>

                      <div className="hotel-policy-row-fields">
                        <div className="hotel-policy-form-group">
                          <label>
                            Display Order
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              policy.display_order
                            }
                            onChange={(event) =>
                              handlePolicyChange(
                                index,
                                "display_order",
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div className="hotel-policy-form-group">
                          <label>Status</label>

                          <select
                            value={policy.status}
                            onChange={(event) =>
                              handlePolicyChange(
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
                    className="hotel-policy-add-row"
                    onClick={addPolicyRow}
                  >
                    + Add Another Policy
                  </button>
                )}
              </div>

              <div className="hotel-policy-modal-footer">
                <button
                  type="button"
                  className="hotel-policy-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-policy-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update Policy"
                    : `Create ${
                        policyRows.length
                      } ${
                        policyRows.length ===
                        1
                          ? "Policy"
                          : "Policies"
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

export default HotelPolicy;