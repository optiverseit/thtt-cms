import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllRestrictionsCms,
    getAllPackagesCms,
    createRestriction,
    updateRestriction,
    deleteRestriction,
} from "../../../api/BackendApi";

import "./Restriction.css";

const Restriction = () => {
    const [restrictions, setRestrictions] = useState([]);
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
        fetchRestrictions();
    }, [page]);

    const fetchRestrictions = async () => {
        try {
            setLoading(true);

            const response = await getAllRestrictionsCms(page);

            if (response.data.status) {
                setRestrictions(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Error fetching restrictions:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load restrictions.",
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
                title: "Restriction Required",
                text: "Please enter a restriction.",
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
                response = await updateRestriction(
                    editingId,
                    data
                );
            } else {
                response = await createRestriction(
                    packageId,
                    data
                );
            }

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: editingId
                        ? "Restriction Updated"
                        : "Restriction Added",
                    text:
                        response.data.message ||
                        (editingId
                            ? "Restriction updated successfully."
                            : "Restriction added successfully."),
                    confirmButtonColor: "#351255",
                });

                resetForm();
                fetchRestrictions();
            }
        } catch (error) {
            console.error(
                "Error saving restriction:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to save restriction.";

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

    const handleEdit = (restriction) => {
        setEditingId(restriction.id);

        setPackageId(
            restriction.package_id?.toString() || ""
        );

        setItem(restriction.item || "");

        setDisplayOrder(
            restriction.display_order?.toString() || ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Restriction?",
            text: "This restriction will be permanently deleted.",
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
                await deleteRestriction(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Restriction deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    resetForm();
                }

                fetchRestrictions();
            }
        } catch (error) {
            console.error(
                "Error deleting restriction:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete restriction.",
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
                    <div className="restriction-page">

                        <div className="restriction-header">
                            <div>
                                <h1>Package Restrictions</h1>

                                <p>
                                    Manage restrictions and requirements
                                    for packages.
                                </p>
                            </div>
                        </div>

                        <div className="restriction-form-card">
                            <div className="restriction-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Restriction"
                                        : "Add Restriction"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected restriction."
                                        : "Add a new restriction to a package."}
                                </p>
                            </div>

                            <form
                                className="restriction-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="restriction-form-group">
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

                                        {packages.map((pkg) => (
                                            <option
                                                key={pkg.id}
                                                value={pkg.id}
                                            >
                                                {pkg.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="restriction-form-group restriction-item-field">
                                    <label>
                                        Restriction
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
                                        placeholder="e.g. Minimum age 18 years"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="restriction-form-group restriction-order-field">
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

                                <div className="restriction-form-buttons">
                                    {editingId && (
                                        <button
                                            type="button"
                                            className="restriction-cancel-btn"
                                            onClick={resetForm}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="restriction-save-btn"
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

                        <div className="restriction-table-card">
                            <div className="restriction-card-header">
                                <h2>
                                    All Restrictions
                                </h2>
                            </div>

                            {loading ? (
                                <div className="restriction-empty">
                                    Loading restrictions...
                                </div>
                            ) : restrictions.length === 0 ? (
                                <div className="restriction-empty">
                                    No restrictions found.
                                </div>
                            ) : (
                                <>
                                    <div className="restriction-table-wrapper">
                                        <table className="restriction-table">
                                            <thead>
                                                <tr>
                                                    <th>S.N.</th>
                                                    <th>Package</th>
                                                    <th>Restriction</th>
                                                    <th>Display Order</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {restrictions.map(
                                                    (
                                                        restriction,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                restriction.id
                                                            }
                                                        >
                                                            <td>
                                                                {(page - 1) * 10 + index + 1}
                                                            </td>

                                                            <td>
                                                                <span className="restriction-package-name">
                                                                    {restriction
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {
                                                                    restriction.item
                                                                }
                                                            </td>

                                                            <td>
                                                                <span className="restriction-order">
                                                                    {restriction.display_order ??
                                                                        0}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="restriction-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="restriction-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                restriction
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="restriction-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                restriction.id
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

export default Restriction;