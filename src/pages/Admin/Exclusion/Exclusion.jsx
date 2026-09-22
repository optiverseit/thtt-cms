import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllExclusionsCms,
    getAllPackagesCms,
    createExclusion,
    updateExclusion,
    deleteExclusion,
} from "../../../api/BackendApi";

import "./Exclusion.css";

const Exclusion = () => {
    const [exclusions, setExclusions] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");
    const [item, setItem] = useState("");
    const [displayOrder, setDisplayOrder] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        fetchExclusions();
    }, [page]);

    const fetchExclusions = async () => {
        try {
            setLoading(true);

            const response = await getAllExclusionsCms(page);

            if (response.data.status) {
                setExclusions(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Error fetching exclusions:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load exclusions.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await getAllPackagesCms();

            if (response.data.status) {
                setPackages(response.data.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
        }
    };

    const resetForm = () => {
        setPackageId("");
        setItem("");
        setDisplayOrder("");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!packageId) {
            Swal.fire({
                icon: "warning",
                title: "Package Required",
                text: "Please select a package.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (!item.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Exclusion Required",
                text: "Please enter an exclusion.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = {
            item: item.trim(),
            display_order: displayOrder
                ? Number(displayOrder)
                : 0,
        };

        try {
            setSaving(true);

            let response;

            if (editingId) {
                response = await updateExclusion(
                    editingId,
                    data
                );
            } else {
                response = await createExclusion(
                    packageId,
                    data
                );
            }

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: editingId
                        ? "Exclusion Updated"
                        : "Exclusion Added",
                    text:
                        response.data.message ||
                        (editingId
                            ? "Exclusion updated successfully."
                            : "Exclusion added successfully."),
                    confirmButtonColor: "#351255",
                });

                resetForm();
                fetchExclusions();
            }
        } catch (error) {
            console.error(
                "Error saving exclusion:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to save exclusion.";

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(validationErrors)[0];

                if (Array.isArray(firstError)) {
                    errorMessage = firstError[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: errorMessage,
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (exclusion) => {
        setEditingId(exclusion.id);

        setPackageId(
            exclusion.package_id?.toString() || ""
        );

        setItem(exclusion.item || "");

        setDisplayOrder(
            exclusion.display_order?.toString() || ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Exclusion?",
            text: "This exclusion will be permanently deleted.",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#f52d91",
            cancelButtonColor: "#77717d",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response =
                await deleteExclusion(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Exclusion deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    resetForm();
                }

                fetchExclusions();
            }
        } catch (error) {
            console.error(
                "Error deleting exclusion:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete exclusion.",
                confirmButtonColor: "#351255",
            });
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="exclusion-page">

                        <div className="exclusion-header">
                            <div>
                                <h1>
                                    Package Exclusions
                                </h1>

                                <p>
                                    Manage items and services
                                    excluded from packages.
                                </p>
                            </div>
                        </div>

                        <div className="exclusion-form-card">
                            <div className="exclusion-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Exclusion"
                                        : "Add Exclusion"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected exclusion."
                                        : "Add a new exclusion to a package."}
                                </p>
                            </div>

                            <form
                                className="exclusion-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="exclusion-form-group">
                                    <label>
                                        Package
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={packageId}
                                        onChange={(e) =>
                                            setPackageId(
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            editingId !== null
                                        }
                                    >
                                        <option value="">
                                            Select Package
                                        </option>

                                        {packages.map(
                                            (pkg) => (
                                                <option
                                                    key={pkg.id}
                                                    value={pkg.id}
                                                >
                                                    {pkg.title}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="exclusion-form-group exclusion-item-field">
                                    <label>
                                        Exclusion
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) =>
                                            setItem(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. International airfare"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="exclusion-form-group exclusion-order-field">
                                    <label>
                                        Display Order
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={displayOrder}
                                        onChange={(e) =>
                                            setDisplayOrder(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="exclusion-form-buttons">
                                    {editingId && (
                                        <button
                                            type="button"
                                            className="exclusion-cancel-btn"
                                            onClick={resetForm}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="exclusion-save-btn"
                                        disabled={saving}
                                    >
                                        <FaPlus />

                                        {saving
                                            ? "Saving..."
                                            : editingId
                                              ? "Update"
                                              : "Add"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="exclusion-table-card">
                            <div className="exclusion-card-header">
                                <h2>
                                    All Exclusions
                                </h2>
                            </div>

                            {loading ? (
                                <div className="exclusion-empty">
                                    Loading exclusions...
                                </div>
                            ) : exclusions.length === 0 ? (
                                <div className="exclusion-empty">
                                    No exclusions found.
                                </div>
                            ) : (
                                <>
                                    <div className="exclusion-table-wrapper">
                                        <table className="exclusion-table">
                                            <thead>
                                                <tr>
                                                    <th>S.N.</th>
                                                    <th>Package</th>
                                                    <th>Exclusion</th>
                                                    <th>
                                                        Display Order
                                                    </th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {exclusions.map(
                                                    (
                                                        exclusion,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                exclusion.id
                                                            }
                                                        >
                                                            <td>
                                                                {(page - 1) * 10 + index + 1}
                                                            </td>

                                                            <td>
                                                                <span className="exclusion-package-name">
                                                                    {exclusion
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {
                                                                    exclusion.item
                                                                }
                                                            </td>

                                                            <td>
                                                                <span className="exclusion-order">
                                                                    {exclusion.display_order ??
                                                                        0}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="exclusion-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="exclusion-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                exclusion
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="exclusion-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                exclusion.id
                                                                            )
                                                                        }
                                                                        title="Delete"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
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
                                </>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Exclusion;