import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getInsuranceInformationCms,
    getInsuranceInformationById,
    createInsuranceInformation,
    updateInsuranceInformation,
    changeInsuranceInformationStatus,
    deleteInsuranceInformation,
    getInsurancePlans,
} from "../../../api/BackendApi";

import "./InsuranceInformation.css";

/* =========================================================
   EMPTY INFORMATION
========================================================= */

const emptyInformation = () => ({
    content: "",
    display_order: 0,
    status: "ACTIVE",
});

/* =========================================================
   COMPONENT
========================================================= */

const InsuranceInformation = () => {

    /* =====================================================
       DATA
    ===================================================== */

    const [
        information,
        setInformation,
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
        informationType,
        setInformationType,
    ] = useState("COVERAGE");

    const [
        informationRows,
        setInformationRows,
    ] = useState([
        emptyInformation(),
    ]);

    /* =====================================================
       MODAL REF
    ===================================================== */

    const modalRef =
        useRef(null);

    /* =====================================================
       FETCH INFORMATION
    ===================================================== */

    const fetchInformation = async (
        page = 1
    ) => {

        try {

            setLoading(true);

            const response =
                await getInsuranceInformationCms(
                    page
                );

            console.log(
                "INSURANCE INFORMATION CMS:",
                response.data
            );

            const result =
                response.data?.data;

            if (
                result &&
                Array.isArray(
                    result.data
                )
            ) {

                setInformation(
                    result.data
                );

                setCurrentPage(
                    result.current_page ||
                    1
                );

                setLastPage(
                    result.last_page ||
                    1
                );

            } else if (
                Array.isArray(result)
            ) {

                setInformation(
                    result
                );

                setCurrentPage(1);

                setLastPage(1);

            } else {

                setInformation([]);

                setCurrentPage(1);

                setLastPage(1);
            }

        } catch (error) {

            console.error(
                "Failed to fetch insurance information:",
                error
            );

            setInformation([]);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response
                        ?.data?.message ||
                    "Failed to load insurance information.",
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

        fetchInformation(1);

        fetchInsurancePlans();

    }, []);

    /* =====================================================
       RESET
    ===================================================== */

    const resetForm = () => {

        setInsurancePlanId("");

        setInformationType(
            "COVERAGE"
        );

        setInformationRows([
            emptyInformation(),
        ]);

        setIsEditing(false);

        setEditingId(null);

        setEditLoading(false);
    };

    /* =====================================================
       OPEN CREATE
    ===================================================== */

    const handleOpenCreate =
        () => {

            resetForm();

            setShowModal(true);
        };

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const handleCloseModal =
        () => {

            if (saving) {
                return;
            }

            setShowModal(false);

            resetForm();
        };

    /* =====================================================
       ADD INFORMATION ROW
    ===================================================== */

    const handleAddInformationRow =
        () => {

            setInformationRows(
                (previous) => [
                    ...previous,
                    emptyInformation(),
                ]
            );

            setTimeout(() => {

                if (
                    modalRef.current
                ) {

                    modalRef.current.scrollTo(
                        {
                            top:
                                modalRef
                                    .current
                                    .scrollHeight,

                            behavior:
                                "smooth",
                        }
                    );
                }

            }, 100);
        };

    /* =====================================================
       REMOVE INFORMATION ROW
    ===================================================== */

    const handleRemoveInformationRow =
        (index) => {

            if (
                informationRows.length ===
                1
            ) {
                return;
            }

            setInformationRows(
                (previous) =>
                    previous.filter(
                        (
                            _,
                            rowIndex
                        ) =>
                            rowIndex !==
                            index
                    )
            );
        };

    /* =====================================================
       INFORMATION CHANGE
    ===================================================== */

    const handleInformationChange = (
        index,
        field,
        value
    ) => {

        setInformationRows(
            (previous) =>
                previous.map(
                    (
                        item,
                        rowIndex
                    ) =>
                        rowIndex === index
                            ? {
                                ...item,
                                [field]:
                                    value,
                            }
                            : item
                )
        );
    };

    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = async (
        id
    ) => {

        /*
         * Clear previous values.
         */

        setInsurancePlanId("");

        setInformationType(
            "COVERAGE"
        );

        setInformationRows([
            emptyInformation(),
        ]);

        setEditingId(id);

        setIsEditing(true);

        setShowModal(true);

        setEditLoading(true);

        try {

            const response =
                await getInsuranceInformationById(
                    id
                );

            const item =
                response.data?.data;

            if (!item) {

                setShowModal(false);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        "Insurance information not found.",
                });

                return;
            }

            setEditingId(
                item.id
            );

            setInsurancePlanId(
                String(
                    item
                        .insurance_plan_id ||
                    item
                        .insurance_plan
                        ?.id ||
                    item
                        .insurancePlan
                        ?.id ||
                    ""
                )
            );

            setInformationType(
                item.type ||
                "COVERAGE"
            );

            setInformationRows([
                {

                    content:
                        item.content ||
                        "",

                    display_order:
                        item
                            .display_order ??
                        0,

                    status:
                        item.status ||
                        "ACTIVE",
                },
            ]);

        } catch (error) {

            console.error(
                "Failed to fetch insurance information:",
                error
            );

            setShowModal(false);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response
                        ?.data?.message ||
                    "Failed to load insurance information.",
            });

        } finally {

            setEditLoading(
                false
            );
        }
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm =
        () => {

            if (
                !insurancePlanId
            ) {

                Swal.fire({
                    icon:
                        "warning",

                    title:
                        "Insurance Plan Required",

                    text:
                        "Please select an insurance plan.",
                });

                return false;
            }

            if (
                !informationType
            ) {

                Swal.fire({
                    icon:
                        "warning",

                    title:
                        "Information Type Required",

                    text:
                        "Please select an information type.",
                });

                return false;
            }

            for (
                let i = 0;
                i <
                informationRows.length;
                i++
            ) {

                const item =
                    informationRows[i];

                if (
                    !item.content.trim()
                ) {

                    Swal.fire({
                        icon:
                            "warning",

                        title:
                            "Content Required",

                        text:
                            `Content is required for item ${i + 1
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

    /* =====================================================
       SAVE CREATE / UPDATE
    ===================================================== */

    const handleSave = async () => {

        if (!validateForm()) {
            return;
        }

        const wasEditing =
            isEditing;

        try {

            setSaving(true);

            /* =========================
               UPDATE
            ========================= */

            if (wasEditing) {

                const item =
                    informationRows[0];

                const payload = {

                    insurance_plan_id:
                        Number(
                            insurancePlanId
                        ),

                    type:
                        informationType,

                    content:
                        item.content.trim(),

                    display_order:
                        Number(
                            item.display_order
                        ) || 0,

                    status:
                        item.status ||
                        "ACTIVE",
                };

                const response =
                    await updateInsuranceInformation(
                        editingId,
                        payload
                    );

                /*
                 * UPDATE COMPLETED.
                 * CLOSE MODAL IMMEDIATELY.
                 */

                setShowModal(false);

                resetForm();

                /*
                 * SHOW SUCCESS IMMEDIATELY.
                 * DO NOT WAIT FOR GET API.
                 */

                Swal.fire({
                    icon: "success",

                    title:
                        "Information Updated",

                    text:
                        response?.data?.message ||
                        "Insurance information updated successfully.",

                    timer: 1800,

                    showConfirmButton:
                        false,
                });

                /*
                 * REFRESH TABLE IN BACKGROUND.
                 */

                fetchInformation(
                    currentPage
                ).catch(
                    (error) => {

                        console.error(
                            "Failed to refresh insurance information:",
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

                insurance_plan_id:
                    Number(
                        insurancePlanId
                    ),

                information:
                    informationRows.map(
                        (item) => ({

                            type:
                                informationType,

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

            const response =
                await createInsuranceInformation(
                    payload
                );

            /*
             * CREATE API IS NOW COMPLETE.
             */

            setShowModal(false);

            resetForm();

            /*
             * SHOW SUCCESS IMMEDIATELY.
             */

            Swal.fire({
                icon: "success",

                title:
                    "Information Created",

                text:
                    response?.data?.message ||
                    "Insurance information created successfully.",

                timer: 1800,

                showConfirmButton:
                    false,
            });

            /*
             * NOW REFRESH TABLE.
             * NO AWAIT.
             */

            fetchInformation(
                currentPage
            ).catch(
                (error) => {

                    console.error(
                        "Failed to refresh insurance information:",
                        error
                    );
                }
            );

        } catch (error) {

            console.error(
                "Failed to save insurance information:",
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
                                ? "Failed to update insurance information."
                                : "Failed to create insurance information."
                        ),
                });
            }

        } finally {

            setSaving(false);
        }
    };

    /* =====================================================
       STATUS

       BACKEND ONLY NEEDS ID.
       NO STATUS PAYLOAD.
    ===================================================== */

    const handleStatusChange =
        async (
            id,
            currentStatus
        ) => {

            if (
                updatingStatusId !==
                null
            ) {
                return;
            }

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
                        newStatus ===
                            "ACTIVE"
                            ? "Are you sure you want to activate this insurance information?"
                            : "Are you sure you want to deactivate this insurance information?",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        newStatus ===
                            "ACTIVE"
                            ? "Yes, Activate"
                            : "Yes, Deactivate",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#32134e",

                    cancelButtonColor:
                        "#6c757d",

                    reverseButtons:
                        true,
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
                 * ONLY ID.
                 */
                const response =
                    await changeInsuranceInformationStatus(
                        id
                    );

                /*
                 * Use backend status if returned.
                 */
                const returnedStatus =
                    response?.data
                        ?.data?.status ||
                    newStatus;

                setInformation(
                    (previous) =>
                        previous.map(
                            (item) =>
                                item.id ===
                                    id
                                    ? {
                                        ...item,

                                        status:
                                            returnedStatus,
                                    }
                                    : item
                        )
                );

                Swal.fire({
                    icon:
                        "success",

                    title:
                        "Status Updated",

                    text:
                        response?.data
                            ?.message ||
                        `Information status changed to ${returnedStatus}.`,

                    timer: 1800,

                    showConfirmButton:
                        false,
                });

            } catch (error) {

                console.error(
                    "Failed to change insurance information status:",
                    error
                );

                Swal.fire({
                    icon:
                        "error",

                    title:
                        "Update Failed",

                    text:
                        error?.response
                            ?.data
                            ?.message ||
                        "Failed to change information status.",
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
                        "Delete Insurance Information?",

                    text:
                        "Are you sure you want to delete this insurance information?",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Yes, Delete",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#d32f2f",

                    cancelButtonColor:
                        "#6c757d",

                    reverseButtons:
                        true,
                });

            if (
                !result.isConfirmed
            ) {
                return;
            }

            try {

                await deleteInsuranceInformation(
                    id
                );

                if (
                    information.length ===
                    1 &&
                    currentPage > 1
                ) {

                    await fetchInformation(
                        currentPage -
                        1
                    );

                } else {

                    await fetchInformation(
                        currentPage
                    );
                }

                Swal.fire({
                    icon:
                        "success",

                    title:
                        "Deleted",

                    text:
                        "Insurance information deleted successfully.",

                    timer:
                        1800,

                    showConfirmButton:
                        false,
                });

            } catch (error) {

                console.error(
                    "Failed to delete insurance information:",
                    error
                );

                Swal.fire({
                    icon:
                        "error",

                    title:
                        "Delete Failed",

                    text:
                        error?.response
                            ?.data
                            ?.message ||
                        "Failed to delete insurance information.",
                });
            }
        };

    /* =====================================================
       PAGE CHANGE
    ===================================================== */

    const handlePageChange =
        (page) => {

            if (
                page < 1 ||
                page > lastPage ||
                page === currentPage
            ) {
                return;
            }

            fetchInformation(
                page
            );
        };

    /* =====================================================
       TYPE
    ===================================================== */

    const getTypeLabel = (
        type
    ) => {

        if (
            type === "COVERAGE"
        ) {
            return "Coverage";
        }

        if (
            type === "EXCLUSION"
        ) {
            return "Exclusion";
        }

        if (
            type === "POLICY"
        ) {
            return "Policy";
        }

        if (
            type ===
            "TERMS_CONDITION"
        ) {
            return "Terms & Conditions";
        }

        return type;
    };

    const getTypeClass = (
        type
    ) => {

        if (
            type === "COVERAGE"
        ) {
            return "coverage";
        }

        if (
            type === "EXCLUSION"
        ) {
            return "exclusion";
        }

        if (
            type === "POLICY"
        ) {
            return "policy";
        }

        if (
            type ===
            "TERMS_CONDITION"
        ) {
            return "terms";
        }

        return "";
    };

    /* =====================================================
       PLAN NAME
    ===================================================== */

    const getPlanName = (
        item
    ) => {

        return (
            item
                ?.insurance_plan
                ?.name ||
            item
                ?.insurancePlan
                ?.name ||
            insurancePlans.find(
                (plan) =>
                    String(
                        plan.id
                    ) ===
                    String(
                        item
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

                    {/* HEADER */}

                    <div className="insurance-information-header">

                        <div>

                            <h1>
                                Insurance Information
                            </h1>

                            <p>
                                Manage inclusions, policies and terms & conditions for insurance plans.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="insurance-information-add-btn"
                            onClick={
                                handleOpenCreate
                            }
                        >
                            + Add Insurance Information
                        </button>

                    </div>

                    {/* TABLE */}

                    <div className="insurance-information-table-card">

                        <div className="insurance-information-table-wrapper">

                            <table className="insurance-information-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Insurance Plan
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
                                                className="insurance-information-empty"
                                            >
                                                Loading insurance information...
                                            </td>

                                        </tr>

                                    ) : information.length ===
                                        0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="insurance-information-empty"
                                            >
                                                No insurance information found.
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

                                                    {/* PLAN */}

                                                    <td>

                                                        {getPlanName(
                                                            item
                                                        )}

                                                    </td>

                                                    {/* TYPE */}

                                                    <td>

                                                        <span
                                                            className={`insurance-information-type ${getTypeClass(
                                                                item.type
                                                            )}`}
                                                        >

                                                            {getTypeLabel(
                                                                item.type
                                                            )}

                                                        </span>

                                                    </td>

                                                    {/* CONTENT */}

                                                    <td>

                                                        <div className="insurance-information-content">

                                                            {item.content ||
                                                                "-"}

                                                        </div>

                                                    </td>

                                                    {/* ORDER */}

                                                    <td>

                                                        {item.display_order ??
                                                            0}

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className={`insurance-information-status-btn ${item.status ===
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

                                                    {/* ACTIONS */}

                                                    <td>

                                                        <div className="insurance-information-actions">

                                                            <button
                                                                type="button"
                                                                className="insurance-information-edit-btn"
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
                                                                className="insurance-information-delete-btn"
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
                            lastPage >
                            1 && (

                                <div className="insurance-information-pagination">

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
                    className="insurance-information-modal-overlay"
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
                        ref={
                            modalRef
                        }
                        className={`insurance-information-modal ${!isEditing
                            ? "insurance-information-modal-large"
                            : ""
                            }`}
                    >

                        {/* HEADER */}

                        <div className="insurance-information-modal-header">

                            <div>

                                <h2>

                                    {isEditing
                                        ? "Edit Insurance Information"
                                        : "Add Insurance Information"}

                                </h2>

                                <p>

                                    {isEditing
                                        ? "Update this insurance information."
                                        : "Add one or more information items to an insurance plan."}

                                </p>

                            </div>

                            <button
                                type="button"
                                className="insurance-information-modal-close"
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

                        {/* EDIT LOADING */}

                        {isEditing &&
                            editLoading ? (

                            <div className="insurance-information-edit-loading">

                                <div className="insurance-information-loader"></div>

                                <p>
                                    Loading insurance information...
                                </p>

                            </div>

                        ) : (

                            <>

                                {/* BODY */}

                                <div className="insurance-information-modal-body">

                                    {/* PLAN */}

                                    <div className="insurance-information-form-group">

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
                                            disabled={
                                                saving
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

                                    {/* TYPE */}

                                    <div className="insurance-information-form-group">

                                        <label>
                                            Information Type *
                                        </label>

                                        <select
                                            value={
                                                informationType
                                            }
                                            onChange={(event) =>
                                                setInformationType(
                                                    event.target.value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            <option value="COVERAGE">
                                                Coverage
                                            </option>

                                            <option value="EXCLUSION">
                                                Exclusion
                                            </option>

                                            <option value="POLICY">
                                                Policy
                                            </option>

                                            <option value="TERMS_CONDITION">
                                                Terms & Conditions
                                            </option>

                                        </select>

                                    </div>

                                    {/* CREATE HEADER */}

                                    {!isEditing && (

                                        <div className="information-section-header">

                                            <div>

                                                <h3>
                                                    Information Items
                                                </h3>

                                                <p>
                                                    Add multiple items under the selected information type.
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
                                                + Add Another
                                            </button>

                                        </div>
                                    )}

                                    {/* ITEMS */}

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

                                                <div className="insurance-information-form-group">

                                                    <label>
                                                        Content *
                                                    </label>

                                                    <textarea
                                                        rows="4"
                                                        placeholder="Enter insurance information..."
                                                        value={
                                                            item.content
                                                        }
                                                        onChange={(event) =>
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

                                                <div className="insurance-information-form-grid">

                                                    {/* ORDER */}

                                                    <div className="insurance-information-form-group">

                                                        <label>
                                                            Display Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                item.display_order
                                                            }
                                                            onChange={(event) =>
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

                                                    <div className="insurance-information-form-group">

                                                        <label>
                                                            Status
                                                        </label>

                                                        <select
                                                            value={
                                                                item.status
                                                            }
                                                            onChange={(event) =>
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

                                {/* FOOTER */}

                                <div className="insurance-information-modal-footer">

                                    <button
                                        type="button"
                                        className="insurance-information-cancel-btn"
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
                                        className="insurance-information-save-btn"
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

export default InsuranceInformation;