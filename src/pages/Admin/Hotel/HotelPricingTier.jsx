import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
  getHotels,
  getHotelPricingTiersCms,
  createHotelPricingTiers,
  updateHotelPricingTier,
  changeHotelPricingTierStatus,
  deleteHotelPricingTier,
} from "../../../api/BackendApi";

import "./HotelPricingTier.css";

const createEmptyTier = () => ({
  room_name: "",
  room_code: "",
  room_description: "",
  price_npr: "",
  pricing_unit: "PER_NIGHT",
  max_guests: 1,
  max_adults: "",
  max_children: "",
  bed_type: "",
  room_size: "",
  status: "ACTIVE",
  display_order: 0,
});

const HotelPricingTier = () => {
  const [pricingTiers, setPricingTiers] = useState([]);
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
  const [tiers, setTiers] = useState([createEmptyTier()]);

  useEffect(() => {
    fetchPricingTiers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchHotels();
  }, []);

  // =========================================================
  // FETCH CMS PRICING TIERS
  // =========================================================

  const fetchPricingTiers = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getHotelPricingTiersCms(page);

      const paginatedData = response.data?.data;

      setPricingTiers(paginatedData?.data || []);
      setCurrentPage(paginatedData?.current_page || 1);
      setLastPage(paginatedData?.last_page || 1);
      setTotal(paginatedData?.total || 0);
    } catch (error) {
      console.error("Failed to fetch hotel pricing tiers:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to fetch hotel pricing tiers.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH HOTELS FOR DROPDOWN
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
    setTiers([createEmptyTier()]);
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
  // MULTIPLE CREATE ROWS
  // =========================================================

  const handleTierChange = (index, field, value) => {
    setTiers((previous) =>
      previous.map((tier, tierIndex) =>
        tierIndex === index
          ? {
              ...tier,
              [field]: value,
            }
          : tier
      )
    );
  };

  const addTier = () => {
    setTiers((previous) => [
      ...previous,
      createEmptyTier(),
    ]);
  };

  const removeTier = (index) => {
    if (tiers.length === 1) return;

    setTiers((previous) =>
      previous.filter((_, tierIndex) => tierIndex !== index)
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

        pricing_tiers: tiers.map((tier) => ({
          room_name: tier.room_name,
          room_code: tier.room_code || null,
          room_description:
            tier.room_description || null,

          price_npr: Number(tier.price_npr),

          pricing_unit:
            tier.pricing_unit || "PER_NIGHT",

          max_guests: Number(tier.max_guests),

          max_adults:
            tier.max_adults === ""
              ? null
              : Number(tier.max_adults),

          max_children:
            tier.max_children === ""
              ? null
              : Number(tier.max_children),

          bed_type: tier.bed_type || null,
          room_size: tier.room_size || null,

          status: tier.status || "ACTIVE",

          display_order:
            tier.display_order === ""
              ? 0
              : Number(tier.display_order),
        })),
      };

      const response =
        await createHotelPricingTiers(payload);

      await Swal.fire({
        icon: "success",
        title: "Created",
        text:
          response.data?.message ||
          "Hotel pricing tiers created successfully.",
      });

      closeModal();
      await fetchPricingTiers(1);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);

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
          "Failed to create hotel pricing tiers.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (tier) => {
    setIsEditing(true);
    setEditingId(tier.id);

    setHotelId(String(tier.hotel_id));

    setTiers([
      {
        room_name: tier.room_name || "",
        room_code: tier.room_code || "",
        room_description:
          tier.room_description || "",

        price_npr: tier.price_npr ?? "",

        pricing_unit:
          tier.pricing_unit || "PER_NIGHT",

        max_guests: tier.max_guests ?? 1,
        max_adults: tier.max_adults ?? "",
        max_children: tier.max_children ?? "",

        bed_type: tier.bed_type || "",
        room_size: tier.room_size || "",

        status: tier.status || "ACTIVE",

        display_order:
          tier.display_order ?? 0,
      },
    ]);

    setShowModal(true);
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingId || !hotelId) return;

    const tier = tiers[0];

    try {
      setSaving(true);

      const payload = {
        hotel_id: Number(hotelId),

        room_name: tier.room_name,
        room_code: tier.room_code || null,
        room_description:
          tier.room_description || null,

        price_npr: Number(tier.price_npr),

        pricing_unit:
          tier.pricing_unit || "PER_NIGHT",

        max_guests: Number(tier.max_guests),

        max_adults:
          tier.max_adults === ""
            ? null
            : Number(tier.max_adults),

        max_children:
          tier.max_children === ""
            ? null
            : Number(tier.max_children),

        bed_type: tier.bed_type || null,
        room_size: tier.room_size || null,

        status: tier.status,

        display_order:
          tier.display_order === ""
            ? 0
            : Number(tier.display_order),
      };

      const response =
        await updateHotelPricingTier(
          editingId,
          payload
        );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel pricing tier updated successfully.",
      });

      closeModal();
      await fetchPricingTiers(currentPage);
    } catch (error) {
      console.error(error);

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
          "Failed to update hotel pricing tier.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange = async (tier) => {
    const nextStatus =
      tier.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const result = await Swal.fire({
      icon: "question",
      title: "Change status?",
      text: `Change ${tier.room_name} to ${nextStatus}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
    });

    if (!result.isConfirmed) return;

    try {
      await changeHotelPricingTierStatus(tier.id);

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Pricing tier status changed successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      await fetchPricingTiers(currentPage);
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

  const handleDelete = async (tier) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete pricing tier?",
      text: `Are you sure you want to delete "${tier.room_name}"?`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const response =
        await deleteHotelPricingTier(tier.id);

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text:
          response.data?.message ||
          "Hotel pricing tier deleted successfully.",
      });

      await fetchPricingTiers(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to delete hotel pricing tier.",
      });
    }
  };

  const formatPricingUnit = (value) => {
    if (value === "PER_DAY") return "Per Day";

    return "Per Night";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <main className="dashboard-content">
          <div className="hotel-pricing-page">
            <div className="hotel-pricing-page-header">
              <div>
                <h1>Hotel Pricing Tiers</h1>

                <p>
                  Manage hotel rooms, capacity and
                  pricing.
                </p>
              </div>

              <button
                type="button"
                className="hotel-pricing-add-button"
                onClick={openCreateModal}
              >
                + Add Pricing Tier
              </button>
            </div>

            <div className="hotel-pricing-card">
              <div className="hotel-pricing-card-header">
                <div>
                  <h2>Pricing Tier List</h2>

                  <p>
                    {total}{" "}
                    {total === 1
                      ? "pricing tier"
                      : "pricing tiers"}
                  </p>
                </div>
              </div>

              <div className="hotel-pricing-table-wrapper">
                <table className="hotel-pricing-table">
                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Hotel</th>
                      <th>Room</th>
                      <th>Room Code</th>
                      <th>Price</th>
                      <th>Pricing Unit</th>
                      <th>Guests</th>
                      <th>Adults</th>
                      <th>Children</th>
                      <th>Bed Type</th>
                      <th>Room Size</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="14"
                          className="hotel-pricing-empty"
                        >
                          Loading pricing tiers...
                        </td>
                      </tr>
                    ) : pricingTiers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="14"
                          className="hotel-pricing-empty"
                        >
                          No hotel pricing tiers found.
                        </td>
                      </tr>
                    ) : (
                      pricingTiers.map(
                        (tier, index) => (
                          <tr key={tier.id}>
                            <td>
                              {(currentPage - 1) *
                                10 +
                                index +
                                1}
                            </td>

                            <td>
                              <strong>
                                {tier.hotel
                                  ?.hotel_name ||
                                  tier.hotel?.name ||
                                  "-"}
                              </strong>
                            </td>

                            <td>
                              <div className="hotel-pricing-room">
                                <strong>
                                  {tier.room_name}
                                </strong>

                                {tier.room_description && (
                                  <span>
                                    {
                                      tier.room_description
                                    }
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              {tier.room_code || "-"}
                            </td>

                            <td className="hotel-pricing-price">
                              NPR{" "}
                              {Number(
                                tier.price_npr
                              ).toLocaleString()}
                            </td>

                            <td>
                              {formatPricingUnit(
                                tier.pricing_unit
                              )}
                            </td>

                            <td>
                              {tier.max_guests}
                            </td>

                            <td>
                              {tier.max_adults ??
                                "-"}
                            </td>

                            <td>
                              {tier.max_children ??
                                "-"}
                            </td>

                            <td>
                              {tier.bed_type || "-"}
                            </td>

                            <td>
                              {tier.room_size || "-"}
                            </td>

                            <td>
                              {tier.display_order}
                            </td>

                            <td>
                              <button
                                type="button"
                                className={`hotel-pricing-status ${
                                  tier.status ===
                                  "ACTIVE"
                                    ? "active"
                                    : "inactive"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    tier
                                  )
                                }
                              >
                                {tier.status}
                              </button>
                            </td>

                            <td>
                              <div className="hotel-pricing-actions">
                                <button
                                  type="button"
                                  className="hotel-pricing-edit"
                                  onClick={() =>
                                    openEditModal(
                                      tier
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="hotel-pricing-delete"
                                  onClick={() =>
                                    handleDelete(
                                      tier
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
                <div className="hotel-pricing-pagination">
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
          className="hotel-pricing-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="hotel-pricing-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="hotel-pricing-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Edit Hotel Pricing Tier"
                    : "Add Hotel Pricing Tiers"}
                </h2>

                <p>
                  {isEditing
                    ? "Update room and pricing information."
                    : "Select one hotel and add one or more room pricing tiers."}
                </p>
              </div>

              <button
                type="button"
                className="hotel-pricing-modal-close"
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
              <div className="hotel-pricing-modal-body">
                <div className="hotel-pricing-form-group hotel-pricing-hotel-select">
                  <label>
                    Hotel{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

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

                {tiers.map((tier, index) => (
                  <div
                    className="hotel-pricing-tier-form-card"
                    key={index}
                  >
                    <div className="hotel-pricing-tier-form-header">
                      <h3>
                        {isEditing
                          ? "Pricing Tier"
                          : `Pricing Tier ${
                              index + 1
                            }`}
                      </h3>

                      {!isEditing &&
                        tiers.length > 1 && (
                          <button
                            type="button"
                            className="hotel-pricing-remove-tier"
                            onClick={() =>
                              removeTier(index)
                            }
                          >
                            Remove
                          </button>
                        )}
                    </div>

                    <div className="hotel-pricing-form-grid">
                      <div className="hotel-pricing-form-group">
                        <label>
                          Room Name *
                        </label>

                        <input
                          type="text"
                          value={
                            tier.room_name
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "room_name",
                              event.target.value
                            )
                          }
                          placeholder="Deluxe Double Room"
                          required
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Room Code
                        </label>

                        <input
                          type="text"
                          value={
                            tier.room_code
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "room_code",
                              event.target.value
                            )
                          }
                          placeholder="DLX-01"
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Price (NPR) *
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            tier.price_npr
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "price_npr",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Pricing Unit
                        </label>

                        <select
                          value={
                            tier.pricing_unit
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "pricing_unit",
                              event.target.value
                            )
                          }
                        >
                          <option value="PER_NIGHT">
                            Per Night
                          </option>

                          <option value="PER_DAY">
                            Per Day
                          </option>
                        </select>
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Max Guests *
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={
                            tier.max_guests
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "max_guests",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Max Adults
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            tier.max_adults
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "max_adults",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Max Children
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            tier.max_children
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "max_children",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Bed Type
                        </label>

                        <input
                          type="text"
                          value={
                            tier.bed_type
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "bed_type",
                              event.target.value
                            )
                          }
                          placeholder="King Bed"
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Room Size
                        </label>

                        <input
                          type="text"
                          value={
                            tier.room_size
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "room_size",
                              event.target.value
                            )
                          }
                          placeholder="35 sq.m"
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>
                          Display Order
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            tier.display_order
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "display_order",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="hotel-pricing-form-group">
                        <label>Status</label>

                        <select
                          value={tier.status}
                          onChange={(event) =>
                            handleTierChange(
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

                      <div className="hotel-pricing-form-group hotel-pricing-description">
                        <label>
                          Room Description
                        </label>

                        <textarea
                          rows="3"
                          value={
                            tier.room_description
                          }
                          onChange={(event) =>
                            handleTierChange(
                              index,
                              "room_description",
                              event.target.value
                            )
                          }
                          placeholder="Enter room description..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {!isEditing && (
                  <button
                    type="button"
                    className="hotel-pricing-add-tier"
                    onClick={addTier}
                  >
                    + Add Another Pricing Tier
                  </button>
                )}
              </div>

              <div className="hotel-pricing-modal-footer">
                <button
                  type="button"
                  className="hotel-pricing-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-pricing-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update Pricing Tier"
                    : `Create ${
                        tiers.length
                      } Pricing ${
                        tiers.length === 1
                          ? "Tier"
                          : "Tiers"
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

export default HotelPricingTier;