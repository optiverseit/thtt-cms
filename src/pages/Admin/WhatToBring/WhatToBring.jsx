import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllWhatToBringCms,
    getAllPackagesCms,
    createWhatToBring,
    updateWhatToBring,
    deleteWhatToBring,
} from "../../../api/BackendApi";

import "./WhatToBring.css";

const createEmptyItem = () => ({
    item: "",
});

const WhatToBring = () => {
    const [whatToBringItems, setWhatToBringItems] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");

    // Multiple items for create
    const [items, setItems] = useState([
        createEmptyItem(),
    ]);

    // Single item for edit
    const [item, setItem] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        fetchWhatToBring();
    }, [page]);

    const fetchWhatToBring = async () => {
        try {
            setLoading(true);

            const response =
                await getAllWhatToBringCms(page);

            if (response.data.status) {
                setWhatToBringItems(
                    response.data.data.data || []
                );

                setTotalPages(
                    response.data.data.last_page || 1
                );
            }
        } catch (error) {
            console.error(
                "Error fetching what to bring items:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load what to bring items.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const response =
                await getAllPackagesCms();

            if (response.data.status) {
                setPackages(
                    response.data.data.data || []
                );
            }
        } catch (error) {
            console.error(
                "Error fetching packages:",
                error
            );
        }
    };

    // ==============================
    // CREATE
    // ==============================

    const addItemRow = () => {
        setItems([
            ...items,
            createEmptyItem(),
        ]);
    };

    const removeItemRow = (index) => {
        if (items.length === 1) {
            return;
        }

        setItems(
            items.filter((_, i) => i !== index)
        );
    };

    const handleItemChange = (
        index,
        value
    ) => {
        const updatedItems = [...items];

        updatedItems[index] = {
            ...updatedItems[index],
            item: value,
        };

        setItems(updatedItems);
    };

    const resetCreateForm = () => {
        setPackageId("");
        setItems([
            createEmptyItem(),
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

        for (let i = 0; i < items.length; i++) {
            if (!items[i].item.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Item Required",
                    text: `Please enter item ${i + 1}.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const data = {
            items: items.map((entry) => ({
                item: entry.item.trim(),
            })),
        };

        try {
            setSaving(true);

            const response =
                await createWhatToBring(
                    packageId,
                    data
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Items Added",
                    text:
                        response.data.message ||
                        "What to bring items created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();
                fetchWhatToBring();
            }
        } catch (error) {
            console.error(
                "Error creating what to bring items:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create what to bring items.";

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )[0];

                if (Array.isArray(firstError)) {
                    errorMessage =
                        firstError[0];
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

    // ==============================
    // EDIT
    // ==============================

    const handleEdit = (whatToBring) => {
        setEditingId(whatToBring.id);

        setPackageId(
            whatToBring.package_id?.toString() ||
                ""
        );

        setItem(whatToBring.item || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setPackageId("");
        setItem("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!item.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Item Required",
                text: "Please enter a what to bring item.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = {
            item: item.trim(),
        };

        try {
            setSaving(true);

            const response =
                await updateWhatToBring(
                    editingId,
                    data
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Item Updated",
                    text:
                        response.data.message ||
                        "What to bring item updated successfully.",
                    confirmButtonColor: "#351255",
                });

                cancelEdit();
                fetchWhatToBring();
            }
        } catch (error) {
            console.error(
                "Error updating what to bring item:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update what to bring item.";

            const validationErrors =
                error.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )[0];

                if (Array.isArray(firstError)) {
                    errorMessage =
                        firstError[0];
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

    // ==============================
    // DELETE
    // ==============================

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Item?",
            text: "This what to bring item will be permanently deleted.",
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
                await deleteWhatToBring(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "What to bring item deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    cancelEdit();
                }

                fetchWhatToBring();
            }
        } catch (error) {
            console.error(
                "Error deleting what to bring item:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete what to bring item.",
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
                    <div className="what-to-bring-page">

                        <div className="what-to-bring-header">
                            <div>
                                <h1>
                                    What To Bring
                                </h1>

                                <p>
                                    Manage items travelers
                                    should bring for each
                                    package.
                                </p>
                            </div>
                        </div>

                        <div className="what-to-bring-form-card">

                            <div className="what-to-bring-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit What To Bring"
                                        : "Add What To Bring"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected item."
                                        : "Add multiple items travelers should bring for a package."}
                                </p>
                            </div>

                            {editingId ? (
                                /* ==================
                                   EDIT ONE ITEM
                                ================== */

                                <form
                                    className="what-to-bring-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >
                                    <div className="what-to-bring-form-group">
                                        <label>
                                            Package
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            value={
                                                packageId
                                            }
                                            disabled
                                        >
                                            <option value="">
                                                Select Package
                                            </option>

                                            {packages.map(
                                                (pkg) => (
                                                    <option
                                                        key={
                                                            pkg.id
                                                        }
                                                        value={
                                                            pkg.id
                                                        }
                                                    >
                                                        {
                                                            pkg.title
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="what-to-bring-form-group what-to-bring-item-field">
                                        <label>
                                            What To Bring
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) =>
                                                setItem(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. Warm jacket"
                                            maxLength={
                                                255
                                            }
                                            disabled={
                                                saving
                                            }
                                        />
                                    </div>

                                    <div className="what-to-bring-form-buttons">
                                        <button
                                            type="button"
                                            className="what-to-bring-cancel-btn"
                                            onClick={
                                                cancelEdit
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="what-to-bring-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPen />

                                            {saving
                                                ? "Saving..."
                                                : "Update"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* ==================
                                   CREATE MULTIPLE
                                ================== */

                                <form
                                    onSubmit={
                                        handleCreate
                                    }
                                >
                                    <div className="what-to-bring-package-section">
                                        <div className="what-to-bring-form-group">
                                            <label>
                                                Package
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                value={
                                                    packageId
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setPackageId(
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                <option value="">
                                                    Select Package
                                                </option>

                                                {packages.map(
                                                    (
                                                        pkg
                                                    ) => (
                                                        <option
                                                            key={
                                                                pkg.id
                                                            }
                                                            value={
                                                                pkg.id
                                                            }
                                                        >
                                                            {
                                                                pkg.title
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="what-to-bring-items-list">
                                        {items.map(
                                            (
                                                entry,
                                                index
                                            ) => (
                                                <div
                                                    className="what-to-bring-item-row"
                                                    key={
                                                        index
                                                    }
                                                >
                                                    <div className="what-to-bring-number">
                                                        {index +
                                                            1}
                                                    </div>

                                                    <div className="what-to-bring-form-group what-to-bring-item-field">
                                                        <label>
                                                            What
                                                            To
                                                            Bring
                                                            <span className="required">
                                                                *
                                                            </span>
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                entry.item
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleItemChange(
                                                                    index,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="e.g. Warm jacket"
                                                            maxLength={
                                                                255
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="what-to-bring-remove-btn"
                                                        onClick={() =>
                                                            removeItemRow(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            items.length ===
                                                                1 ||
                                                            saving
                                                        }
                                                        title="Remove Item"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="what-to-bring-create-actions">
                                        <button
                                            type="button"
                                            className="what-to-bring-add-more-btn"
                                            onClick={
                                                addItemRow
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />
                                            Add Item
                                        </button>

                                        <button
                                            type="submit"
                                            className="what-to-bring-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Items"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* ==================
                            TABLE
                        ================== */}

                        <div className="what-to-bring-table-card">

                            <div className="what-to-bring-card-header">
                                <h2>
                                    All What To Bring
                                    Items
                                </h2>
                            </div>

                            {loading ? (
                                <div className="what-to-bring-empty">
                                    Loading what to
                                    bring items...
                                </div>
                            ) : whatToBringItems.length ===
                              0 ? (
                                <div className="what-to-bring-empty">
                                    No what to bring
                                    items found.
                                </div>
                            ) : (
                                <>
                                    <div className="what-to-bring-table-wrapper">
                                        <table className="what-to-bring-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        S.N.
                                                    </th>

                                                    <th>
                                                        Package
                                                    </th>

                                                    <th>
                                                        What
                                                        To
                                                        Bring
                                                    </th>

                                                    <th>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {whatToBringItems.map(
                                                    (
                                                        whatToBring,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                whatToBring.id
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
                                                                <span className="what-to-bring-package-name">
                                                                    {whatToBring
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {
                                                                    whatToBring.item
                                                                }
                                                            </td>

                                                            <td>
                                                                <div className="what-to-bring-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="what-to-bring-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                whatToBring
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="what-to-bring-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                whatToBring.id
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
                                        totalPages={
                                            totalPages
                                        }
                                        onPageChange={
                                            setPage
                                        }
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

export default WhatToBring;