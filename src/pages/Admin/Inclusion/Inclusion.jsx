import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllInclusionsCms,
    getAllPackagesCms,
    createInclusion,
    updateInclusion,
    deleteInclusion,
} from "../../../api/BackendApi";

import "./Inclusion.css";

const Inclusion = () => {
    const [inclusions, setInclusions] = useState([]);
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
        fetchInclusions();
    }, [page]);

    const fetchInclusions = async () => {
        try {
            setLoading(true);

            const response = await getAllInclusionsCms(page);

            if (response.data.status) {
                setInclusions(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Error fetching inclusions:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load inclusions.",
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
                title: "Inclusion Required",
                text: "Please enter an inclusion.",
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
                response = await updateInclusion(
                    editingId,
                    data
                );
            } else {
                response = await createInclusion(
                    packageId,
                    data
                );
            }

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: editingId
                        ? "Inclusion Updated"
                        : "Inclusion Added",
                    text:
                        response.data.message ||
                        (editingId
                            ? "Inclusion updated successfully."
                            : "Inclusion added successfully."),
                    confirmButtonColor: "#351255",
                });

                resetForm();
                fetchInclusions();
            }
        } catch (error) {
            console.error(
                "Error saving inclusion:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to save inclusion.";

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

    const handleEdit = (inclusion) => {
        setEditingId(inclusion.id);

        setPackageId(
            inclusion.package_id?.toString() || ""
        );

        setItem(inclusion.item || "");

        setDisplayOrder(
            inclusion.display_order?.toString() || ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Inclusion?",
            text: "This inclusion will be permanently deleted.",
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
                await deleteInclusion(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Inclusion deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    resetForm();
                }

                fetchInclusions();
            }
        } catch (error) {
            console.error(
                "Error deleting inclusion:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete inclusion.",
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
                    <div className="inclusion-page">

                        <div className="inclusion-header">
                            <div>
                                <h1>
                                    Package Inclusions
                                </h1>

                                <p>
                                    Manage items and services
                                    included in packages.
                                </p>
                            </div>
                        </div>

                        <div className="inclusion-form-card">
                            <div className="inclusion-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Inclusion"
                                        : "Add Inclusion"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected inclusion."
                                        : "Add a new inclusion to a package."}
                                </p>
                            </div>

                            <form
                                className="inclusion-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="inclusion-form-group">
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

                                <div className="inclusion-form-group inclusion-item-field">
                                    <label>
                                        Inclusion
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
                                        placeholder="e.g. Airport pickup and drop"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="inclusion-form-group inclusion-order-field">
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

                                <div className="inclusion-form-buttons">
                                    {editingId && (
                                        <button
                                            type="button"
                                            className="inclusion-cancel-btn"
                                            onClick={
                                                resetForm
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="inclusion-save-btn"
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

                        <div className="inclusion-table-card">
                            <div className="inclusion-card-header">
                                <h2>
                                    All Inclusions
                                </h2>
                            </div>

                            {loading ? (
                                <div className="inclusion-empty">
                                    Loading inclusions...
                                </div>
                            ) : inclusions.length === 0 ? (
                                <div className="inclusion-empty">
                                    No inclusions found.
                                </div>
                            ) : (
                                <>
                                    <div className="inclusion-table-wrapper">
                                        <table className="inclusion-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        S.N.
                                                    </th>

                                                    <th>
                                                        Package
                                                    </th>

                                                    <th>
                                                        Inclusion
                                                    </th>

                                                    <th>
                                                        Display Order
                                                    </th>

                                                    <th>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {inclusions.map(
                                                    (
                                                        inclusion,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                inclusion.id
                                                            }
                                                        >
                                                            <td>
                                                                {(page - 1) * 10 + index + 1}
                                                            </td>

                                                            <td>
                                                                <span className="inclusion-package-name">
                                                                    {inclusion
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {
                                                                    inclusion.item
                                                                }
                                                            </td>

                                                            <td>
                                                                <span className="inclusion-order">
                                                                    {inclusion.display_order ??
                                                                        0}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="inclusion-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="inclusion-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                inclusion
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="inclusion-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                inclusion.id
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

export default Inclusion;