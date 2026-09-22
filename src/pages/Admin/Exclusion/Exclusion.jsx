import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash, FaTimes } from "react-icons/fa";
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

const createEmptyExclusion = (order = 0) => ({
    item: "",
    display_order: order,
});

const Exclusion = () => {
    const [exclusions, setExclusions] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");

    // Multiple rows while creating
    const [exclusionItems, setExclusionItems] = useState([
        createEmptyExclusion(0),
    ]);

    // Single row while editing
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

    // ==========================
    // CREATE
    // ==========================

    const addExclusionRow = () => {
        setExclusionItems([
            ...exclusionItems,
            createEmptyExclusion(exclusionItems.length),
        ]);
    };

    const removeExclusionRow = (index) => {
        if (exclusionItems.length === 1) {
            return;
        }

        const updatedItems = exclusionItems
            .filter((_, i) => i !== index)
            .map((exclusion, i) => ({
                ...exclusion,
                display_order: i,
            }));

        setExclusionItems(updatedItems);
    };

    const handleExclusionChange = (index, field, value) => {
        const updatedItems = [...exclusionItems];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        setExclusionItems(updatedItems);
    };

    const resetCreateForm = () => {
        setPackageId("");
        setExclusionItems([
            createEmptyExclusion(0),
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

        for (let i = 0; i < exclusionItems.length; i++) {
            if (!exclusionItems[i].item.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Exclusion Required",
                    text: `Please enter exclusion ${i + 1}.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const data = {
            exclusions: exclusionItems.map(
                (exclusion, index) => ({
                    item: exclusion.item.trim(),
                    display_order:
                        exclusion.display_order === ""
                            ? index
                            : Number(exclusion.display_order),
                })
            ),
        };

        try {
            setSaving(true);

            const response = await createExclusion(
                packageId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Exclusions Added",
                    text:
                        response.data.message ||
                        "Exclusions created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();
                fetchExclusions();
            }
        } catch (error) {
            console.error("Error creating exclusions:", error);

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create exclusions.";

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

    // ==========================
    // EDIT
    // ==========================

    const handleEdit = (exclusion) => {
        setEditingId(exclusion.id);

        setPackageId(
            exclusion.package_id?.toString() || ""
        );

        setItem(exclusion.item || "");

        setDisplayOrder(
            exclusion.display_order?.toString() || "0"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setPackageId("");
        setItem("");
        setDisplayOrder("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

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
            display_order:
                displayOrder === ""
                    ? 0
                    : Number(displayOrder),
        };

        try {
            setSaving(true);

            const response = await updateExclusion(
                editingId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Exclusion Updated",
                    text:
                        response.data.message ||
                        "Exclusion updated successfully.",
                    confirmButtonColor: "#351255",
                });

                cancelEdit();
                fetchExclusions();
            }
        } catch (error) {
            console.error("Error updating exclusion:", error);

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update exclusion.";

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

    // ==========================
    // DELETE
    // ==========================

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
            const response = await deleteExclusion(id);

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
                    cancelEdit();
                }

                fetchExclusions();
            }
        } catch (error) {
            console.error("Error deleting exclusion:", error);

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
                                <h1>Package Exclusions</h1>

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
                                        : "Add Exclusions"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected exclusion."
                                        : "Add multiple exclusions to a package."}
                                </p>
                            </div>

                            {editingId ? (
                                /* EDIT ONE */

                                <form
                                    className="exclusion-form"
                                    onSubmit={handleUpdate}
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
                                            <span className="required">
                                                *
                                            </span>
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
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="exclusion-form-buttons">
                                        <button
                                            type="button"
                                            className="exclusion-cancel-btn"
                                            onClick={cancelEdit}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="exclusion-save-btn"
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
                                /* CREATE MULTIPLE */

                                <form onSubmit={handleCreate}>

                                    <div className="exclusion-package-section">
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

                                    <div className="exclusion-items-list">
                                        {exclusionItems.map(
                                            (exclusion, index) => (
                                                <div
                                                    className="exclusion-item-row"
                                                    key={index}
                                                >
                                                    <div className="exclusion-number">
                                                        {index + 1}
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
                                                            value={
                                                                exclusion.item
                                                            }
                                                            onChange={(e) =>
                                                                handleExclusionChange(
                                                                    index,
                                                                    "item",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g. International airfare"
                                                            disabled={
                                                                saving
                                                            }
                                                        />
                                                    </div>

                                                    <div className="exclusion-form-group exclusion-order-field">
                                                        <label>
                                                            Display Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                exclusion.display_order
                                                            }
                                                            onChange={(e) =>
                                                                handleExclusionChange(
                                                                    index,
                                                                    "display_order",
                                                                    e.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="exclusion-remove-btn"
                                                        onClick={() =>
                                                            removeExclusionRow(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            exclusionItems.length ===
                                                                1 ||
                                                            saving
                                                        }
                                                        title="Remove Exclusion"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="exclusion-create-actions">
                                        <button
                                            type="button"
                                            className="exclusion-add-more-btn"
                                            onClick={addExclusionRow}
                                            disabled={saving}
                                        >
                                            <FaPlus />
                                            Add Exclusion
                                        </button>

                                        <button
                                            type="submit"
                                            className="exclusion-save-btn"
                                            disabled={saving}
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Exclusions"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* TABLE */}

                        <div className="exclusion-table-card">

                            <div className="exclusion-card-header">
                                <h2>All Exclusions</h2>
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
                                                                {(page -
                                                                    1) *
                                                                    10 +
                                                                    index +
                                                                    1}
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