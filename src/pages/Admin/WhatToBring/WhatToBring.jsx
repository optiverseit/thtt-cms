import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa";
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

const WhatToBring = () => {
    const [whatToBringItems, setWhatToBringItems] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");
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

            const response = await getAllWhatToBringCms(page);

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
            const response = await getAllPackagesCms();

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

    const resetForm = () => {
        setPackageId("");
        setItem("");
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

            let response;

            if (editingId) {
                response = await updateWhatToBring(
                    editingId,
                    data
                );
            } else {
                response = await createWhatToBring(
                    packageId,
                    data
                );
            }

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: editingId
                        ? "Item Updated"
                        : "Item Added",
                    text:
                        response.data.message ||
                        (editingId
                            ? "What to bring item updated successfully."
                            : "What to bring item added successfully."),
                    confirmButtonColor: "#351255",
                });

                resetForm();
                fetchWhatToBring();
            }
        } catch (error) {
            console.error(
                "Error saving what to bring item:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to save what to bring item.";

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

    const handleEdit = (whatToBring) => {
        setEditingId(whatToBring.id);

        setPackageId(
            whatToBring.package_id?.toString() || ""
        );

        setItem(whatToBring.item || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

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
                    resetForm();
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
                                    Manage items travelers should
                                    bring for each package.
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
                                        : "Add a new item travelers should bring for a package."}
                                </p>
                            </div>

                            <form
                                className="what-to-bring-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="what-to-bring-form-group">
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
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Warm jacket"
                                        maxLength={255}
                                        disabled={saving}
                                    />
                                </div>

                                <div className="what-to-bring-form-buttons">
                                    {editingId && (
                                        <button
                                            type="button"
                                            className="what-to-bring-cancel-btn"
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
                                        className="what-to-bring-save-btn"
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

                        <div className="what-to-bring-table-card">
                            <div className="what-to-bring-card-header">
                                <h2>
                                    All What To Bring Items
                                </h2>
                            </div>

                            {loading ? (
                                <div className="what-to-bring-empty">
                                    Loading what to bring items...
                                </div>
                            ) : whatToBringItems.length ===
                              0 ? (
                                <div className="what-to-bring-empty">
                                    No what to bring items
                                    found.
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
                                                        What To Bring
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