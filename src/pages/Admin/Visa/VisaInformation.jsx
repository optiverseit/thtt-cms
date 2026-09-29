import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getVisaInformationCms,
    getVisaInformationById,
    createVisaInformation,
    updateVisaInformation,
    changeVisaInformationStatus,
    deleteVisaInformation,
    getVisaCategories,
} from "../../../api/BackendApi";

import "./VisaInformation.css";

const emptyInformation = () => ({
    content: "",
    display_order: 0,
    status: "ACTIVE",
});

const VisaInformation = () => {
    const [information, setInformation] = useState([]);
    const [visaCategories, setVisaCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // IMPORTANT:
    // Used while GET-by-id is loading for edit.
    const [editLoading, setEditLoading] = useState(false);

    const [visaCategoryId, setVisaCategoryId] = useState("");
    const [informationType, setInformationType] = useState("INCLUDED");

    const [informationRows, setInformationRows] = useState([
        emptyInformation(),
    ]);

    // Used to show "Updating..." only on the clicked status button.
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    // Used so Add Another can scroll the modal downward.
    const modalRef = useRef(null);

    /* =====================================================
       FETCH VISA INFORMATION
    ===================================================== */

    const fetchInformation = async (page = 1) => {
        try {
            setLoading(true);

            const response = await getVisaInformationCms(page);
            const result = response.data?.data;

            setInformation(result?.data || []);
            setCurrentPage(result?.current_page || 1);
            setLastPage(result?.last_page || 1);
        } catch (error) {
            console.error(
                "Failed to fetch visa information:",
                error
            );

            setInformation([]);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Failed to load visa information.",
            });
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       FETCH VISA CATEGORIES
    ===================================================== */

    const fetchVisaCategories = async () => {
        try {
            const response = await getVisaCategories();

            const result = response.data?.data;

            if (Array.isArray(result)) {
                setVisaCategories(result);
            } else if (Array.isArray(result?.data)) {
                setVisaCategories(result.data);
            } else {
                setVisaCategories([]);
            }
        } catch (error) {
            console.error(
                "Failed to fetch visa categories:",
                error
            );

            setVisaCategories([]);
        }
    };

    useEffect(() => {
        fetchInformation(1);
        fetchVisaCategories();
    }, []);

    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {
        setVisaCategoryId("");
        setInformationType("INCLUDED");

        setInformationRows([
            emptyInformation(),
        ]);

        setIsEditing(false);
        setEditingId(null);
        setEditLoading(false);
    };

    /* =====================================================
       OPEN CREATE MODAL
    ===================================================== */

    const handleOpenCreate = () => {
        resetForm();
        setShowModal(true);
    };

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        resetForm();
    };

    /* =====================================================
       ADD INFORMATION ROW
    ===================================================== */

    const handleAddInformationRow = () => {
        setInformationRows((previous) => [
            ...previous,
            emptyInformation(),
        ]);

        // Wait until the new row has rendered,
        // then scroll the modal down.
        setTimeout(() => {
            if (modalRef.current) {
                modalRef.current.scrollTo({
                    top: modalRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }
        }, 100);
    };

    /* =====================================================
       REMOVE INFORMATION ROW
    ===================================================== */

    const handleRemoveInformationRow = (index) => {
        if (informationRows.length === 1) {
            return;
        }

        setInformationRows((previous) =>
            previous.filter(
                (_, rowIndex) => rowIndex !== index
            )
        );
    };

    /* =====================================================
       INFORMATION ROW CHANGE
    ===================================================== */

    const handleInformationChange = (
        index,
        field,
        value
    ) => {
        setInformationRows((previous) =>
            previous.map((informationItem, rowIndex) =>
                rowIndex === index
                    ? {
                          ...informationItem,
                          [field]: value,
                      }
                    : informationItem
            )
        );
    };

    /* =====================================================
       OPEN EDIT

       FLOW:
       1. Open modal immediately
       2. Show loading
       3. Call API
       4. Fill states
       5. Remove loading
       6. Form appears
    ===================================================== */

    const handleEdit = async (id) => {
        // Clear old form values first.
        setVisaCategoryId("");
        setInformationType("INCLUDED");
        setInformationRows([
            emptyInformation(),
        ]);

        setEditingId(id);
        setIsEditing(true);

        // IMPORTANT:
        // Modal opens BEFORE API request.
        setShowModal(true);

        // IMPORTANT:
        // Loader is displayed instead of form.
        setEditLoading(true);

        try {
            const response =
                await getVisaInformationById(id);

            const item = response.data?.data;

            if (!item) {
                setShowModal(false);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Visa information not found.",
                });

                return;
            }

            setEditingId(item.id);

            setVisaCategoryId(
                String(item.visa_category_id || "")
            );

            setInformationType(
                item.type || "INCLUDED"
            );

            setInformationRows([
                {
                    content: item.content || "",
                    display_order:
                        item.display_order ?? 0,
                    status:
                        item.status || "ACTIVE",
                },
            ]);
        } catch (error) {
            console.error(
                "Failed to fetch visa information:",
                error
            );

            setShowModal(false);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Failed to load visa information.",
            });
        } finally {
            // ONLY NOW will the form become visible.
            setEditLoading(false);
        }
    };

    /* =====================================================
       VALIDATE FORM
    ===================================================== */

    const validateForm = () => {
        if (!visaCategoryId) {
            Swal.fire({
                icon: "warning",
                title: "Visa Category Required",
                text: "Please select a visa category.",
            });

            return false;
        }

        if (!informationType) {
            Swal.fire({
                icon: "warning",
                title: "Information Type Required",
                text: "Please select an information type.",
            });

            return false;
        }

        for (
            let i = 0;
            i < informationRows.length;
            i++
        ) {
            const item = informationRows[i];

            if (!item.content.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Content Required",
                    text: `Content is required for item ${
                        i + 1
                    }.`,
                });

                return false;
            }
        }

        return true;
    };

    /* =====================================================
       SAVE CREATE / UPDATE
    ===================================================== */

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        // Save this BEFORE resetForm().
        const wasEditing = isEditing;

        try {
            setSaving(true);

            if (wasEditing) {
                const item = informationRows[0];

                const payload = {
                    visa_category_id:
                        Number(visaCategoryId),

                    type: informationType,

                    content:
                        item.content.trim(),

                    display_order:
                        Number(
                            item.display_order
                        ) || 0,

                    status:
                        item.status || "ACTIVE",
                };

                await updateVisaInformation(
                    editingId,
                    payload
                );
            } else {
                const payload = {
                    visa_category_id:
                        Number(visaCategoryId),

                    type: informationType,

                    items: informationRows.map(
                        (item) => ({
                            content:
                                item.content.trim(),

                            display_order:
                                Number(
                                    item.display_order
                                ) || 0,

                            status:
                                item.status ||
                                "ACTIVE",
                        })
                    ),
                };

                await createVisaInformation(
                    payload
                );
            }

            setShowModal(false);
            // Refresh first.
            await fetchInformation(currentPage);

            // Close and reset.
            
            resetForm();

            // Correct message even after resetForm().
            Swal.fire({
                icon: "success",
                title: wasEditing
                    ? "Information Updated"
                    : "Information Created",

                text: wasEditing
                    ? "Visa information updated successfully."
                    : "Visa information created successfully.",

                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error(
                "Failed to save visa information:",
                error
            );

            const validationErrors =
                error?.response?.data?.errors;

            if (validationErrors) {
                const firstError =
                    Object.values(
                        validationErrors
                    )?.[0]?.[0];

                Swal.fire({
                    icon: "error",
                    title: "Validation Failed",
                    text:
                        firstError ||
                        "Validation failed.",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Save Failed",
                    text:
                        error?.response?.data
                            ?.message ||
                        "Failed to save visa information.",
                });
            }
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       CHANGE STATUS WITH SWAL CONFIRMATION

       FLOW:
       Click status
       -> confirmation Swal
       -> confirm
       -> button says Updating...
       -> API
       -> refresh
       -> success Swal
    ===================================================== */

    const handleStatusChange = async (
        id,
        currentStatus
    ) => {
        // Prevent another click while updating.
        if (updatingStatusId !== null) {
            return;
        }

        const newStatus =
            currentStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result = await Swal.fire({
            icon: "question",

            title: "Change Status?",

            text:
                newStatus === "ACTIVE"
                    ? "Are you sure you want to activate this visa information?"
                    : "Are you sure you want to deactivate this visa information?",

            showCancelButton: true,

            confirmButtonText:
                newStatus === "ACTIVE"
                    ? "Yes, Activate"
                    : "Yes, Deactivate",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#32134e",
            cancelButtonColor: "#6c757d",

            reverseButtons: true,
        });

        // User pressed cancel.
        if (!result.isConfirmed) {
            return;
        }

        try {
            // NOW show Updating...
            setUpdatingStatusId(id);

            const response =
                await changeVisaInformationStatus(
                    id,
                    {
                        status: newStatus,
                    }
                );

            await fetchInformation(currentPage);

            Swal.fire({
                icon: "success",
                title: "Status Updated",

                text:
                    response?.data?.message ||
                    `Information status changed to ${newStatus}.`,

                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error(
                "Failed to change information status:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error?.response?.data?.message ||
                    "Failed to change information status.",
            });
        } finally {
            setUpdatingStatusId(null);
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",

            title: "Delete Visa Information?",

            text: "Are you sure you want to delete this visa information?",

            showCancelButton: true,

            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",

            confirmButtonColor: "#d32f2f",
            cancelButtonColor: "#6c757d",

            reverseButtons: true,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await deleteVisaInformation(id);

            if (
                information.length === 1 &&
                currentPage > 1
            ) {
                await fetchInformation(
                    currentPage - 1
                );
            } else {
                await fetchInformation(
                    currentPage
                );
            }

            Swal.fire({
                icon: "success",
                title: "Deleted",
                text: "Visa information deleted successfully.",
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error(
                "Failed to delete visa information:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error?.response?.data?.message ||
                    "Failed to delete visa information.",
            });
        }
    };

    /* =====================================================
       PAGE CHANGE
    ===================================================== */

    const handlePageChange = (page) => {
        if (
            page < 1 ||
            page > lastPage ||
            page === currentPage
        ) {
            return;
        }

        fetchInformation(page);
    };

    /* =====================================================
       TYPE LABEL
    ===================================================== */

    const getTypeLabel = (type) => {
        if (type === "INCLUDED") {
            return "Included";
        }

        if (type === "POLICY") {
            return "Policy";
        }

        if (type === "TERMS_CONDITION") {
            return "Terms & Conditions";
        }

        return type;
    };

    const getTypeClass = (type) => {
        if (type === "INCLUDED") {
            return "included";
        }

        if (type === "POLICY") {
            return "policy";
        }

        if (type === "TERMS_CONDITION") {
            return "terms";
        }

        return "";
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    {/* HEADER */}

                    <div className="visa-information-header">
                        <div>
                            <h1>
                                Visa Information
                            </h1>

                            <p>
                                Manage inclusions,
                                policies and terms &
                                conditions for visa
                                categories.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="visa-information-add-btn"
                            onClick={
                                handleOpenCreate
                            }
                        >
                            + Add Visa Information
                        </button>
                    </div>

                    {/* TABLE */}

                    <div className="visa-information-table-card">
                        <div className="visa-information-table-wrapper">
                            <table className="visa-information-table">
                                <thead>
                                    <tr>
                                        <th>#</th>

                                        <th>
                                            Visa Category
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Content
                                        </th>

                                        <th>
                                            Order
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="visa-information-empty"
                                            >
                                                Loading
                                                visa
                                                information...
                                            </td>
                                        </tr>
                                    ) : information.length ===
                                      0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="visa-information-empty"
                                            >
                                                No visa
                                                information
                                                found.
                                            </td>
                                        </tr>
                                    ) : (
                                        information.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <td>
                                                        {(currentPage -
                                                            1) *
                                                            10 +
                                                            index +
                                                            1}
                                                    </td>

                                                    <td>
                                                        {item
                                                            ?.visa_category
                                                            ?.name ||
                                                            item
                                                                ?.visaCategory
                                                                ?.name ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`visa-information-type ${getTypeClass(
                                                                item.type
                                                            )}`}
                                                        >
                                                            {getTypeLabel(
                                                                item.type
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="visa-information-content">
                                                            {item.content ||
                                                                "-"}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {item.display_order ??
                                                            0}
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={`visa-information-status-btn ${
                                                                item.status ===
                                                                "ACTIVE"
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    item.id,
                                                                    item.status
                                                                )
                                                            }
                                                            disabled={
                                                                updatingStatusId !==
                                                                null
                                                            }
                                                        >
                                                            {updatingStatusId ===
                                                            item.id
                                                                ? "Updating..."
                                                                : item.status}
                                                        </button>
                                                    </td>

                                                    <td>
                                                        <div className="visa-information-actions">
                                                            <button
                                                                type="button"
                                                                className="visa-information-edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        item.id
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="visa-information-delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id
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

                        {!loading &&
                            lastPage > 1 && (
                                <div className="visa-information-pagination">
                                    <Pagination
                                        currentPage={
                                            currentPage
                                        }
                                        totalPages={
                                            lastPage
                                        }
                                        onPageChange={
                                            handlePageChange
                                        }
                                    />
                                </div>
                            )}
                    </div>
                </main>
            </div>

            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            {showModal && (
                <div
                    className="visa-information-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            handleCloseModal();
                        }
                    }}
                >
                    <div
                        ref={modalRef}
                        className={`visa-information-modal ${
                            !isEditing
                                ? "visa-information-modal-large"
                                : ""
                        }`}
                    >
                        {/* MODAL HEADER */}

                        <div className="visa-information-modal-header">
                            <div>
                                <h2>
                                    {isEditing
                                        ? "Edit Visa Information"
                                        : "Add Visa Information"}
                                </h2>

                                <p>
                                    {isEditing
                                        ? "Update this visa information."
                                        : "Add one or more information items to a visa category."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="visa-information-modal-close"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>

                        {/* =====================================
                            EDIT LOADING

                            THIS IS THE PART YOUR OLD JSX
                            WAS MISSING.
                        ===================================== */}

                        {isEditing &&
                        editLoading ? (
                            <div className="visa-information-edit-loading">
                                <div className="visa-information-loader"></div>

                                <p>
                                    Loading visa
                                    information...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* MODAL BODY */}

                                <div className="visa-information-modal-body">
                                    {/* CATEGORY */}

                                    <div className="visa-information-form-group">
                                        <label>
                                            Visa
                                            Category *
                                        </label>

                                        <select
                                            value={
                                                visaCategoryId
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setVisaCategoryId(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <option value="">
                                                Select
                                                Visa
                                                Category
                                            </option>

                                            {visaCategories.map(
                                                (
                                                    category
                                                ) => (
                                                    <option
                                                        key={
                                                            category.id
                                                        }
                                                        value={
                                                            category.id
                                                        }
                                                    >
                                                        {category
                                                            ?.country
                                                            ?.country_name
                                                            ? `${category.country.country_name} - `
                                                            : ""}

                                                        {
                                                            category.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    {/* INFORMATION TYPE */}

                                    <div className="visa-information-form-group">
                                        <label>
                                            Information
                                            Type *
                                        </label>

                                        <select
                                            value={
                                                informationType
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setInformationType(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <option value="INCLUDED">
                                                Included
                                            </option>

                                            <option value="POLICY">
                                                Policy
                                            </option>

                                            <option value="TERMS_CONDITION">
                                                Terms
                                                &
                                                Conditions
                                            </option>
                                        </select>
                                    </div>

                                    {/* CREATE SECTION HEADER */}

                                    {!isEditing && (
                                        <div className="information-section-header">
                                            <div>
                                                <h3>
                                                    Information
                                                    Items
                                                </h3>

                                                <p>
                                                    Add
                                                    multiple
                                                    items
                                                    under
                                                    the
                                                    selected
                                                    information
                                                    type.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="add-information-row-btn"
                                                onClick={
                                                    handleAddInformationRow
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                +
                                                Add
                                                Another
                                            </button>
                                        </div>
                                    )}

                                    {/* INFORMATION ROWS */}

                                    {informationRows.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                className="information-form-card"
                                                key={
                                                    index
                                                }
                                            >
                                                {!isEditing && (
                                                    <div className="information-form-card-header">
                                                        <strong>
                                                            Item{" "}
                                                            {index +
                                                                1}
                                                        </strong>

                                                        {informationRows.length >
                                                            1 && (
                                                            <button
                                                                type="button"
                                                                className="remove-information-btn"
                                                                onClick={() =>
                                                                    handleRemoveInformationRow(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving
                                                                }
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* CONTENT */}

                                                <div className="visa-information-form-group">
                                                    <label>
                                                        Content
                                                        *
                                                    </label>

                                                    <textarea
                                                        rows="4"
                                                        placeholder="Enter visa information..."
                                                        value={
                                                            item.content
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleInformationChange(
                                                                index,
                                                                "content",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    />
                                                </div>

                                                <div className="visa-information-form-grid">
                                                    {/* DISPLAY ORDER */}

                                                    <div className="visa-information-form-group">
                                                        <label>
                                                            Display
                                                            Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                item.display_order
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleInformationChange(
                                                                    index,
                                                                    "display_order",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />
                                                    </div>

                                                    {/* STATUS */}

                                                    <div className="visa-information-form-group">
                                                        <label>
                                                            Status
                                                        </label>

                                                        <select
                                                            value={
                                                                item.status
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleInformationChange(
                                                                    index,
                                                                    "status",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        >
                                                            <option value="ACTIVE">
                                                                ACTIVE
                                                            </option>

                                                            <option value="INACTIVE">
                                                                INACTIVE
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* MODAL FOOTER */}

                                <div className="visa-information-modal-footer">
                                    <button
                                        type="button"
                                        className="visa-information-cancel-btn"
                                        onClick={
                                            handleCloseModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="visa-information-save-btn"
                                        onClick={
                                            handleSave
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving
                                            ? isEditing
                                                ? "Updating..."
                                                : "Saving..."
                                            : isEditing
                                              ? "Update Information"
                                              : "Save Information"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisaInformation;