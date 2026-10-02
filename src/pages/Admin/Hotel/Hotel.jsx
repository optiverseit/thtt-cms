import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
  getHotelsCms,
  createHotel,
  updateHotel,
  changeHotelStatus,
  deleteHotel,
} from "../../../api/BackendApi";

import "./Hotel.css";

const emptyImage = () => ({
  file: null,
  preview: "",
  image_type: "GALLERY",
  alt_text: "",
  is_primary: false,
  display_order: 0,
});

const initialForm = {
  hotel_code: "",
  hotel_name: "",
  slug: "",
  short_description: "",
  description: "",
  address: "",
  city: "",
  country: "",
  stay_type: "PER_NIGHT",
  rating: "",
  available_from: "",
  available_to: "",
  check_in_time: "",
  check_out_time: "",
  status: "ACTIVE",
  is_featured: false,
  display_order: 0,
};

const Hotel = () => {
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [images, setImages] = useState([
    emptyImage(),
  ]);

  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchHotels(currentPage);
  }, [currentPage]);

  // =========================================================
  // FETCH
  // =========================================================

  const fetchHotels = async (page = 1) => {
    try {
      setLoading(true);

      const response = await getHotelsCms(page);
      const pagination = response.data?.data;

      setHotels(pagination?.data || []);
      setCurrentPage(pagination?.current_page || 1);
      setLastPage(pagination?.last_page || 1);
      setTotal(pagination?.total || 0);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to fetch hotels.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORM
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    images.forEach((image) => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });

    setForm(initialForm);
    setImages([emptyImage()]);
    setExistingImages([]);

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
  // IMAGES
  // =========================================================

  const handleImageChange = (index, field, value) => {
    setImages((previous) =>
      previous.map((image, imageIndex) => {
        if (imageIndex !== index) {
          return image;
        }

        if (field === "file") {
          if (image.preview) {
            URL.revokeObjectURL(image.preview);
          }

          return {
            ...image,
            file: value,
            preview: value
              ? URL.createObjectURL(value)
              : "",
          };
        }

        return {
          ...image,
          [field]: value,
        };
      })
    );
  };

  const addImage = () => {
    setImages((previous) => [
      ...previous,
      {
        ...emptyImage(),
        display_order: previous.length,
      },
    ]);
  };

  const removeImage = (index) => {
    setImages((previous) => {
      const target = previous[index];

      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }

      return previous.filter(
        (_, imageIndex) => imageIndex !== index
      );
    });
  };

  // =========================================================
  // BUILD FORMDATA
  // =========================================================

  const buildFormData = (includeImages = true) => {
    const data = new FormData();

    data.append("hotel_code", form.hotel_code);
    data.append("hotel_name", form.hotel_name);

    if (form.slug) {
      data.append("slug", form.slug);
    }

    if (form.short_description) {
      data.append(
        "short_description",
        form.short_description
      );
    }

    if (form.description) {
      data.append("description", form.description);
    }

    if (form.address) {
      data.append("address", form.address);
    }

    if (form.city) {
      data.append("city", form.city);
    }

    if (form.country) {
      data.append("country", form.country);
    }

    data.append("stay_type", form.stay_type);

    if (form.rating !== "") {
      data.append("rating", form.rating);
    }

    if (form.available_from) {
      data.append(
        "available_from",
        form.available_from
      );
    }

    if (form.available_to) {
      data.append("available_to", form.available_to);
    }

    if (form.check_in_time) {
      data.append("check_in_time", form.check_in_time);
    }

    if (form.check_out_time) {
      data.append(
        "check_out_time",
        form.check_out_time
      );
    }

    data.append("status", form.status);

    data.append(
      "is_featured",
      form.is_featured ? "1" : "0"
    );

    data.append(
      "display_order",
      String(form.display_order || 0)
    );

    if (includeImages) {
      const validImages = images.filter(
        (image) => image.file
      );

      validImages.forEach((image, index) => {
        data.append(
          `images[${index}][file]`,
          image.file
        );

        data.append(
          `images[${index}][image_type]`,
          image.image_type
        );

        if (image.alt_text) {
          data.append(
            `images[${index}][alt_text]`,
            image.alt_text
          );
        }

        data.append(
          `images[${index}][is_primary]`,
          image.is_primary ? "1" : "0"
        );

        data.append(
          `images[${index}][display_order]`,
          String(image.display_order || 0)
        );
      });
    }

    return data;
  };

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    const validImages = images.filter(
      (image) => image.file
    );

    if (validImages.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Image Required",
        text: "Please upload at least one hotel image.",
      });

      return;
    }

    try {
      setSaving(true);

      const data = buildFormData(true);

      const response = await createHotel(data);

      await Swal.fire({
        icon: "success",
        title: "Created",
        text:
          response.data?.message ||
          "Hotel created successfully.",
      });

      setShowModal(false);
      resetForm();

      if (currentPage === 1) {
        await fetchHotels(1);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error(error);

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
          "Failed to create hotel.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditModal = (hotel) => {
    resetForm();

    setIsEditing(true);
    setEditingId(hotel.id);

    setForm({
      hotel_code: hotel.hotel_code || "",
      hotel_name: hotel.hotel_name || "",
      slug: hotel.slug || "",
      short_description:
        hotel.short_description || "",
      description: hotel.description || "",
      address: hotel.address || "",
      city: hotel.city || "",
      country: hotel.country || "",
      stay_type: hotel.stay_type || "PER_NIGHT",
      rating: hotel.rating ?? "",
      available_from: hotel.available_from || "",
      available_to: hotel.available_to || "",
      check_in_time:
        hotel.check_in_time?.substring(0, 5) || "",
      check_out_time:
        hotel.check_out_time?.substring(0, 5) || "",
      status: hotel.status || "ACTIVE",
      is_featured: Boolean(hotel.is_featured),
      display_order: hotel.display_order ?? 0,
    });

    setExistingImages(hotel.images || []);

    // New images are optional during update
    setImages([]);

    setShowModal(true);
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingId) return;

    try {
      setSaving(true);

      const hasNewImages = images.some(
        (image) => image.file
      );

      const data = buildFormData(hasNewImages);

      const response = await updateHotel(
        editingId,
        data
      );

      await Swal.fire({
        icon: "success",
        title: "Updated",
        text:
          response.data?.message ||
          "Hotel updated successfully.",
      });

      setShowModal(false);
      resetForm();

      await fetchHotels(currentPage);
    } catch (error) {
      console.error(error);

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
          "Failed to update hotel.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange = async (hotel) => {
    const next =
      hotel.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    const result = await Swal.fire({
      icon: "question",
      title: "Change status?",
      text: `Change ${hotel.hotel_name} to ${next}?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!result.isConfirmed) return;

    try {
      await changeHotelStatus(hotel.id);

      await fetchHotels(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to change hotel status.",
      });
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (hotel) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete hotel?",
      text: `${hotel.hotel_name} will be permanently deleted.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteHotel(hotel.id);

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Hotel deleted successfully.",
      });

      await fetchHotels(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Failed to delete hotel.",
      });
    }
  };

  // =========================================================
  // PRIMARY IMAGE
  // =========================================================

  const getPrimaryImage = (hotel) => {
    if (!hotel.images?.length) {
      return null;
    }

    return (
      hotel.images.find(
        (image) => image.is_primary
      ) ||
      hotel.images.find(
        (image) => image.image_type === "COVER"
      ) ||
      hotel.images[0]
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <main className="dashboard-content">
          <div className="hotel-page">

            <div className="hotel-page-header">
              <div>
                <h1>Hotels</h1>
                <p>
                  Manage hotels, availability and images.
                </p>
              </div>

              <button
                className="hotel-add-button"
                onClick={openCreateModal}
              >
                + Add Hotel
              </button>
            </div>

            <div className="hotel-card">

              <div className="hotel-card-header">
                <div>
                  <h2>Hotel List</h2>
                  <p>{total} hotels</p>
                </div>
              </div>

              <div className="hotel-table-wrapper">
                <table className="hotel-table">

                  <thead>
                    <tr>
                      <th>S.N.</th>
                      <th>Hotel</th>
                      <th>Code</th>
                      <th>Location</th>
                      <th>Stay Type</th>
                      <th>Rating</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="hotel-empty"
                        >
                          Loading hotels...
                        </td>
                      </tr>
                    ) : hotels.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="hotel-empty"
                        >
                          No hotels found.
                        </td>
                      </tr>
                    ) : (
                      hotels.map((hotel, index) => {
                        const image =
                          getPrimaryImage(hotel);

                        return (
                          <tr key={hotel.id}>

                            <td>
                              {(currentPage - 1) *
                                10 +
                                index +
                                1}
                            </td>

                            <td>
                              <div className="hotel-name-cell">

                                {image ? (
                                  <img
                                    src={image.image_url}
                                    alt={
                                      image.alt_text ||
                                      hotel.hotel_name
                                    }
                                  />
                                ) : (
                                  <div className="hotel-image-placeholder">
                                    —
                                  </div>
                                )}

                                <div>
                                  <strong>
                                    {hotel.hotel_name}
                                  </strong>

                                  <span>
                                    {hotel.short_description ||
                                      ""}
                                  </span>
                                </div>

                              </div>
                            </td>

                            <td>{hotel.hotel_code}</td>

                            <td>
                              {[hotel.city, hotel.country]
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </td>

                            <td>
                              {hotel.stay_type ===
                              "PER_DAY"
                                ? "Per Day"
                                : "Per Night"}
                            </td>

                            <td>
                              {hotel.rating
                                ? `★ ${hotel.rating}`
                                : "-"}
                            </td>

                            <td>
                              {hotel.is_featured
                                ? "Yes"
                                : "No"}
                            </td>

                            <td>
                              <button
                                className={`hotel-status ${
                                  hotel.status ===
                                  "ACTIVE"
                                    ? "active"
                                    : "inactive"
                                }`}
                                onClick={() =>
                                  handleStatusChange(
                                    hotel
                                  )
                                }
                              >
                                {hotel.status}
                              </button>
                            </td>

                            <td>
                              <div className="hotel-actions">

                                <button
                                  className="hotel-edit"
                                  onClick={() =>
                                    openEditModal(
                                      hotel
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="hotel-delete"
                                  onClick={() =>
                                    handleDelete(
                                      hotel
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>

                </table>
              </div>

              {!loading && lastPage > 1 && (
                <div className="hotel-pagination">
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
          className="hotel-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="hotel-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="hotel-modal-header">
              <div>
                <h2>
                  {isEditing
                    ? "Edit Hotel"
                    : "Add Hotel"}
                </h2>

                <p>
                  Enter hotel details and images.
                </p>
              </div>

              <button
                type="button"
                className="hotel-modal-close"
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
              <div className="hotel-modal-body">

                <h3 className="hotel-section-title">
                  Basic Information
                </h3>

                <div className="hotel-form-grid">

                  <div className="hotel-form-group">
                    <label>Hotel Code *</label>
                    <input
                      name="hotel_code"
                      value={form.hotel_code}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Hotel Name *</label>
                    <input
                      name="hotel_name"
                      value={form.hotel_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Slug</label>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Stay Type</label>
                    <select
                      name="stay_type"
                      value={form.stay_type}
                      onChange={handleChange}
                    >
                      <option value="PER_NIGHT">
                        Per Night
                      </option>
                      <option value="PER_DAY">
                        Per Day
                      </option>
                    </select>
                  </div>

                  <div className="hotel-form-group full">
                    <label>Short Description</label>
                    <textarea
                      name="short_description"
                      value={
                        form.short_description
                      }
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>

                  <div className="hotel-form-group full">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="5"
                    />
                  </div>

                </div>

                <h3 className="hotel-section-title">
                  Location
                </h3>

                <div className="hotel-form-grid">

                  <div className="hotel-form-group full">
                    <label>Address</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Country</label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <h3 className="hotel-section-title">
                  Availability
                </h3>

                <div className="hotel-form-grid">

                  <div className="hotel-form-group">
                    <label>Available From</label>
                    <input
                      type="date"
                      name="available_from"
                      value={form.available_from}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Available To</label>
                    <input
                      type="date"
                      name="available_to"
                      value={form.available_to}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Check-in Time</label>
                    <input
                      type="time"
                      name="check_in_time"
                      value={form.check_in_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Check-out Time</label>
                    <input
                      type="time"
                      name="check_out_time"
                      value={form.check_out_time}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <h3 className="hotel-section-title">
                  Settings
                </h3>

                <div className="hotel-form-grid">

                  <div className="hotel-form-group">
                    <label>Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      name="rating"
                      value={form.rating}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      min="0"
                      name="display_order"
                      value={form.display_order}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="hotel-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">
                        Active
                      </option>
                      <option value="INACTIVE">
                        Inactive
                      </option>
                    </select>
                  </div>

                  <div className="hotel-form-group hotel-checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={form.is_featured}
                        onChange={handleChange}
                      />
                      Featured Hotel
                    </label>
                  </div>

                </div>

                {/* EXISTING IMAGES */}

                {isEditing &&
                  existingImages.length > 0 && (
                    <>
                      <h3 className="hotel-section-title">
                        Existing Images
                      </h3>

                      <div className="hotel-existing-images">
                        {existingImages.map(
                          (image) => (
                            <div
                              key={image.id}
                              className="hotel-existing-image"
                            >
                              <img
                                src={image.image_url}
                                alt={
                                  image.alt_text ||
                                  "Hotel"
                                }
                              />

                              <span>
                                {image.image_type}
                              </span>

                              {image.is_primary && (
                                <strong>
                                  Primary
                                </strong>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}

                <div className="hotel-image-title-row">
                  <h3 className="hotel-section-title">
                    {isEditing
                      ? "Add New Images"
                      : "Hotel Images"}
                  </h3>

                  <button
                    type="button"
                    className="hotel-add-image"
                    onClick={addImage}
                  >
                    + Add Image
                  </button>
                </div>

                {images.length === 0 && (
                  <button
                    type="button"
                    className="hotel-add-first-image"
                    onClick={addImage}
                  >
                    + Upload New Image
                  </button>
                )}

                {images.map((image, index) => (
                  <div
                    className="hotel-image-card"
                    key={index}
                  >

                    <div className="hotel-image-card-header">
                      <strong>
                        Image {index + 1}
                      </strong>

                      {(isEditing ||
                        images.length > 1) && (
                        <button
                          type="button"
                          onClick={() =>
                            removeImage(index)
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="hotel-image-content">

                      <div className="hotel-image-preview">

                        {image.preview ? (
                          <img
                            src={image.preview}
                            alt="Preview"
                          />
                        ) : (
                          <span>No image</span>
                        )}

                      </div>

                      <div className="hotel-image-fields">

                        <div className="hotel-form-group full">
                          <label>
                            Image File{" "}
                            {!isEditing && "*"}
                          </label>

                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) =>
                              handleImageChange(
                                index,
                                "file",
                                e.target.files?.[0] ||
                                  null
                              )
                            }
                          />
                        </div>

                        <div className="hotel-form-grid">

                          <div className="hotel-form-group">
                            <label>Image Type</label>

                            <select
                              value={
                                image.image_type
                              }
                              onChange={(e) =>
                                handleImageChange(
                                  index,
                                  "image_type",
                                  e.target.value
                                )
                              }
                            >
                              <option value="COVER">
                                Cover
                              </option>
                              <option value="GALLERY">
                                Gallery
                              </option>
                            </select>
                          </div>

                          <div className="hotel-form-group">
                            <label>
                              Display Order
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={
                                image.display_order
                              }
                              onChange={(e) =>
                                handleImageChange(
                                  index,
                                  "display_order",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="hotel-form-group full">
                            <label>Alt Text</label>

                            <input
                              value={image.alt_text}
                              onChange={(e) =>
                                handleImageChange(
                                  index,
                                  "alt_text",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="hotel-form-group hotel-checkbox-group full">
                            <label>
                              <input
                                type="checkbox"
                                checked={
                                  image.is_primary
                                }
                                onChange={(e) =>
                                  handleImageChange(
                                    index,
                                    "is_primary",
                                    e.target.checked
                                  )
                                }
                              />
                              Primary Image
                            </label>
                          </div>

                        </div>

                      </div>
                    </div>
                  </div>
                ))}

              </div>

              <div className="hotel-modal-footer">

                <button
                  type="button"
                  className="hotel-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update Hotel"
                    : "Create Hotel"}
                </button>

              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Hotel;