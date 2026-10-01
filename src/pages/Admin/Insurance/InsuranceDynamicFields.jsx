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
    getInsuranceDynamicFieldsCms,
    getInsuranceDynamicFieldById,
    createInsuranceDynamicFields,
    updateInsuranceDynamicField,
    changeInsuranceDynamicFieldStatus,
    deleteInsuranceDynamicField,
    getInsurancePlans,
} from "../../../api/BackendApi";

import "./InsuranceDynamicFields.css";


/* =========================================================
   EMPTY FIELD
========================================================= */

const emptyDynamicField = () => ({
    field_name: "",
    field_label: "",
    field_type: "",
    options: "",
    placeholder: "",
    is_required: false,
    display_order: 0,
    status: "ACTIVE",
});


/* =========================================================
   COMPONENT
========================================================= */

const InsuranceDynamicFields = () => {

    /* =====================================================
       DATA
    ===================================================== */

    const [
        dynamicFields,
        setDynamicFields,
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
        fieldRows,
        setFieldRows,
    ] = useState([
        emptyDynamicField(),
    ]);


    /* =====================================================
       REF
    ===================================================== */

    const modalRef =
        useRef(null);


    /* =====================================================
       FETCH DYNAMIC FIELDS
    ===================================================== */

    const fetchDynamicFields = async (
        page = 1
    ) => {

        try {

            setLoading(true);

            const response =
                await getInsuranceDynamicFieldsCms(
                    page
                );

            console.log(
                "INSURANCE DYNAMIC FIELDS CMS:",
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

                setDynamicFields(
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

                setDynamicFields(
                    result
                );

                setCurrentPage(1);

                setLastPage(1);

            } else {

                setDynamicFields([]);

                setCurrentPage(1);

                setLastPage(1);
            }

        } catch (error) {

            console.error(
                "Failed to fetch insurance dynamic fields:",
                error
            );

            setDynamicFields([]);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Failed to load insurance dynamic fields.",
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

                setInsurancePlans([]);
            }
        };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchDynamicFields(1);

        fetchInsurancePlans();

    }, []);


    /* =====================================================
       RESET
    ===================================================== */

    const resetForm = () => {

        setInsurancePlanId("");

        setFieldRows([
            emptyDynamicField(),
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
       ADD FIELD
    ===================================================== */

    const handleAddFieldRow =
        () => {

            setFieldRows(
                (previous) => [
                    ...previous,
                    emptyDynamicField(),
                ]
            );

            setTimeout(() => {

                if (
                    modalRef.current
                ) {

                    modalRef.current.scrollTo({
                        top:
                            modalRef.current
                                .scrollHeight,

                        behavior:
                            "smooth",
                    });
                }

            }, 100);
        };


    /* =====================================================
       REMOVE FIELD
    ===================================================== */

    const handleRemoveFieldRow = (
        index
    ) => {

        if (
            fieldRows.length === 1
        ) {
            return;
        }

        setFieldRows(
            (previous) =>
                previous.filter(
                    (_, rowIndex) =>
                        rowIndex !== index
                )
        );
    };


    /* =====================================================
       FIELD CHANGE
    ===================================================== */

    const handleFieldChange = (
        index,
        field,
        value
    ) => {

        setFieldRows(
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
       OPTIONS HELPER
    ===================================================== */

    const fieldTypeNeedsOptions = (
        fieldType
    ) => {

        return [
            "SELECT",
            "CHECKBOX",
            "RADIO",
        ].includes(
            fieldType
        );
    };


    /* =====================================================
       FORMAT OPTIONS
    ===================================================== */

    const formatOptions = (
        options
    ) => {

        if (
            !options?.trim()
        ) {
            return [];
        }

        return options
            .split(",")
            .map(
                (option) =>
                    option.trim()
            )
            .filter(Boolean);
    };


    /* =====================================================
       OPTIONS FOR EDIT
    ===================================================== */

    const optionsToString = (
        options
    ) => {

        if (
            Array.isArray(options)
        ) {

            return options.join(", ");
        }

        if (
            typeof options ===
            "string"
        ) {

            return options;
        }

        return "";
    };


    /* =====================================================
       OPEN EDIT
    ===================================================== */

    const handleEdit = async (
        id
    ) => {

        setInsurancePlanId("");

        setFieldRows([
            emptyDynamicField(),
        ]);

        setEditingId(id);

        setIsEditing(true);

        setShowModal(true);

        setEditLoading(true);

        try {

            const response =
                await getInsuranceDynamicFieldById(
                    id
                );

            const field =
                response.data?.data;

            if (!field) {

                setShowModal(false);

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        "Dynamic field not found.",
                });

                return;
            }

            setEditingId(
                field.id
            );

            setInsurancePlanId(
                String(
                    field.insurance_plan_id ||
                    field.insurance_plan?.id ||
                    field.insurancePlan?.id ||
                    ""
                )
            );

            setFieldRows([
                {

                    field_name:
                        field.field_name ||
                        "",

                    field_label:
                        field.field_label ||
                        "",

                    field_type:
                        field.field_type ||
                        "",

                    options:
                        optionsToString(
                            field.options
                        ),

                    placeholder:
                        field.placeholder ||
                        "",

                    is_required:
                        field.is_required ===
                            true ||
                        field.is_required ===
                            1,

                    display_order:
                        field.display_order ??
                        0,

                    status:
                        field.status ||
                        "ACTIVE",
                },
            ]);

        } catch (error) {

            console.error(
                "Failed to fetch insurance dynamic field:",
                error
            );

            setShowModal(false);

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.message ||
                    "Failed to load dynamic field.",
            });

        } finally {

            setEditLoading(false);
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

            for (
                let i = 0;
                i < fieldRows.length;
                i++
            ) {

                const field =
                    fieldRows[i];

                if (
                    !field.field_name.trim()
                ) {

                    Swal.fire({
                        icon:
                            "warning",

                        title:
                            "Field Name Required",

                        text:
                            `Field name is required for field ${
                                i + 1
                            }.`,
                    });

                    return false;
                }

                if (
                    !field.field_label.trim()
                ) {

                    Swal.fire({
                        icon:
                            "warning",

                        title:
                            "Field Label Required",

                        text:
                            `Field label is required for field ${
                                i + 1
                            }.`,
                    });

                    return false;
                }

                if (
                    !field.field_type
                ) {

                    Swal.fire({
                        icon:
                            "warning",

                        title:
                            "Field Type Required",

                        text:
                            `Field type is required for field ${
                                i + 1
                            }.`,
                    });

                    return false;
                }

                if (
                    fieldTypeNeedsOptions(
                        field.field_type
                    ) &&
                    formatOptions(
                        field.options
                    ).length === 0
                ) {

                    Swal.fire({
                        icon:
                            "warning",

                        title:
                            "Options Required",

                        text:
                            `Please enter at least one option for field ${
                                i + 1
                            }.`,
                    });

                    return false;
                }
            }

            return true;
        };


    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave =
        async () => {

            if (
                !validateForm()
            ) {
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

                    const field =
                        fieldRows[0];

                    const payload = {

                        insurance_plan_id:
                            Number(
                                insurancePlanId
                            ),

                        field_name:
                            field.field_name.trim(),

                        field_label:
                            field.field_label.trim(),

                        field_type:
                            field.field_type,

                        options:
                            fieldTypeNeedsOptions(
                                field.field_type
                            )
                                ? formatOptions(
                                    field.options
                                )
                                : [],

                        placeholder:
                            field.placeholder?.trim() ||
                            null,

                        is_required:
                            field.is_required,

                        display_order:
                            Number(
                                field.display_order
                            ) || 0,

                        status:
                            field.status ||
                            "ACTIVE",
                    };

                    const response =
                        await updateInsuranceDynamicField(
                            editingId,
                            payload
                        );

                    setShowModal(false);

                    resetForm();

                    Swal.fire({
                        icon:
                            "success",

                        title:
                            "Dynamic Field Updated",

                        text:
                            response?.data?.message ||
                            "Insurance dynamic field updated successfully.",

                        timer:
                            1800,

                        showConfirmButton:
                            false,
                    });

                    fetchDynamicFields(
                        currentPage
                    ).catch(
                        (error) => {

                            console.error(
                                "Failed to refresh insurance dynamic fields:",
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

                    dynamic_fields:
                        fieldRows.map(
                            (field) => ({

                                field_name:
                                    field.field_name.trim(),

                                field_label:
                                    field.field_label.trim(),

                                field_type:
                                    field.field_type,

                                options:
                                    fieldTypeNeedsOptions(
                                        field.field_type
                                    )
                                        ? formatOptions(
                                            field.options
                                        )
                                        : [],

                                placeholder:
                                    field.placeholder?.trim() ||
                                    null,

                                is_required:
                                    field.is_required,

                                display_order:
                                    Number(
                                        field.display_order
                                    ) || 0,

                                status:
                                    field.status ||
                                    "ACTIVE",
                            })
                        ),
                };

                const response =
                    await createInsuranceDynamicFields(
                        payload
                    );

                setShowModal(false);

                resetForm();

                Swal.fire({
                    icon:
                        "success",

                    title:
                        "Dynamic Fields Created",

                    text:
                        response?.data?.message ||
                        "Insurance dynamic fields created successfully.",

                    timer:
                        1800,

                    showConfirmButton:
                        false,
                });

                fetchDynamicFields(
                    currentPage
                ).catch(
                    (error) => {

                        console.error(
                            "Failed to refresh insurance dynamic fields:",
                            error
                        );
                    }
                );

            } catch (error) {

                console.error(
                    "Failed to save insurance dynamic field:",
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
                                    ? "Failed to update insurance dynamic field."
                                    : "Failed to create insurance dynamic fields."
                            ),
                    });
                }

            } finally {

                setSaving(false);
            }
        };


    /* =====================================================
       STATUS
       ID ONLY
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
                            ? "Are you sure you want to activate this dynamic field?"
                            : "Are you sure you want to deactivate this dynamic field?",

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

                const response =
                    await changeInsuranceDynamicFieldStatus(
                        id
                    );

                const returnedStatus =
                    response?.data
                        ?.data?.status ||
                    newStatus;

                setDynamicFields(
                    (previous) =>
                        previous.map(
                            (field) =>
                                field.id ===
                                    id
                                    ? {
                                        ...field,

                                        status:
                                            returnedStatus,
                                    }
                                    : field
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
                        `Dynamic field status changed to ${returnedStatus}.`,

                    timer:
                        1800,

                    showConfirmButton:
                        false,
                });

            } catch (error) {

                console.error(
                    "Failed to change dynamic field status:",
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
                        "Failed to change dynamic field status.",
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
                        "Delete Dynamic Field?",

                    text:
                        "Are you sure you want to delete this insurance dynamic field?",

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

                await deleteInsuranceDynamicField(
                    id
                );

                Swal.fire({
                    icon:
                        "success",

                    title:
                        "Deleted",

                    text:
                        "Insurance dynamic field deleted successfully.",

                    timer:
                        1800,

                    showConfirmButton:
                        false,
                });

                if (
                    dynamicFields.length ===
                        1 &&
                    currentPage > 1
                ) {

                    fetchDynamicFields(
                        currentPage - 1
                    ).catch(
                        (error) => {

                            console.error(
                                "Failed to refresh dynamic fields:",
                                error
                            );
                        }
                    );

                } else {

                    fetchDynamicFields(
                        currentPage
                    ).catch(
                        (error) => {

                            console.error(
                                "Failed to refresh dynamic fields:",
                                error
                            );
                        }
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to delete insurance dynamic field:",
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
                        "Failed to delete insurance dynamic field.",
                });
            }
        };


    /* =====================================================
       PAGE
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

        fetchDynamicFields(
            page
        );
    };


    /* =====================================================
       PLAN NAME
    ===================================================== */

    const getPlanName = (
        field
    ) => {

        return (
            field?.insurance_plan?.name ||
            field?.insurancePlan?.name ||
            insurancePlans.find(
                (plan) =>
                    String(
                        plan.id
                    ) ===
                    String(
                        field.insurance_plan_id
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

                    <div className="insurance-dynamic-header">

                        <div>

                            <h1>
                                Insurance Dynamic Fields
                            </h1>

                            <p>
                                Manage dynamic application fields for each insurance plan.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="insurance-dynamic-add-btn"
                            onClick={
                                handleOpenCreate
                            }
                        >
                            + Add Dynamic Fields
                        </button>

                    </div>


                    {/* TABLE */}

                    <div className="insurance-dynamic-table-card">

                        <div className="insurance-dynamic-table-wrapper">

                            <table className="insurance-dynamic-table">

                                <thead>

                                    <tr>

                                        <th>#</th>

                                        <th>
                                            Insurance Plan
                                        </th>

                                        <th>
                                            Field Name
                                        </th>

                                        <th>
                                            Label
                                        </th>

                                        <th>
                                            Type
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
                                                colSpan="9"
                                                className="insurance-dynamic-empty"
                                            >
                                                Loading dynamic fields...
                                            </td>

                                        </tr>

                                    ) : dynamicFields.length ===
                                        0 ? (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className="insurance-dynamic-empty"
                                            >
                                                No insurance dynamic fields found.
                                            </td>

                                        </tr>

                                    ) : (

                                        dynamicFields.map(
                                            (
                                                field,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        field.id
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

                                                        {getPlanName(
                                                            field
                                                        )}

                                                    </td>

                                                    <td>

                                                        <span className="insurance-field-name">

                                                            {
                                                                field.field_name
                                                            }

                                                        </span>

                                                    </td>

                                                    <td>

                                                        {field.field_label ||
                                                            "-"}

                                                    </td>

                                                    <td>

                                                        <span className="insurance-field-type">

                                                            {field.field_type ||
                                                                "-"}

                                                        </span>

                                                    </td>

                                                    <td>

                                                        {field.is_required ===
                                                            true ||
                                                            field.is_required ===
                                                                1 ? (

                                                            <span className="dynamic-required-badge">
                                                                Required
                                                            </span>

                                                        ) : (

                                                            <span className="dynamic-optional-badge">
                                                                Optional
                                                            </span>
                                                        )}

                                                    </td>

                                                    <td>

                                                        {field.display_order ??
                                                            0}

                                                    </td>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className={`insurance-dynamic-status-btn ${
                                                                field.status ===
                                                                    "ACTIVE"
                                                                    ? "active"
                                                                    : "inactive"
                                                            }`}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    field.id,
                                                                    field.status
                                                                )
                                                            }
                                                            disabled={
                                                                updatingStatusId !==
                                                                null
                                                            }
                                                        >

                                                            {updatingStatusId ===
                                                                field.id
                                                                ? "Updating..."
                                                                : field.status}

                                                        </button>

                                                    </td>

                                                    <td>

                                                        <div className="insurance-dynamic-actions">

                                                            <button
                                                                type="button"
                                                                className="insurance-dynamic-edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        field.id
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="insurance-dynamic-delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        field.id
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

                                <div className="insurance-dynamic-pagination">

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
                    className="insurance-dynamic-modal-overlay"
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
                        className={`insurance-dynamic-modal ${
                            !isEditing
                                ? "insurance-dynamic-modal-large"
                                : ""
                        }`}
                    >

                        {/* HEADER */}

                        <div className="insurance-dynamic-modal-header">

                            <div>

                                <h2>

                                    {isEditing
                                        ? "Edit Dynamic Field"
                                        : "Add Dynamic Fields"}

                                </h2>

                                <p>

                                    {isEditing
                                        ? "Update this insurance dynamic field."
                                        : "Add one or more dynamic fields to an insurance plan."}

                                </p>

                            </div>

                            <button
                                type="button"
                                className="insurance-dynamic-modal-close"
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


                        {/* LOADING */}

                        {isEditing &&
                            editLoading ? (

                            <div className="insurance-dynamic-edit-loading">

                                <div className="insurance-dynamic-loader"></div>

                                <p>
                                    Loading dynamic field...
                                </p>

                            </div>

                        ) : (

                            <>

                                <div className="insurance-dynamic-modal-body">

                                    {/* PLAN */}

                                    <div className="insurance-dynamic-form-group">

                                        <label>
                                            Insurance Plan *
                                        </label>

                                        <select
                                            value={
                                                insurancePlanId
                                            }
                                            onChange={(event) =>
                                                setInsurancePlanId(
                                                    event.target.value
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


                                    {/* HEADER */}

                                    {!isEditing && (

                                        <div className="dynamic-field-section-header">

                                            <div>

                                                <h3>
                                                    Dynamic Fields
                                                </h3>

                                                <p>
                                                    Add application fields for the selected insurance plan.
                                                </p>

                                            </div>

                                            <button
                                                type="button"
                                                className="add-dynamic-field-btn"
                                                onClick={
                                                    handleAddFieldRow
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >
                                                + Add Another
                                            </button>

                                        </div>
                                    )}


                                    {/* ROWS */}

                                    {fieldRows.map(
                                        (
                                            field,
                                            index
                                        ) => (

                                            <div
                                                className="dynamic-field-form-card"
                                                key={
                                                    index
                                                }
                                            >

                                                {!isEditing && (

                                                    <div className="dynamic-field-form-card-header">

                                                        <strong>

                                                            Field{" "}
                                                            {index +
                                                                1}

                                                        </strong>

                                                        {fieldRows.length >
                                                            1 && (

                                                            <button
                                                                type="button"
                                                                className="remove-dynamic-field-btn"
                                                                onClick={() =>
                                                                    handleRemoveFieldRow(
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


                                                <div className="insurance-dynamic-form-grid">

                                                    {/* FIELD NAME */}

                                                    <div className="insurance-dynamic-form-group">

                                                        <label>
                                                            Field Name *
                                                        </label>

                                                        <input
                                                            type="text"
                                                            placeholder="e.g. passport_issue_date"
                                                            value={
                                                                field.field_name
                                                            }
                                                            onChange={(event) =>
                                                                handleFieldChange(
                                                                    index,
                                                                    "field_name",
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />

                                                    </div>


                                                    {/* FIELD LABEL */}

                                                    <div className="insurance-dynamic-form-group">

                                                        <label>
                                                            Field Label *
                                                        </label>

                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Passport Issue Date"
                                                            value={
                                                                field.field_label
                                                            }
                                                            onChange={(event) =>
                                                                handleFieldChange(
                                                                    index,
                                                                    "field_label",
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />

                                                    </div>


                                                    {/* FIELD TYPE */}

                                                    <div className="insurance-dynamic-form-group">

                                                        <label>
                                                            Field Type *
                                                        </label>

                                                        <select
                                                            value={
                                                                field.field_type
                                                            }
                                                            onChange={(event) =>
                                                                handleFieldChange(
                                                                    index,
                                                                    "field_type",
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        >

                                                            <option value="">
                                                                Select Field Type
                                                            </option>

                                                            <option value="TEXT">
                                                                Text
                                                            </option>

                                                            <option value="NUMBER">
                                                                Number
                                                            </option>

                                                            <option value="DATE">
                                                                Date
                                                            </option>

                                                            <option value="TEXTAREA">
                                                                Textarea
                                                            </option>

                                                            <option value="SELECT">
                                                                Select
                                                            </option>

                                                            <option value="CHECKBOX">
                                                                Checkbox
                                                            </option>

                                                            <option value="RADIO">
                                                                Radio
                                                            </option>

                                                        </select>

                                                    </div>


                                                    {/* PLACEHOLDER */}

                                                    <div className="insurance-dynamic-form-group">

                                                        <label>
                                                            Placeholder
                                                        </label>

                                                        <input
                                                            type="text"
                                                            placeholder="Enter placeholder"
                                                            value={
                                                                field.placeholder
                                                            }
                                                            onChange={(event) =>
                                                                handleFieldChange(
                                                                    index,
                                                                    "placeholder",
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />

                                                    </div>

                                                </div>


                                                {/* OPTIONS */}

                                                {fieldTypeNeedsOptions(
                                                    field.field_type
                                                ) && (

                                                    <div className="insurance-dynamic-form-group">

                                                        <label>
                                                            Options *
                                                        </label>

                                                        <textarea
                                                            rows="3"
                                                            placeholder="Enter options separated by commas, e.g. Yes, No, Maybe"
                                                            value={
                                                                field.options
                                                            }
                                                            onChange={(event) =>
                                                                handleFieldChange(
                                                                    index,
                                                                    "options",
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />

                                                        <span className="insurance-dynamic-help">
                                                            Separate multiple options with commas.
                                                        </span>

                                                    </div>
                                                )}


                                                <div className="insurance-dynamic-form-grid">

                                                    {/* ORDER */}

                                                    <div className="insurance-dynamic-form-group">

                                                        <label>
                                                            Display Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                field.display_order
                                                            }
                                                            onChange={(event) =>
                                                                handleFieldChange(
                                                                    index,
                                                                    "display_order",
                                                                    event.target.value
                                                                )
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                        />

                                                    </div>


                                                    {/* STATUS */}

                                                    <div className="insurance-dynamic-form-group">

                                                        <label>
                                                            Status
                                                        </label>

                                                        <select
                                                            value={
                                                                field.status
                                                            }
                                                            onChange={(event) =>
                                                                handleFieldChange(
                                                                    index,
                                                                    "status",
                                                                    event.target.value
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


                                                {/* REQUIRED */}

                                                <label className="insurance-dynamic-checkbox-row">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            field.is_required
                                                        }
                                                        onChange={(event) =>
                                                            handleFieldChange(
                                                                index,
                                                                "is_required",
                                                                event.target.checked
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    />

                                                    Required Field

                                                </label>

                                            </div>
                                        )
                                    )}

                                </div>


                                {/* FOOTER */}

                                <div className="insurance-dynamic-modal-footer">

                                    <button
                                        type="button"
                                        className="insurance-dynamic-cancel-btn"
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
                                        className="insurance-dynamic-save-btn"
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
                                                ? "Update Field"
                                                : "Save Fields"}

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


export default InsuranceDynamicFields;