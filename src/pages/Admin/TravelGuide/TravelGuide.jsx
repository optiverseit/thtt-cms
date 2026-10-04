import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllTravelGuidesCms,
    createTravelGuideCms,
    updateTravelGuideCms,
    updateTravelGuideStatusCms,
    deleteTravelGuideCms,
} from "../../../api/BackendApi";

import "./TravelGuide.css";

const emptyForm = {
    title: "",
    description: "",
    status: "ACTIVE",
    display_order: 0,
};

const TravelGuide = () => {
    const [travelGuides, setTravelGuides] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [statusLoadingId, setStatusLoadingId] = useState(null);

    useEffect(() => {
        fetchTravelGuides(currentPage);
    }, [currentPage]);

    const fetchTravelGuides = async (page = 1) => {
        try {
            setLoading(true);

            const response = await getAllTravelGuidesCms(page);

            const data = response.data?.data;

            setTravelGuides(data?.data || []);
            setCurrentPage(data?.current_page || 1);
            setLastPage(data?.last_page || 1);
            setTotal(data?.total || 0);
        } catch (error) {
            Swal.fire(
                "Error",
                error.response?.data?.message ||
                    "Failed to fetch travel guides.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setIsEditing(false);
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (travelGuide) => {
        setIsEditing(true);
        setEditingId(travelGuide.id);

        setForm({
            title: travelGuide.title || "",
            description: travelGuide.description || "",
            status: travelGuide.status || "ACTIVE",
            display_order: travelGuide.display_order ?? 0,
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        resetForm();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.title.trim()) {
            Swal.fire(
                "Title Required",
                "Please enter the travel guide title.",
                "warning"
            );
            return;
        }

        if (!form.description.trim()) {
            Swal.fire(
                "Description Required",
                "Please enter the travel guide description.",
                "warning"
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: form.title,
                description: form.description,
                status: form.status,
                display_order: Number(form.display_order) || 0,
            };

            const response = isEditing
                ? await updateTravelGuideCms(editingId, payload)
                : await createTravelGuideCms(payload);

            await Swal.fire(
                "Success",
                response.data?.message ||
                    `Travel guide ${
                        isEditing ? "updated" : "created"
                    } successfully.`,
                "success"
            );

            setShowModal(false);
            resetForm();

            await fetchTravelGuides(currentPage);
        } catch (error) {
            const errors = error.response?.data?.errors;

            const firstError = errors
                ? Object.values(errors)?.[0]?.[0]
                : null;

            Swal.fire(
                "Failed",
                firstError ||
                    error.response?.data?.message ||
                    "Something went wrong.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (travelGuide) => {
        const newStatus =
            travelGuide.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result = await Swal.fire({
            icon: "question",
            title: "Change status?",
            text: `Change this travel guide to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes, change it",
        });

        if (!result.isConfirmed) return;

        try {
            setStatusLoadingId(travelGuide.id);

            await updateTravelGuideStatusCms(
                travelGuide.id,
                newStatus
            );

            await fetchTravelGuides(currentPage);
        } catch (error) {
            Swal.fire(
                "Failed",
                error.response?.data?.message ||
                    "Failed to change status.",
                "error"
            );
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDelete = async (travelGuide) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete travel guide?",
            text: "This travel guide will be permanently deleted.",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteTravelGuideCms(travelGuide.id);

            await Swal.fire(
                "Deleted",
                "Travel guide deleted successfully.",
                "success"
            );

            await fetchTravelGuides(currentPage);
        } catch (error) {
            Swal.fire(
                "Failed",
                error.response?.data?.message ||
                    "Failed to delete travel guide.",
                "error"
            );
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="travel-guide-page">
                        <div className="travel-guide-page-header">
                            <div>
                                <h1>Travel Guides</h1>

                                <p>
                                    Manage travel guide information displayed
                                    on the website.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="travel-guide-add-button"
                                onClick={openCreateModal}
                            >
                                + Add Travel Guide
                            </button>
                        </div>

                        <div className="travel-guide-card">
                            <div className="travel-guide-card-header">
                                <div>
                                    <h2>Travel Guide List</h2>

                                    <p>
                                        {total}{" "}
                                        {total === 1
                                            ? "travel guide"
                                            : "travel guides"}
                                    </p>
                                </div>
                            </div>

                            <div className="travel-guide-table-wrapper">
                                <table className="travel-guide-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Display Order</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="travel-guide-empty"
                                                >
                                                    Loading travel guides...
                                                </td>
                                            </tr>
                                        ) : travelGuides.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="travel-guide-empty"
                                                >
                                                    No travel guides found.
                                                </td>
                                            </tr>
                                        ) : (
                                            travelGuides.map(
                                                (travelGuide, index) => (
                                                    <tr key={travelGuide.id}>
                                                        <td>
                                                            {(currentPage -
                                                                1) *
                                                                10 +
                                                                index +
                                                                1}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    travelGuide.title
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <div className="travel-guide-description">
                                                                {travelGuide.description ||
                                                                    "-"}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {travelGuide.display_order ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    statusLoadingId ===
                                                                    travelGuide.id
                                                                }
                                                                className={`travel-guide-status ${
                                                                    travelGuide.status ===
                                                                    "ACTIVE"
                                                                        ? "active"
                                                                        : "inactive"
                                                                }`}
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        travelGuide
                                                                    )
                                                                }
                                                            >
                                                                {statusLoadingId ===
                                                                travelGuide.id
                                                                    ? "Loading..."
                                                                    : travelGuide.status}
                                                            </button>
                                                        </td>

                                                        <td>
                                                            <div className="travel-guide-actions">
                                                                <button
                                                                    type="button"
                                                                    className="travel-guide-edit"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            travelGuide
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="travel-guide-delete"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            travelGuide
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
                                <div className="travel-guide-pagination">
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
                    className="travel-guide-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="travel-guide-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="travel-guide-modal-header">
                            <div>
                                <h2>
                                    {isEditing
                                        ? "Edit Travel Guide"
                                        : "Add Travel Guide"}
                                </h2>

                                <p>
                                    {isEditing
                                        ? "Update travel guide information."
                                        : "Create a new travel guide."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="travel-guide-modal-close"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="travel-guide-modal-body">
                                <div className="travel-guide-main-grid">
                                    <div className="travel-guide-form-group">
                                        <label>Title *</label>

                                        <input
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            placeholder="Getting in Nepal"
                                            required
                                        />
                                    </div>

                                    <div className="travel-guide-form-group">
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

                                    <div className="travel-guide-form-group">
                                        <label>Display Order</label>

                                        <input
                                            type="number"
                                            min="0"
                                            name="display_order"
                                            value={form.display_order}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="travel-guide-form-group travel-guide-description-group">
                                    <label>Description *</label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Enter travel guide description..."
                                        rows="10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="travel-guide-modal-footer">
                                <button
                                    type="button"
                                    className="travel-guide-cancel"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="travel-guide-save"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : isEditing
                                        ? "Update Travel Guide"
                                        : "Create Travel Guide"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TravelGuide;