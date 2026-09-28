import React, { useEffect, useState } from "react";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getVisaDocumentRequirementsCms,
    getVisaDocumentRequirementById,
    createVisaDocumentRequirements,
    updateVisaDocumentRequirement,
    changeVisaDocumentRequirementStatus,
    deleteVisaDocumentRequirement,
    getVisaCategories,
} from "../../../api/BackendApi";

import "./VisaDocumentRequirement.css";
import Swal from "sweetalert2";


const emptyDocument = () => ({
    document_type: "",
    title: "",
    description: "",
    is_required: true,
    display_order: 0,
    status: "ACTIVE",
});


const VisaDocument = () => {

    const [documents, setDocuments] = useState([]);
    const [visaCategories, setVisaCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [visaCategoryId, setVisaCategoryId] = useState("");

    const [documentRows, setDocumentRows] = useState([
        emptyDocument(),
    ]);

    const [updatingStatusId, setUpdatingStatusId] =
        useState(null);

    const [editLoading, setEditLoading] = useState(false);


    /* =====================================================
       FETCH DOCUMENT REQUIREMENTS
    ===================================================== */

    const fetchDocuments = async (page = 1) => {
        try {
            setLoading(true);

            const response =
                await getVisaDocumentRequirementsCms(page);

            const result = response.data?.data;

            setDocuments(result?.data || []);
            setCurrentPage(result?.current_page || 1);
            setLastPage(result?.last_page || 1);

        } catch (error) {
            console.error(
                "Failed to fetch visa document requirements:",
                error
            );

            setDocuments([]);

        } finally {
            setLoading(false);
        }
    };


    /* =====================================================
       FETCH ACTIVE VISA CATEGORIES
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
        fetchDocuments(1);
        fetchVisaCategories();
    }, []);


    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {
        setVisaCategoryId("");
        setDocumentRows([emptyDocument()]);
        setIsEditing(false);
        setEditingId(null);
        setEditLoading(false);
    };


    /* =====================================================
       OPEN CREATE
    ===================================================== */

    const handleOpenCreate = () => {
        resetForm();
        setShowModal(true);
    };


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const handleCloseModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditLoading(false);
        resetForm();
    };


    /* =====================================================
       ADD DOCUMENT ROW
    ===================================================== */

    const handleAddDocumentRow = () => {
        setDocumentRows((previous) => [
            ...previous,
            emptyDocument(),
        ]);
    };


    /* =====================================================
       REMOVE DOCUMENT ROW
    ===================================================== */

    const handleRemoveDocumentRow = (index) => {
        if (documentRows.length === 1) return;

        setDocumentRows((previous) =>
            previous.filter(
                (_, rowIndex) => rowIndex !== index
            )
        );
    };


    /* =====================================================
       DOCUMENT ROW CHANGE
    ===================================================== */

    const handleDocumentChange = (
        index,
        field,
        value
    ) => {
        setDocumentRows((previous) =>
            previous.map((document, rowIndex) =>
                rowIndex === index
                    ? {
                        ...document,
                        [field]: value,
                    }
                    : document
            )
        );
    };


    /* =====================================================
       OPEN EDIT
    ===================================================== */

    const handleEdit = async (id) => {

        /*
         * Clear the previous form first.
         * Modal opens immediately.
         * Form will NOT be shown until GET finishes.
         */

        setVisaCategoryId("");
        setDocumentRows([emptyDocument()]);

        setEditingId(id);
        setIsEditing(true);

        setShowModal(true);
        setEditLoading(true);

        try {

            const response =
                await getVisaDocumentRequirementById(id);

            const document = response.data?.data;

            if (!document) {

                setShowModal(false);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Document requirement not found.",
                });

                return;
            }

            setEditingId(document.id);

            setVisaCategoryId(
                String(
                    document.visa_category_id || ""
                )
            );

            setDocumentRows([
                {
                    document_type:
                        document.document_type || "",

                    title:
                        document.title || "",

                    description:
                        document.description || "",

                    is_required:
                        document.is_required === true ||
                        document.is_required === 1,

                    display_order:
                        document.display_order ?? 0,

                    status:
                        document.status || "ACTIVE",
                },
            ]);

        } catch (error) {

            console.error(
                "Failed to fetch document requirement:",
                error
            );

            setShowModal(false);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Failed to load document requirement.",
            });

        } finally {

            setEditLoading(false);
        }
    };


    /* =====================================================
       VALIDATE
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


        for (
            let i = 0;
            i < documentRows.length;
            i++
        ) {

            const document = documentRows[i];

            if (!document.document_type.trim()) {

                Swal.fire({
                    icon: "warning",
                    title: "Document Type Required",
                    text:
                        `Document type is required for document ${i + 1}.`,
                });

                return false;
            }


            if (!document.title.trim()) {

                Swal.fire({
                    icon: "warning",
                    title: "Title Required",
                    text:
                        `Title is required for document ${i + 1}.`,
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

        if (!validateForm()) return;

        const wasEditing = isEditing;

        try {

            setSaving(true);


            /* =========================
               UPDATE
            ========================= */

            if (wasEditing) {

                const document = documentRows[0];

                const payload = {

                    visa_category_id:
                        Number(visaCategoryId),

                    document_type:
                        document.document_type.trim(),

                    title:
                        document.title.trim(),

                    description:
                        document.description?.trim() ||
                        null,

                    is_required:
                        document.is_required,

                    display_order:
                        Number(
                            document.display_order
                        ) || 0,

                    status:
                        document.status || "ACTIVE",
                };


                const response =
                    await updateVisaDocumentRequirement(
                        editingId,
                        payload
                    );


                /*
                 * IMPORTANT:
                 * Update API completed.
                 *
                 * Close modal NOW.
                 * Do not wait for CMS GET.
                 */

                setShowModal(false);
                resetForm();


                Swal.fire({
                    icon: "success",
                    title: "Document Updated",
                    text:
                        response?.data?.message ||
                        "Visa document requirement updated successfully.",
                    timer: 1800,
                    showConfirmButton: false,
                });


                /*
                 * Refresh table separately.
                 * Modal does not depend on this request.
                 */

                fetchDocuments(currentPage).catch(
                    (error) => {
                        console.error(
                            "Failed to refresh document requirements:",
                            error
                        );
                    }
                );

                return;
            }


            /* =========================
               CREATE
            ========================= */

            const payload = {

                visa_category_id:
                    Number(visaCategoryId),

                documents: documentRows.map(
                    (document) => ({

                        document_type:
                            document.document_type.trim(),

                        title:
                            document.title.trim(),

                        description:
                            document.description?.trim() ||
                            null,

                        is_required:
                            document.is_required,

                        display_order:
                            Number(
                                document.display_order
                            ) || 0,

                        status:
                            document.status ||
                            "ACTIVE",
                    })
                ),
            };


            const response =
                await createVisaDocumentRequirements(
                    payload
                );


            /*
             * CREATE completed.
             * Close modal immediately.
             */

            setShowModal(false);
            resetForm();


            Swal.fire({
                icon: "success",
                title: "Documents Created",
                text:
                    response?.data?.message ||
                    "Visa document requirements created successfully.",
                timer: 1800,
                showConfirmButton: false,
            });


            /*
             * Refresh separately.
             */

            fetchDocuments(currentPage).catch(
                (error) => {
                    console.error(
                        "Failed to refresh document requirements:",
                        error
                    );
                }
            );


        } catch (error) {

            console.error(
                "Failed to save visa document requirement:",
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
                    title:
                        wasEditing
                            ? "Update Failed"
                            : "Save Failed",

                    text:
                        error?.response?.data?.message ||
                        (
                            wasEditing
                                ? "Failed to update visa document requirement."
                                : "Failed to create visa document requirements."
                        ),
                });
            }

        } finally {

            setSaving(false);
        }
    };


    /* =====================================================
       CHANGE STATUS
    ===================================================== */

    const handleStatusChange = async (
        id,
        currentStatus
    ) => {

        const newStatus =
            currentStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";


        const result = await Swal.fire({
            icon: "question",
            title: "Change Status?",
            text:
                `Are you sure you want to change the status to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Change",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#32134e",
        });


        if (!result.isConfirmed) return;


        try {

            setUpdatingStatusId(id);


            const response =
                await changeVisaDocumentRequirementStatus(
                    id,
                    {
                        status: newStatus,
                    }
                );


            /*
             * Update UI immediately.
             * No need to wait for CMS GET.
             */

            setDocuments((previous) =>
                previous.map((document) =>
                    document.id === id
                        ? {
                            ...document,
                            status: newStatus,
                        }
                        : document
                )
            );


            Swal.fire({
                icon: "success",
                title: "Status Updated",
                text:
                    response?.data?.message ||
                    `Document status changed to ${newStatus}.`,
                timer: 1800,
                showConfirmButton: false,
            });


            /*
             * Background synchronization only.
             */

            fetchDocuments(currentPage).catch(
                (error) => {
                    console.error(
                        "Failed to refresh document requirements:",
                        error
                    );
                }
            );


        } catch (error) {

            console.error(
                "Failed to change document status:",
                error
            );


            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error?.response?.data?.message ||
                    "Failed to change document status.",
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
            title: "Delete Document Requirement?",
            text:
                "Are you sure you want to delete this document requirement?",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
        });


        if (!result.isConfirmed) return;


        try {

            const response =
                await deleteVisaDocumentRequirement(id);


            /*
             * Remove immediately from UI.
             */

            setDocuments((previous) =>
                previous.filter(
                    (document) =>
                        document.id !== id
                )
            );


            Swal.fire({
                icon: "success",
                title: "Deleted",
                text:
                    response?.data?.message ||
                    "Document requirement deleted successfully.",
                timer: 1800,
                showConfirmButton: false,
            });


            /*
             * If last item of page was removed,
             * load previous page.
             */

            if (
                documents.length === 1 &&
                currentPage > 1
            ) {

                fetchDocuments(
                    currentPage - 1
                ).catch((error) => {
                    console.error(
                        "Failed to refresh documents:",
                        error
                    );
                });

            } else {

                fetchDocuments(
                    currentPage
                ).catch((error) => {
                    console.error(
                        "Failed to refresh documents:",
                        error
                    );
                });
            }


        } catch (error) {

            console.error(
                "Failed to delete document requirement:",
                error
            );


            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error?.response?.data?.message ||
                    "Failed to delete document requirement.",
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

        fetchDocuments(page);
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


                    {/* =========================
                        HEADER
                    ========================= */}

                    <div className="visa-document-header">

                        <div>

                            <h1>
                                Visa Document Requirements
                            </h1>

                            <p>
                                Manage required documents for
                                each visa category.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="visa-document-add-btn"
                            onClick={handleOpenCreate}
                        >
                            + Add Document Requirement
                        </button>

                    </div>


                    {/* =========================
                        TABLE
                    ========================= */}

                    <div className="visa-document-table-card">

                        <div className="visa-document-table-wrapper">

                            <table className="visa-document-table">

                                <thead>

                                    <tr>
                                        <th>#</th>
                                        <th>Visa Category</th>
                                        <th>Document Type</th>
                                        <th>Title</th>
                                        <th>Required</th>
                                        <th>Order</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="visa-document-empty"
                                            >
                                                Loading document requirements...
                                            </td>

                                        </tr>

                                    ) : documents.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="visa-document-empty"
                                            >
                                                No visa document requirements found.
                                            </td>

                                        </tr>

                                    ) : (

                                        documents.map(
                                            (document, index) => (

                                                <tr key={document.id}>

                                                    <td>
                                                        {(currentPage - 1) *
                                                            10 +
                                                            index +
                                                            1}
                                                    </td>


                                                    <td>

                                                        {document
                                                            ?.visa_category
                                                            ?.country
                                                            ?.country_name
                                                            ? `${document.visa_category.country.country_name} - `
                                                            : ""}

                                                        {document
                                                            ?.visa_category
                                                            ?.name ||
                                                            document
                                                                ?.visaCategory
                                                                ?.name ||
                                                            "-"}

                                                    </td>


                                                    <td>

                                                        <span className="document-type-code">
                                                            {
                                                                document.document_type
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>
                                                        {document.title || "-"}
                                                    </td>


                                                    <td>

                                                        {document.is_required ===
                                                            true ||
                                                            document.is_required ===
                                                            1 ? (

                                                            <span className="required-badge">
                                                                Required
                                                            </span>

                                                        ) : (

                                                            <span className="optional-badge">
                                                                Optional
                                                            </span>
                                                        )}

                                                    </td>


                                                    <td>
                                                        {document.display_order ??
                                                            0}
                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className={`visa-status-btn ${
                                                                document.status ===
                                                                "ACTIVE"
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    document.id,
                                                                    document.status
                                                                )
                                                            }
                                                            disabled={
                                                                updatingStatusId ===
                                                                document.id
                                                            }
                                                        >

                                                            {updatingStatusId ===
                                                            document.id
                                                                ? "Updating..."
                                                                : document.status}

                                                        </button>

                                                    </td>


                                                    <td>

                                                        <div className="visa-document-actions">

                                                            <button
                                                                type="button"
                                                                className="visa-edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        document.id
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="visa-delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        document.id
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

                                <div className="visa-document-pagination">

                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={lastPage}
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
                    className="visa-document-modal-overlay"
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
                        className={`visa-document-modal ${
                            !isEditing
                                ? "visa-document-modal-large"
                                : ""
                        }`}
                    >


                        {/* =========================
                            MODAL HEADER
                        ========================= */}

                        <div className="visa-document-modal-header">

                            <div>

                                <h2>
                                    {isEditing
                                        ? "Edit Document Requirement"
                                        : "Add Document Requirements"}
                                </h2>

                                <p>
                                    {isEditing
                                        ? "Update this visa document requirement."
                                        : "Add one or more document requirements to a visa category."}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="visa-modal-close"
                                onClick={handleCloseModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        {/* =========================
                            LOADING OR FORM
                        ========================= */}

                        {isEditing && editLoading ? (

                            <div className="visa-document-edit-loading">

                                <div className="visa-document-loader" />

                                <p>
                                    Loading document requirement...
                                </p>

                            </div>

                        ) : (

                            <>

                                {/* =========================
                                    SCROLLABLE BODY
                                ========================= */}

                                <div className="visa-document-modal-body">


                                    {/* VISA CATEGORY */}

                                    <div className="visa-form-group">

                                        <label>
                                            Visa Category *
                                        </label>

                                        <select
                                            value={visaCategoryId}
                                            onChange={(event) =>
                                                setVisaCategoryId(
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select Visa Category
                                            </option>


                                            {visaCategories.map(
                                                (category) => (

                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >

                                                        {category
                                                            ?.country
                                                            ?.country_name
                                                            ? `${category.country.country_name} - `
                                                            : ""}

                                                        {category.name}

                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>


                                    {/* =========================
                                        CREATE HEADER
                                    ========================= */}

                                    {!isEditing && (

                                        <div className="document-section-header">

                                            <div>

                                                <h3>
                                                    Documents
                                                </h3>

                                                <p>
                                                    Add all required
                                                    documents for this
                                                    visa category.
                                                </p>

                                            </div>


                                            <button
                                                type="button"
                                                className="add-document-row-btn"
                                                onClick={
                                                    handleAddDocumentRow
                                                }
                                            >
                                                + Add Another Document
                                            </button>

                                        </div>
                                    )}


                                    {/* =========================
                                        DOCUMENT ROWS
                                    ========================= */}

                                    {documentRows.map(
                                        (document, index) => (

                                            <div
                                                className="document-form-card"
                                                key={index}
                                            >

                                                {!isEditing && (

                                                    <div className="document-form-card-header">

                                                        <strong>
                                                            Document{" "}
                                                            {index + 1}
                                                        </strong>


                                                        {documentRows.length >
                                                            1 && (

                                                            <button
                                                                type="button"
                                                                className="remove-document-btn"
                                                                onClick={() =>
                                                                    handleRemoveDocumentRow(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                Remove
                                                            </button>
                                                        )}

                                                    </div>
                                                )}


                                                <div className="visa-form-grid">


                                                    {/* DOCUMENT TYPE */}

                                                    <div className="visa-form-group">

                                                        <label>
                                                            Document Type *
                                                        </label>

                                                        <input
                                                            type="text"
                                                            placeholder="e.g. PASSPORT"
                                                            value={
                                                                document.document_type
                                                            }
                                                            onChange={(event) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "document_type",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    {/* TITLE */}

                                                    <div className="visa-form-group">

                                                        <label>
                                                            Title *
                                                        </label>

                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Passport Copy"
                                                            value={
                                                                document.title
                                                            }
                                                            onChange={(event) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "title",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    {/* DISPLAY ORDER */}

                                                    <div className="visa-form-group">

                                                        <label>
                                                            Display Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                document.display_order
                                                            }
                                                            onChange={(event) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "display_order",
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    {/* STATUS */}

                                                    <div className="visa-form-group">

                                                        <label>
                                                            Status
                                                        </label>

                                                        <select
                                                            value={
                                                                document.status
                                                            }
                                                            onChange={(event) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "status",
                                                                    event.target
                                                                        .value
                                                                )
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


                                                {/* DESCRIPTION */}

                                                <div className="visa-form-group">

                                                    <label>
                                                        Description
                                                    </label>

                                                    <textarea
                                                        rows="3"
                                                        placeholder="Enter document description..."
                                                        value={
                                                            document.description
                                                        }
                                                        onChange={(event) =>
                                                            handleDocumentChange(
                                                                index,
                                                                "description",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                </div>


                                                {/* REQUIRED */}

                                                <label className="visa-checkbox-row">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            document.is_required
                                                        }
                                                        onChange={(event) =>
                                                            handleDocumentChange(
                                                                index,
                                                                "is_required",
                                                                event.target
                                                                    .checked
                                                            )
                                                        }
                                                    />

                                                    Required Document

                                                </label>

                                            </div>
                                        )
                                    )}

                                </div>


                                {/* =========================
                                    MODAL FOOTER
                                ========================= */}

                                <div className="visa-document-modal-footer">

                                    <button
                                        type="button"
                                        className="visa-cancel-btn"
                                        onClick={
                                            handleCloseModal
                                        }
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="button"
                                        className="visa-save-btn"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >

                                        {saving
                                            ? isEditing
                                                ? "Updating..."
                                                : "Saving..."
                                            : isEditing
                                                ? "Update Document"
                                                : "Save Documents"}

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


export default VisaDocument;