import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash, FaTimes } from "react-icons/fa";
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

const createEmptyInclusion = (order = 0) => ({
    item: "",
    display_order: order,
});

const Inclusion = () => {
    const [inclusions, setInclusions] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");

    // Multiple inclusions for create
    const [inclusionItems, setInclusionItems] = useState([
        createEmptyInclusion(0),
    ]);

    // Single inclusion for edit
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

    // ================================
    // CREATE
    // ================================

    const addInclusionRow = () => {
        setInclusionItems([
            ...inclusionItems,
            createEmptyInclusion(inclusionItems.length),
        ]);
    };

    const removeInclusionRow = (index) => {
        if (inclusionItems.length === 1) {
            return;
        }

        const updatedItems = inclusionItems
            .filter((_, i) => i !== index)
            .map((inclusion, i) => ({
                ...inclusion,
                display_order: i,
            }));

        setInclusionItems(updatedItems);
    };

    const handleInclusionChange = (index, field, value) => {
        const updatedItems = [...inclusionItems];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        setInclusionItems(updatedItems);
    };

    const resetCreateForm = () => {
        setPackageId("");
        setInclusionItems([
            createEmptyInclusion(0),
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

        for (let i = 0; i < inclusionItems.length; i++) {
            if (!inclusionItems[i].item.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Inclusion Required",
                    text: `Please enter inclusion ${i + 1}.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const data = {
            inclusions: inclusionItems.map(
                (inclusion, index) => ({
                    item: inclusion.item.trim(),
                    display_order:
                        inclusion.display_order === ""
                            ? index
                            : Number(inclusion.display_order),
                })
            ),
        };

        try {
            setSaving(true);

            const response = await createInclusion(
                packageId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Inclusions Added",
                    text:
                        response.data.message ||
                        "Inclusions created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();
                fetchInclusions();
            }
        } catch (error) {
            console.error(
                "Error creating inclusions:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create inclusions.";

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

    // ================================
    // EDIT
    // ================================

    const handleEdit = (inclusion) => {
        setEditingId(inclusion.id);

        setPackageId(
            inclusion.package_id?.toString() || ""
        );

        setItem(inclusion.item || "");

        setDisplayOrder(
            inclusion.display_order?.toString() || "0"
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
                title: "Inclusion Required",
                text: "Please enter an inclusion.",
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

            const response = await updateInclusion(
                editingId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Inclusion Updated",
                    text:
                        response.data.message ||
                        "Inclusion updated successfully.",
                    confirmButtonColor: "#351255",
                });

                cancelEdit();
                fetchInclusions();
            }
        } catch (error) {
            console.error(
                "Error updating inclusion:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update inclusion.";

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

    // ================================
    // DELETE
    // ================================

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
                    cancelEdit();
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
                                <h1>Package Inclusions</h1>

                                <p>
                                    Manage items and services
                                    included in packages.
                                </p>
                            </div>
                        </div>

                        {/* ============================
                            CREATE / EDIT FORM
                        ============================ */}

                        <div className="inclusion-form-card">

                            <div className="inclusion-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Inclusion"
                                        : "Add Inclusions"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected inclusion."
                                        : "Add multiple inclusions to a package."}
                                </p>
                            </div>

                            {editingId ? (
                                /* ========================
                                   EDIT SINGLE INCLUSION
                                ======================== */

                                <form
                                    className="inclusion-form"
                                    onSubmit={handleUpdate}
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

                                    <div className="inclusion-form-buttons">
                                        <button
                                            type="button"
                                            className="inclusion-cancel-btn"
                                            onClick={cancelEdit}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="inclusion-save-btn"
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

                                    <div className="inclusion-package-section">
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

                                    <div className="inclusion-items-list">
                                        {inclusionItems.map(
                                            (inclusion, index) => (
                                                <div
                                                    className="inclusion-item-row"
                                                    key={index}
                                                >
                                                    <div className="inclusion-number">
                                                        {index + 1}
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
                                                            value={
                                                                inclusion.item
                                                            }
                                                            onChange={(e) =>
                                                                handleInclusionChange(
                                                                    index,
                                                                    "item",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="e.g. Airport pickup and drop"
                                                            disabled={
                                                                saving
                                                            }
                                                        />
                                                    </div>

                                                    <div className="inclusion-form-group inclusion-order-field">
                                                        <label>
                                                            Display Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                inclusion.display_order
                                                            }
                                                            onChange={(e) =>
                                                                handleInclusionChange(
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
                                                        className="inclusion-remove-btn"
                                                        onClick={() =>
                                                            removeInclusionRow(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            inclusionItems.length ===
                                                                1 ||
                                                            saving
                                                        }
                                                        title="Remove Inclusion"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="inclusion-create-actions">

                                        <button
                                            type="button"
                                            className="inclusion-add-more-btn"
                                            onClick={
                                                addInclusionRow
                                            }
                                            disabled={saving}
                                        >
                                            <FaPlus />
                                            Add Inclusion
                                        </button>

                                        <button
                                            type="submit"
                                            className="inclusion-save-btn"
                                            disabled={saving}
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Inclusions"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* ============================
                            TABLE
                        ============================ */}

                        <div className="inclusion-table-card">

                            <div className="inclusion-card-header">
                                <h2>All Inclusions</h2>
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
                                                    <th>S.N.</th>
                                                    <th>Package</th>
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
                                                                {(page -
                                                                    1) *
                                                                    10 +
                                                                    index +
                                                                    1}
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