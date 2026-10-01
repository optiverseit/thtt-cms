import React, {
    useEffect,
    useState,
} from "react";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getInsuranceDocumentRequirementsCms,
    getInsuranceDocumentRequirementById,
    createInsuranceDocumentRequirements,
    updateInsuranceDocumentRequirement,
    changeInsuranceDocumentRequirementStatus,
    deleteInsuranceDocumentRequirement,
    getInsurancePlans,
} from "../../../api/BackendApi";

import "./InsuranceDocumentRequirement.css";

import Swal from "sweetalert2";

/* =========================================================
   EMPTY DOCUMENT
========================================================= */

const emptyDocument = () => ({
    document_type: "",
    title: "",
    description: "",
    is_required: true,
    display_order: 0,
    status: "ACTIVE",
});

/* =========================================================
   COMPONENT
========================================================= */

const InsuranceDocumentRequirement = () => {

    /* =====================================================
       DATA
    ===================================================== */

    const [
        documents,
        setDocuments,
    ] = useState([]);

    const [
        insurancePlans,
        setInsurancePlans,
    ] = useState([]);

    /* =====================================================
       LOADING
    ===================================================== */

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        editLoading,
        setEditLoading,
    ] = useState(false);

    const [
        updatingStatusId,
        setUpdatingStatusId,
    ] = useState(null);

    /* =====================================================
       PAGINATION
    ===================================================== */

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const [
        lastPage,
        setLastPage,
    ] = useState(1);

    /* =====================================================
       MODAL
    ===================================================== */

    const [
        showModal,
        setShowModal,
    ] = useState(false);

    const [
        isEditing,
        setIsEditing,
    ] = useState(false);

    const [
        editingId,
        setEditingId,
    ] = useState(null);

    /* =====================================================
       FORM
    ===================================================== */

    const [
        insurancePlanId,
        setInsurancePlanId,
    ] = useState("");

    const [
        documentRows,
        setDocumentRows,
    ] = useState([
        emptyDocument(),
    ]);

    /* =====================================================
       FETCH DOCUMENT REQUIREMENTS
    ===================================================== */

    const fetchDocuments = async (
        page = 1
    ) => {

        try {

            setLoading(true);

            const response =
                await getInsuranceDocumentRequirementsCms(
                    page
                );

            console.log(
                "INSURANCE DOCUMENT REQUIREMENTS:",
                response.data
            );

            const result =
                response.data?.data;

            /*
             * PAGINATED RESPONSE
             */
            if (
                result &&
                Array.isArray(
                    result.data
                )
            ) {

                setDocuments(
                    result.data
                );

                setCurrentPage(
                    result.current_page || 1
                );

                setLastPage(
                    result.last_page || 1
                );

            } else if (
                Array.isArray(result)
            ) {

                /*
                 * NON-PAGINATED FALLBACK
                 */

                setDocuments(
                    result
                );

                setCurrentPage(1);
                setLastPage(1);

            } else {

                setDocuments([]);
                setCurrentPage(1);
                setLastPage(1);
            }

        } catch (error) {

            console.error(
                "Failed to fetch insurance document requirements:",
                error
            );

            setDocuments([]);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error?.response?.data
                        ?.message ||
                    "Failed to load insurance document requirements.",
                confirmButtonColor:
                    "#32134e",
            });

        } finally {

            setLoading(false);
        }
    };

    /* =====================================================
       FETCH INSURANCE PLANS
    ===================================================== */

    const fetchInsurancePlans =
        async () => {

            try {

                const response =
                    await getInsurancePlans();

                console.log(
                    "INSURANCE PLANS:",
                    response.data
                );

                const result =
                    response.data?.data;

                if (
                    Array.isArray(
                        result
                    )
                ) {

                    setInsurancePlans(
                        result
                    );

                } else if (
                    Array.isArray(
                        result?.data
                    )
                ) {

                    setInsurancePlans(
                        result.data
                    );

                } else {

                    setInsurancePlans(
                        []
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to fetch insurance plans:",
                    error
                );

                setInsurancePlans(
                    []
                );
            }
        };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchDocuments(1);

        fetchInsurancePlans();

    }, []);

    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {

        setInsurancePlanId("");

        setDocumentRows([
            emptyDocument(),
        ]);

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

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditLoading(false);

        resetForm();
    };

    /* =====================================================
       ADD DOCUMENT ROW
    ===================================================== */

    const handleAddDocumentRow =
        () => {

            setDocumentRows(
                (previous) => [
                    ...previous,
                    emptyDocument(),
                ]
            );
        };

    /* =====================================================
       REMOVE DOCUMENT ROW
    ===================================================== */

    const handleRemoveDocumentRow = (
        index
    ) => {

        if (
            documentRows.length === 1
        ) {
            return;
        }

        setDocumentRows(
            (previous) =>
                previous.filter(
                    (_, rowIndex) =>
                        rowIndex !== index
                )
        );
    };

    /* =====================================================
       DOCUMENT CHANGE
    ===================================================== */

    const handleDocumentChange = (
        index,
        field,
        value
    ) => {

        setDocumentRows(
            (previous) =>
                previous.map(
                    (
                        document,
                        rowIndex
                    ) =>
                        rowIndex === index
                            ? {
                                ...document,

                                [field]:
                                    value,
                            }
                            : document
                )
        );
    };

    /* =====================================================
       OPEN EDIT
    ===================================================== */

    const handleEdit = async (
        id
    ) => {

        /*
         * Clear old form first.
         */

        setInsurancePlanId("");

        setDocumentRows([
            emptyDocument(),
        ]);

        setEditingId(id);

        setIsEditing(true);

        setShowModal(true);

        setEditLoading(true);

        try {

            const response =
                await getInsuranceDocumentRequirementById(
                    id
                );

            const document =
                response.data?.data;

            if (!document) {

                setShowModal(
                    false
                );

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        "Document requirement not found.",
                });

                return;
            }

            setEditingId(
                document.id
            );

            setInsurancePlanId(
                String(
                    document
                        .insurance_plan_id ||
                    document
                        .insurance_plan
                        ?.id ||
                    document
                        .insurancePlan
                        ?.id ||
                    ""
                )
            );

            setDocumentRows([
                {

                    document_type:
                        document
                            .document_type ||
                        "",

                    title:
                        document.title ||
                        "",

                    description:
                        document
                            .description ||
                        "",

                    is_required:
                        document
                            .is_required ===
                        true ||
                        document
                            .is_required ===
                        1,

                    display_order:
                        document
                            .display_order ??
                        0,

                    status:
                        document.status ||
                        "ACTIVE",
                },
            ]);

        } catch (error) {

            console.error(
                "Failed to fetch insurance document requirement:",
                error
            );

            setShowModal(false);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response
                        ?.data?.message ||
                    "Failed to load document requirement.",
            });

        } finally {

            setEditLoading(
                false
            );
        }
    };

    /* =====================================================
       VALIDATE
    ===================================================== */

    const validateForm = () => {

        if (!insurancePlanId) {

            Swal.fire({
                icon: "warning",
                title:
                    "Insurance Plan Required",
                text:
                    "Please select an insurance plan.",
                confirmButtonColor:
                    "#32134e",
            });

            return false;
        }

        for (
            let i = 0;
            i <
            documentRows.length;
            i++
        ) {

            const document =
                documentRows[i];

            if (
                !document
                    .document_type
                    .trim()
            ) {

                Swal.fire({
                    icon: "warning",
                    title:
                        "Document Type Required",
                    text:
                        `Document type is required for document ${i + 1
                        }.`,
                    confirmButtonColor:
                        "#32134e",
                });

                return false;
            }

            if (
                !document.title.trim()
            ) {

                Swal.fire({
                    icon: "warning",
                    title:
                        "Title Required",
                    text:
                        `Title is required for document ${i + 1
                        }.`,
                    confirmButtonColor:
                        "#32134e",
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

        const wasEditing = isEditing;

        try {

            setSaving(true);

            /* =====================================
               UPDATE
            ===================================== */

            if (wasEditing) {

                const document =
                    documentRows[0];

                const payload = {

                    insurance_plan_id:
                        Number(
                            insurancePlanId
                        ),

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
                };

                console.log(
                    "UPDATE DOCUMENT REQUIREMENT PAYLOAD:",
                    payload
                );

                const response =
                    await updateInsuranceDocumentRequirement(
                        editingId,
                        payload
                    );

                setShowModal(false);

                resetForm();

                Swal.fire({
                    icon: "success",

                    title:
                        "Document Updated",

                    text:
                        response?.data?.message ||
                        "Insurance document requirement updated successfully.",

                    timer: 1800,

                    showConfirmButton:
                        false,
                });

                fetchDocuments(
                    currentPage
                ).catch(
                    (error) => {

                        console.error(
                            "Failed to refresh insurance document requirements:",
                            error
                        );
                    }
                );

                return;
            }


            /* =====================================
               CREATE
            ===================================== */

            const payload = {

                insurance_plan_id:
                    Number(
                        insurancePlanId
                    ),

                /*
                 * IMPORTANT:
                 * Backend requires
                 * document_requirements
                 *
                 * NOT documents
                 */
                document_requirements:
                    documentRows.map(
                        (
                            document
                        ) => ({

                            document_type:
                                document
                                    .document_type
                                    .trim(),

                            title:
                                document
                                    .title
                                    .trim(),

                            description:
                                document
                                    .description
                                    ?.trim() ||
                                null,

                            is_required:
                                document
                                    .is_required,

                            display_order:
                                Number(
                                    document
                                        .display_order
                                ) || 0,

                            status:
                                document
                                    .status ||
                                "ACTIVE",
                        })
                    ),
            };

            console.log(
                "CREATE DOCUMENT REQUIREMENTS PAYLOAD:",
                payload
            );

            const response =
                await createInsuranceDocumentRequirements(
                    payload
                );

            setShowModal(false);

            resetForm();

            Swal.fire({
                icon: "success",

                title:
                    "Documents Created",

                text:
                    response?.data?.message ||
                    "Insurance document requirements created successfully.",

                timer: 1800,

                showConfirmButton:
                    false,
            });

            fetchDocuments(
                currentPage
            ).catch(
                (error) => {

                    console.error(
                        "Failed to refresh insurance document requirements:",
                        error
                    );
                }
            );

        } catch (error) {

            console.error(
                "Failed to save insurance document requirement:",
                error
            );

            console.error(
                "BACKEND RESPONSE:",
                error?.response?.data
            );

            const validationErrors =
                error?.response
                    ?.data?.errors;

            if (
                validationErrors
            ) {

                const firstError =
                    Object.values(
                        validationErrors
                    )?.[0]?.[0];

                Swal.fire({
                    icon:
                        "error",

                    title:
                        "Validation Failed",

                    text:
                        firstError ||
                        "Validation failed.",
                });

            } else {

                Swal.fire({
                    icon:
                        "error",

                    title:
                        wasEditing
                            ? "Update Failed"
                            : "Save Failed",

                    text:
                        error?.response
                            ?.data
                            ?.message ||
                        (
                            wasEditing
                                ? "Failed to update insurance document requirement."
                                : "Failed to create insurance document requirements."
                        ),
                });
            }

        } finally {

            setSaving(false);
        }
    };

    /* =====================================================
       CHANGE STATUS

       IMPORTANT:
       Backend requires ONLY ID.
       No status body is sent.
    ===================================================== */

    const handleStatusChange =
        async (
            id,
            currentStatus
        ) => {

            const newStatus =
                currentStatus ===
                    "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE";

            const result =
                await Swal.fire({

                    icon:
                        "question",

                    title:
                        "Change Status?",

                    text:
                        `Are you sure you want to change the status to ${newStatus}?`,

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Yes, Change",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#32134e",
                });

            if (
                !result.isConfirmed
            ) {
                return;
            }

            try {

                setUpdatingStatusId(
                    id
                );

                /*
                 * ONLY ID IS SENT.
                 */
                const response =
                    await changeInsuranceDocumentRequirementStatus(
                        id
                    );

                if (
                    response.data
                        ?.status
                ) {

                    const returnedStatus =
                        response.data
                            ?.data
                            ?.status ||
                        newStatus;

                    setDocuments(
                        (previous) =>
                            previous.map(
                                (
                                    document
                                ) =>
                                    document.id ===
                                        id
                                        ? {
                                            ...document,

                                            status:
                                                returnedStatus,
                                        }
                                        : document
                            )
                    );

                    Swal.fire({
                        icon:
                            "success",

                        title:
                            "Status Updated",

                        text:
                            response
                                ?.data
                                ?.message ||
                            `Document status changed to ${returnedStatus}.`,

                        timer:
                            1800,

                        showConfirmButton:
                            false,
                    });
                }

            } catch (error) {

                console.error(
                    "Failed to change insurance document status:",
                    error
                );

                Swal.fire({
                    icon: "error",

                    title:
                        "Update Failed",

                    text:
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Failed to change document status.",
                });

            } finally {

                setUpdatingStatusId(
                    null
                );
            }
        };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete =
        async (id) => {

            const result =
                await Swal.fire({

                    icon:
                        "warning",

                    title:
                        "Delete Document Requirement?",

                    text:
                        "Are you sure you want to delete this insurance document requirement?",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Yes, Delete",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#dc2626",
                });

            if (
                !result.isConfirmed
            ) {
                return;
            }

            try {

                const response =
                    await deleteInsuranceDocumentRequirement(
                        id
                    );

                setDocuments(
                    (previous) =>
                        previous.filter(
                            (
                                document
                            ) =>
                                document.id !==
                                id
                        )
                );

                Swal.fire({
                    icon:
                        "success",

                    title:
                        "Deleted",

                    text:
                        response?.data
                            ?.message ||
                        "Document requirement deleted successfully.",

                    timer: 1800,

                    showConfirmButton:
                        false,
                });

                if (
                    documents.length ===
                    1 &&
                    currentPage > 1
                ) {

                    fetchDocuments(
                        currentPage -
                        1
                    );

                } else {

                    fetchDocuments(
                        currentPage
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to delete insurance document requirement:",
                    error
                );

                Swal.fire({
                    icon: "error",

                    title:
                        "Delete Failed",

                    text:
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Failed to delete document requirement.",
                });
            }
        };

    /* =====================================================
       PAGE CHANGE
    ===================================================== */

    const handlePageChange = (
        page
    ) => {

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
       GET PLAN NAME
    ===================================================== */

    const getPlanName = (
        document
    ) => {

        return (
            document
                ?.insurance_plan
                ?.name ||
            document
                ?.insurancePlan
                ?.name ||
            insurancePlans.find(
                (plan) =>
                    String(
                        plan.id
                    ) ===
                    String(
                        document
                            .insurance_plan_id
                    )
            )?.name ||
            "-"
        );
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

                    <div className="insurance-document-header">

                        <div>

                            <h1>
                                Insurance Document Requirements
                            </h1>

                            <p>
                                Manage required documents for each insurance plan.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="insurance-document-add-btn"
                            onClick={
                                handleOpenCreate
                            }
                        >
                            + Add Document Requirement
                        </button>

                    </div>

                    {/* =========================
                        TABLE
                    ========================= */}

                    <div className="insurance-document-table-card">

                        <div className="insurance-document-table-wrapper">

                            <table className="insurance-document-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Insurance Plan
                                        </th>

                                        <th>
                                            Document Type
                                        </th>

                                        <th>
                                            Title
                                        </th>

                                        <th>
                                            Required
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
                                                colSpan="8"
                                                className="insurance-document-empty"
                                            >
                                                Loading document requirements...
                                            </td>

                                        </tr>

                                    ) : documents.length ===
                                        0 ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="insurance-document-empty"
                                            >
                                                No insurance document requirements found.
                                            </td>

                                        </tr>

                                    ) : (

                                        documents.map(
                                            (
                                                document,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        document.id
                                                    }
                                                >

                                                    <td>

                                                        {(currentPage -
                                                            1) *
                                                            10 +
                                                            index +
                                                            1}

                                                    </td>

                                                    {/* PLAN */}

                                                    <td>

                                                        <strong className="insurance-plan-name">
                                                            {getPlanName(
                                                                document
                                                            )}
                                                        </strong>

                                                    </td>

                                                    {/* DOCUMENT TYPE */}

                                                    <td>

                                                        <span className="document-type-code">

                                                            {
                                                                document.document_type
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* TITLE */}

                                                    <td>

                                                        {document.title ||
                                                            "-"}

                                                    </td>

                                                    {/* REQUIRED */}

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

                                                    {/* ORDER */}

                                                    <td>

                                                        {document.display_order ??
                                                            0}

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className={`insurance-status-btn ${document.status ===
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

                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="insurance-document-actions">

                                                            <button
                                                                type="button"
                                                                className="insurance-edit-btn"
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
                                                                className="insurance-delete-btn"
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
                            lastPage >
                            1 && (

                                <div className="insurance-document-pagination">

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
                    className="insurance-document-modal-overlay"
                    onMouseDown={(
                        event
                    ) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            handleCloseModal();
                        }
                    }}
                >

                    <div
                        className={`insurance-document-modal ${!isEditing
                            ? "insurance-document-modal-large"
                            : ""
                            }`}
                    >

                        {/* =========================
                            HEADER
                        ========================= */}

                        <div className="insurance-document-modal-header">

                            <div>

                                <h2>

                                    {isEditing
                                        ? "Edit Document Requirement"
                                        : "Add Document Requirements"}

                                </h2>

                                <p>

                                    {isEditing
                                        ? "Update this insurance document requirement."
                                        : "Add one or more document requirements to an insurance plan."}

                                </p>

                            </div>

                            <button
                                type="button"
                                className="insurance-modal-close"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={
                                    saving
                                }
                            >
                                ×
                            </button>

                        </div>

                        {/* =========================
                            LOADING / FORM
                        ========================= */}

                        {isEditing &&
                            editLoading ? (

                            <div className="insurance-document-edit-loading">

                                <div className="insurance-document-loader" />

                                <p>
                                    Loading document requirement...
                                </p>

                            </div>

                        ) : (

                            <>

                                {/* BODY */}

                                <div className="insurance-document-modal-body">

                                    {/* INSURANCE PLAN */}

                                    <div className="insurance-form-group">

                                        <label>
                                            Insurance Plan *
                                        </label>

                                        <select
                                            value={
                                                insurancePlanId
                                            }
                                            onChange={(event) =>
                                                setInsurancePlanId(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select Insurance Plan
                                            </option>

                                            {insurancePlans.map(
                                                (
                                                    plan
                                                ) => (

                                                    <option
                                                        key={
                                                            plan.id
                                                        }
                                                        value={
                                                            plan.id
                                                        }
                                                    >
                                                        {
                                                            plan.name
                                                        }
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* CREATE HEADER */}

                                    {!isEditing && (

                                        <div className="document-section-header">

                                            <div>

                                                <h3>
                                                    Documents
                                                </h3>

                                                <p>
                                                    Add all required documents for this insurance plan.
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

                                    {/* DOCUMENT ROWS */}

                                    {documentRows.map(
                                        (
                                            document,
                                            index
                                        ) => (

                                            <div
                                                className="document-form-card"
                                                key={
                                                    index
                                                }
                                            >

                                                {!isEditing && (

                                                    <div className="document-form-card-header">

                                                        <strong>
                                                            Document{" "}
                                                            {index +
                                                                1}
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

                                                <div className="insurance-form-grid">

                                                    {/* TYPE */}

                                                    <div className="insurance-form-group">

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
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                    {/* TITLE */}

                                                    <div className="insurance-form-group">

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
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                    {/* ORDER */}

                                                    <div className="insurance-form-group">

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
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                    {/* STATUS */}

                                                    <div className="insurance-form-group">

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
                                                                    event
                                                                        .target
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

                                                <div className="insurance-form-group">

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
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                </div>

                                                {/* REQUIRED */}

                                                <label className="insurance-checkbox-row">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            document.is_required
                                                        }
                                                        onChange={(event) =>
                                                            handleDocumentChange(
                                                                index,
                                                                "is_required",
                                                                event
                                                                    .target
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

                                {/* FOOTER */}

                                <div className="insurance-document-modal-footer">

                                    <button
                                        type="button"
                                        className="insurance-cancel-btn"
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
                                        className="insurance-save-btn"
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

export default InsuranceDocumentRequirement;