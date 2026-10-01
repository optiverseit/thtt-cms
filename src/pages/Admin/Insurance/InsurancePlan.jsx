import { useEffect, useState } from "react";
import {
    FaPen,
    FaTrash,
    FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllInsurancePlansCms,
    createInsurancePlan,
    updateInsurancePlan,
    changeInsurancePlanStatus,
    deleteInsurancePlan,
} from "../../../api/BackendApi";

import "./InsurancePlan.css";

/* =========================================================
   EMPTY FORM
========================================================= */

const createEmptyForm = () => ({
    name: "",
    short_description: "",
    description: "",
    processing_time: "",
    status: "ACTIVE",
    display_order: 0,
    image: null,
    imagePreview: null,
    existingImage: null,
});

/* =========================================================
   COMPONENT
========================================================= */

const InsurancePlan = () => {

    /* =====================================================
       DATA
    ===================================================== */

    const [plans, setPlans] = useState([]);

    /* =====================================================
       FORM
    ===================================================== */

    const [form, setForm] = useState(
        createEmptyForm()
    );

    /* =====================================================
       EDIT
    ===================================================== */

    const [editingId, setEditingId] =
        useState(null);

    /* =====================================================
       LOADING
    ===================================================== */

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [changingStatusId, setChangingStatusId] =
        useState(null);

    /* =====================================================
       PAGINATION
    ===================================================== */

    const [page, setPage] =
        useState(1);

    const [totalPages, setTotalPages] =
        useState(1);

    const [totalPlans, setTotalPlans] =
        useState(0);

    /* =====================================================
       FETCH
    ===================================================== */

    useEffect(() => {

        fetchPlans();

    }, [page]);

    const fetchPlans = async () => {

        try {

            setLoading(true);

            const response =
                await getAllInsurancePlansCms(page);

            console.log(
                "INSURANCE PLAN CMS RESPONSE:",
                response.data
            );

            if (response.data?.status) {

                const responseData =
                    response.data.data;

                /*
                 * PAGINATED
                 */
                if (
                    responseData &&
                    Array.isArray(responseData.data)
                ) {

                    setPlans(
                        responseData.data
                    );

                    setTotalPages(
                        responseData.last_page || 1
                    );

                    setTotalPlans(
                        responseData.total || 0
                    );

                } else {

                    /*
                     * NON-PAGINATED FALLBACK
                     */

                    const planData =
                        Array.isArray(responseData)
                            ? responseData
                            : [];

                    setPlans(planData);

                    setTotalPages(1);

                    setTotalPlans(
                        planData.length
                    );
                }

            } else {

                throw new Error(
                    response.data?.message ||
                    "Unable to load insurance plans."
                );
            }

        } catch (error) {

            console.error(
                "Insurance plans fetch error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to load insurance plans.",
                confirmButtonColor: "#351255",
            });

        } finally {

            setLoading(false);
        }
    };

    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleChange = (
        field,
        value
    ) => {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /* =====================================================
       IMAGE CHANGE
    ===================================================== */

    const handleImageChange = (
        event
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            Swal.fire({
                icon: "warning",
                title: "Invalid Image",
                text:
                    "Only JPG, JPEG, PNG and WEBP images are allowed.",
                confirmButtonColor:
                    "#351255",
            });

            event.target.value = "";

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            Swal.fire({
                icon: "warning",
                title: "Image Too Large",
                text:
                    "Image must not exceed 5 MB.",
                confirmButtonColor:
                    "#351255",
            });

            event.target.value = "";

            return;
        }

        /*
         * Revoke old local preview if needed.
         */

        if (
            form.imagePreview &&
            form.imagePreview.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                form.imagePreview
            );
        }

        setForm((previous) => ({
            ...previous,

            image: file,

            imagePreview:
                URL.createObjectURL(
                    file
                ),
        }));
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {

        if (
            form.imagePreview &&
            form.imagePreview.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                form.imagePreview
            );
        }

        setForm(
            createEmptyForm()
        );

        setEditingId(null);
    };

    /* =====================================================
       CREATE
    ===================================================== */

    const handleCreate = async (
        event
    ) => {

        event.preventDefault();

        if (!form.name.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Plan Name Required",
                text:
                    "Please enter the insurance plan name.",
                confirmButtonColor:
                    "#351255",
            });

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "name",
            form.name.trim()
        );

        formData.append(
            "short_description",
            form.short_description || ""
        );

        formData.append(
            "description",
            form.description || ""
        );

        formData.append(
            "processing_time",
            form.processing_time || ""
        );

        formData.append(
            "status",
            form.status || "ACTIVE"
        );

        formData.append(
            "display_order",
            form.display_order === ""
                ? 0
                : Number(
                    form.display_order
                )
        );

        if (form.image) {

            /*
             * Use the field expected by the
             * InsurancePlan controller.
             *
             * If your controller validation uses
             * "insurance_image" instead of "image",
             * change this key.
             */

            formData.append(
                "insurance_image",
                form.image
            );
        }

        try {

            setSaving(true);

            const response =
                await createInsurancePlan(
                    formData
                );

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title:
                        "Insurance Plan Added",
                    text:
                        response.data?.message ||
                        "Insurance plan created successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                resetForm();

                if (page !== 1) {

                    setPage(1);

                } else {

                    fetchPlans();
                }
            }

        } catch (error) {

            console.error(
                "Insurance plan create error:",
                error
            );

            showValidationError(
                error,
                "Unable to create insurance plan."
            );

        } finally {

            setSaving(false);
        }
    };

    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (
        plan
    ) => {

        setEditingId(
            plan.id
        );

        setForm({

            name:
                plan.name || "",

            short_description:
                plan.short_description || "",

            description:
                plan.description || "",

            processing_time:
                plan.processing_time || "",

            status:
                plan.status || "ACTIVE",

            display_order:
                plan.display_order ?? 0,

            image: null,

            existingImage:
                plan.insurance_image ||
                null,

            imagePreview:
                plan.insurance_image ||
                null,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /* =====================================================
       UPDATE
    ===================================================== */

    const handleUpdate = async (
        event
    ) => {

        event.preventDefault();

        if (!form.name.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Plan Name Required",
                text:
                    "Please enter the insurance plan name.",
                confirmButtonColor:
                    "#351255",
            });

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "name",
            form.name.trim()
        );

        formData.append(
            "short_description",
            form.short_description || ""
        );

        formData.append(
            "description",
            form.description || ""
        );

        formData.append(
            "processing_time",
            form.processing_time || ""
        );

        formData.append(
            "status",
            form.status || "ACTIVE"
        );

        formData.append(
            "display_order",
            form.display_order === ""
                ? 0
                : Number(
                    form.display_order
                )
        );

        if (form.image) {

            formData.append(
                "insurance_image",
                form.image
            );
        }

        try {

            setSaving(true);

            const response =
                await updateInsurancePlan(
                    editingId,
                    formData
                );

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title:
                        "Insurance Plan Updated",
                    text:
                        response.data?.message ||
                        "Insurance plan updated successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                resetForm();

                fetchPlans();
            }

        } catch (error) {

            console.error(
                "Insurance plan update error:",
                error
            );

            showValidationError(
                error,
                "Unable to update insurance plan."
            );

        } finally {

            setSaving(false);
        }
    };

    /* =====================================================
       STATUS
    ===================================================== */

    const handleStatusChange = async (plan) => {

        const newStatus =
            plan.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result =
            await Swal.fire({

                icon: "question",

                title:
                    newStatus === "ACTIVE"
                        ? "Activate Insurance Plan?"
                        : "Deactivate Insurance Plan?",

                text:
                    newStatus === "ACTIVE"
                        ? "This insurance plan will become active."
                        : "This insurance plan will become inactive.",

                showCancelButton: true,

                confirmButtonText:
                    newStatus === "ACTIVE"
                        ? "Activate"
                        : "Deactivate",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#351255",
            });

        if (!result.isConfirmed) {
            return;
        }

        try {

            setChangingStatusId(
                plan.id
            );

            const response =
                await changeInsurancePlanStatus(
                    plan.id
                );

            if (response.data?.status) {

                setPlans((previous) =>
                    previous.map((item) =>
                        item.id === plan.id
                            ? {
                                ...item,

                                status:
                                    response.data
                                        ?.data
                                        ?.status ||
                                    newStatus,
                            }
                            : item
                    )
                );

                Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        "Insurance plan status updated successfully.",
                    confirmButtonColor:
                        "#351255",
                });
            }

        } catch (error) {

            console.error(
                "Insurance plan status error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change insurance plan status.",
                confirmButtonColor:
                    "#351255",
            });

        } finally {

            setChangingStatusId(
                null
            );
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (
        id
    ) => {

        const result =
            await Swal.fire({

                icon: "warning",

                title:
                    "Delete Insurance Plan?",

                text:
                    "This insurance plan will be permanently deleted.",

                showCancelButton: true,

                confirmButtonText:
                    "Delete",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#f52d91",

                cancelButtonColor:
                    "#77717d",
            });

        if (!result.isConfirmed) {
            return;
        }

        try {

            const response =
                await deleteInsurancePlan(
                    id
                );

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Insurance plan deleted successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                if (
                    editingId === id
                ) {
                    resetForm();
                }

                /*
                 * Last row on current page.
                 */

                if (
                    plans.length === 1 &&
                    page > 1
                ) {

                    setPage(
                        (previous) =>
                            previous - 1
                    );

                } else {

                    fetchPlans();
                }
            }

        } catch (error) {

            console.error(
                "Insurance plan delete error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete insurance plan.",
                confirmButtonColor:
                    "#351255",
            });
        }
    };

    /* =====================================================
       VALIDATION ERROR
    ===================================================== */

    const showValidationError = (
        error,
        fallback
    ) => {

        let errorMessage =
            error.response?.data?.message ||
            fallback;

        const validationErrors =
            error.response?.data?.errors;

        if (validationErrors) {

            const firstError =
                Object.values(
                    validationErrors
                )[0];

            if (
                Array.isArray(
                    firstError
                )
            ) {
                errorMessage =
                    firstError[0];
            }
        }

        Swal.fire({
            icon: "error",
            title: "Failed",
            text: errorMessage,
            confirmButtonColor:
                "#351255",
        });
    };

    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = (
        event
    ) => {

        if (editingId) {

            handleUpdate(event);

        } else {

            handleCreate(event);
        }
    };

    /* =====================================================
       JSX
    ===================================================== */

    return (

        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">

                    <div className="insurance-plan-page">

                        {/* ============================
                            PAGE HEADER
                        ============================ */}

                        <div className="insurance-plan-header">

                            <div>

                                <h1>
                                    Insurance Plans
                                </h1>

                                <p>
                                    Manage insurance plans available to users.
                                </p>

                            </div>

                        </div>

                        {/* ============================
                            CREATE / EDIT
                        ============================ */}

                        <div className="insurance-plan-form-card">

                            <div className="insurance-plan-card-header">

                                <h2>

                                    {editingId
                                        ? "Edit Insurance Plan"
                                        : "Add Insurance Plan"}

                                </h2>

                                <p>

                                    {editingId
                                        ? "Update the selected insurance plan."
                                        : "Create a new insurance plan."}

                                </p>

                            </div>

                            <form
                                className="insurance-plan-form"
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div className="insurance-plan-form-grid">

                                    {/* NAME */}

                                    <div className="insurance-plan-form-group">

                                        <label>

                                            Plan Name

                                            <span className="required">
                                                *
                                            </span>

                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.name
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. Travel Medical Insurance"
                                            disabled={
                                                saving
                                            }
                                            required
                                        />

                                    </div>

                                    {/* PROCESSING */}

                                    <div className="insurance-plan-form-group">

                                        <label>
                                            Processing Time
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.processing_time
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "processing_time",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="e.g. 1-2 working days"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                    {/* STATUS */}

                                    <div className="insurance-plan-form-group">

                                        <label>
                                            Status
                                        </label>

                                        <select
                                            value={
                                                form.status
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "status",
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            <option value="ACTIVE">
                                                Active
                                            </option>

                                            <option value="INACTIVE">
                                                Inactive
                                            </option>

                                        </select>

                                    </div>

                                    {/* DISPLAY ORDER */}

                                    <div className="insurance-plan-form-group">

                                        <label>
                                            Display Order
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                form.display_order
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "display_order",
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                    {/* IMAGE */}

                                    <div className="insurance-plan-form-group insurance-plan-full-width">

                                        <label>
                                            Insurance Image
                                        </label>

                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp"
                                            onChange={
                                                handleImageChange
                                            }
                                            disabled={
                                                saving
                                            }
                                        />

                                        <span className="insurance-plan-file-help">
                                            JPG, JPEG, PNG or WEBP. Maximum 5 MB.
                                        </span>

                                    </div>

                                    {/* SHORT DESCRIPTION */}

                                    <div className="insurance-plan-form-group insurance-plan-full-width">

                                        <label>
                                            Short Description
                                        </label>

                                        <textarea
                                            rows="3"
                                            maxLength="500"
                                            value={
                                                form.short_description
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "short_description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Short description about this insurance plan"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                    {/* DESCRIPTION */}

                                    <div className="insurance-plan-form-group insurance-plan-full-width">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            rows="5"
                                            value={
                                                form.description
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Detailed description about this insurance plan"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                </div>

                                {/* IMAGE PREVIEW */}

                                {form.imagePreview && (

                                    <div className="insurance-plan-image-preview">

                                        <span>
                                            Image Preview
                                        </span>

                                        <img
                                            src={
                                                form.imagePreview
                                            }
                                            alt={
                                                form.name ||
                                                "Insurance plan"
                                            }
                                        />

                                    </div>
                                )}

                                {/* ACTIONS */}

                                <div className="insurance-plan-form-actions">

                                    {editingId && (

                                        <button
                                            type="button"
                                            className="insurance-plan-cancel-btn"
                                            onClick={
                                                resetForm
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            <FaTimes />

                                            Cancel

                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="insurance-plan-submit-btn"
                                        disabled={
                                            saving
                                        }
                                    >

                                        {saving
                                            ? editingId
                                                ? "Updating..."
                                                : "Saving..."
                                            : editingId
                                                ? "Update Plan"
                                                : "Save Plan"}

                                    </button>

                                </div>

                            </form>

                        </div>

                        {/* ============================
                            TABLE
                        ============================ */}

                        <div className="insurance-plan-table-card">

                            <div className="insurance-plan-table-header">

                                <div>

                                    <h2>
                                        Insurance Plan List
                                    </h2>

                                    <p>

                                        {totalPlans}{" "}

                                        {totalPlans === 1
                                            ? "plan"
                                            : "plans"}

                                    </p>

                                </div>

                            </div>

                            <div className="insurance-plan-table-responsive">

                                <table className="insurance-plan-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                S.N.
                                            </th>

                                            <th>
                                                Image
                                            </th>

                                            <th>
                                                Plan
                                            </th>

                                            <th>
                                                Processing Time
                                            </th>

                                            <th>
                                                Display Order
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
                                                    className="insurance-plan-table-message"
                                                >

                                                    <div className="insurance-plan-loader"></div>

                                                    Loading insurance plans...

                                                </td>

                                            </tr>

                                        ) : plans.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="insurance-plan-table-message"
                                                >
                                                    No insurance plans found.
                                                </td>

                                            </tr>

                                        ) : (

                                            plans.map(
                                                (
                                                    plan,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            plan.id
                                                        }
                                                    >

                                                        {/* SN */}

                                                        <td>

                                                            {(page - 1) *
                                                                10 +
                                                                index +
                                                                1}

                                                        </td>

                                                        {/* IMAGE */}

                                                        <td>

                                                            {plan.insurance_image ? (

                                                                <img
                                                                    className="insurance-plan-table-image"
                                                                    src={
                                                                        plan.insurance_image
                                                                    }
                                                                    alt={
                                                                        plan.name
                                                                    }
                                                                />

                                                            ) : (

                                                                <div className="insurance-plan-no-image">
                                                                    No Image
                                                                </div>
                                                            )}

                                                        </td>

                                                        {/* PLAN */}

                                                        <td>

                                                            <div className="insurance-plan-name-cell">

                                                                <strong>
                                                                    {plan.name}
                                                                </strong>

                                                                {plan.short_description && (

                                                                    <span>
                                                                        {plan.short_description}
                                                                    </span>
                                                                )}

                                                            </div>

                                                        </td>

                                                        {/* PROCESSING */}

                                                        <td>

                                                            {plan.processing_time ||
                                                                "-"}

                                                        </td>

                                                        {/* ORDER */}

                                                        <td>

                                                            {plan.display_order ??
                                                                0}

                                                        </td>

                                                        {/* STATUS */}

                                                        <td>

                                                            <button
                                                                type="button"
                                                                className={`insurance-plan-status ${plan.status ===
                                                                        "ACTIVE"
                                                                        ? "active"
                                                                        : "inactive"
                                                                    }`}
                                                                disabled={
                                                                    changingStatusId ===
                                                                    plan.id
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        plan
                                                                    )
                                                                }
                                                            >

                                                                {changingStatusId ===
                                                                    plan.id
                                                                    ? "Updating..."
                                                                    : plan.status}

                                                            </button>

                                                        </td>

                                                        {/* ACTIONS */}

                                                        <td>

                                                            <div className="insurance-plan-actions">

                                                                <button
                                                                    type="button"
                                                                    className="insurance-plan-edit-btn"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            plan
                                                                        )
                                                                    }
                                                                    title="Edit"
                                                                >

                                                                    <FaPen />

                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="insurance-plan-delete-btn"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            plan.id
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

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
};

export default InsurancePlan;