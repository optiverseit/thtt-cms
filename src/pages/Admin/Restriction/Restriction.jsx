import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash, FaTimes } from "react-icons/fa";
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

const createEmptyRestriction = () => ({
    restriction: "",
});

const Restriction = () => {
    const [restrictions, setRestrictions] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");

    // Multiple restrictions for create
    const [restrictionItems, setRestrictionItems] = useState([
        createEmptyRestriction(),
    ]);

    // Single restriction for edit
    const [restriction, setRestriction] = useState("");

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

    // ==================================
    // CREATE
    // ==================================

    const addRestrictionRow = () => {
        setRestrictionItems([
            ...restrictionItems,
            createEmptyRestriction(),
        ]);
    };

    const removeRestrictionRow = (index) => {
        if (restrictionItems.length === 1) {
            return;
        }

        setRestrictionItems(
            restrictionItems.filter((_, i) => i !== index)
        );
    };

    const handleRestrictionChange = (index, value) => {
        const updatedItems = [...restrictionItems];

        updatedItems[index] = {
            ...updatedItems[index],
            restriction: value,
        };

        setRestrictionItems(updatedItems);
    };

    const resetCreateForm = () => {
        setPackageId("");
        setRestrictionItems([
            createEmptyRestriction(),
        ]);
    };

    const handleCreate = async (e) => {
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

        for (let i = 0; i < restrictionItems.length; i++) {
            if (!restrictionItems[i].restriction.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Restriction Required",
                    text: `Please enter restriction ${i + 1}.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const data = {
            restrictions: restrictionItems.map((entry) => ({
                restriction: entry.restriction.trim(),
            })),
        };

        try {
            setSaving(true);

            const response = await createRestriction(
                packageId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Restrictions Added",
                    text:
                        response.data.message ||
                        "Package restrictions created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();
                fetchRestrictions();
            }
        } catch (error) {
            console.error(
                "Error creating restrictions:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create restrictions.";

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

    // ==================================
    // EDIT
    // ==================================

    const handleEdit = (restrictionData) => {
        setEditingId(restrictionData.id);

        setPackageId(
            restrictionData.package_id?.toString() || ""
        );

        setRestriction(
            restrictionData.restriction || ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setPackageId("");
        setRestriction("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!restriction.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Restriction Required",
                text: "Please enter a restriction.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = {
            restriction: restriction.trim(),
        };

        try {
            setSaving(true);

            const response = await updateRestriction(
                editingId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Restriction Updated",
                    text:
                        response.data.message ||
                        "Restriction updated successfully.",
                    confirmButtonColor: "#351255",
                });

                cancelEdit();
                fetchRestrictions();
            }
        } catch (error) {
            console.error(
                "Error updating restriction:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update restriction.";

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

    // ==================================
    // DELETE
    // ==================================

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
            const response = await deleteRestriction(id);

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
                    cancelEdit();
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
                                <h1>
                                    Package Restrictions
                                </h1>

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
                                        : "Add Restrictions"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected restriction."
                                        : "Add multiple restrictions to a package."}
                                </p>
                            </div>

                            {editingId ? (
                                /* ========================
                                   EDIT ONE RESTRICTION
                                ======================== */

                                <form
                                    className="restriction-form"
                                    onSubmit={handleUpdate}
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
                                            disabled
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
                                            value={restriction}
                                            onChange={(e) =>
                                                setRestriction(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. Minimum age 18 years"
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="restriction-form-buttons">
                                        <button
                                            type="button"
                                            className="restriction-cancel-btn"
                                            onClick={cancelEdit}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="restriction-save-btn"
                                            disabled={saving}
                                        >
                                            <FaPen />

                                            {saving
                                                ? "Saving..."
                                                : "Update"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* ========================
                                   CREATE MULTIPLE
                                ======================== */

                                <form onSubmit={handleCreate}>

                                    <div className="restriction-package-section">
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
                                                disabled={saving}
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
                                    </div>

                                    <div className="restriction-items-list">

                                        {restrictionItems.map(
                                            (entry, index) => (
                                                <div
                                                    className="restriction-item-row"
                                                    key={index}
                                                >
                                                    <div className="restriction-number">
                                                        {index + 1}
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
                                                            value={
                                                                entry.restriction
                                                            }
                                                            onChange={(e) =>
                                                                handleRestrictionChange(
                                                                    index,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g. Minimum age 18 years"
                                                            disabled={saving}
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="restriction-remove-btn"
                                                        onClick={() =>
                                                            removeRestrictionRow(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            restrictionItems.length ===
                                                                1 ||
                                                            saving
                                                        }
                                                        title="Remove Restriction"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="restriction-create-actions">

                                        <button
                                            type="button"
                                            className="restriction-add-more-btn"
                                            onClick={
                                                addRestrictionRow
                                            }
                                            disabled={saving}
                                        >
                                            <FaPlus />
                                            Add Restriction
                                        </button>

                                        <button
                                            type="submit"
                                            className="restriction-save-btn"
                                            disabled={saving}
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Restrictions"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* ========================
                            TABLE
                        ======================== */}

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
                                                    <th>
                                                        Restriction
                                                    </th>
                                                    <th>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {restrictions.map(
                                                    (
                                                        restrictionData,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                restrictionData.id
                                                            }
                                                        >
                                                            <td>
                                                                {(page -
                                                                    1) *
                                                                    10 +
                                                                    index +
                                                                    1}
                                                            </td>

                                                            <td>
                                                                <span className="restriction-package-name">
                                                                    {restrictionData
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {
                                                                    restrictionData.restriction
                                                                }
                                                            </td>

                                                            <td>
                                                                <div className="restriction-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="restriction-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                restrictionData
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
                                                                                restrictionData.id
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