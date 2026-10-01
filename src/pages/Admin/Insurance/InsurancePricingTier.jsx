import { useEffect, useState } from "react";

import {
    FaPlus,
    FaPen,
    FaTrash,
    FaTimes,
} from "react-icons/fa";

import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllInsurancePricingTiersCms,
    getInsurancePlans,
    createInsurancePricingTiers,
    updateInsurancePricingTier,
    changeInsurancePricingTierStatus,
    deleteInsurancePricingTier,
} from "../../../api/BackendApi";

import "./InsurancePricingTier.css";


/* =========================================================
   EMPTY PRICING TIER
========================================================= */

const createEmptyPricingTier = (order = 0) => ({
    title: "",
    duration_days: "",
    price_npr: "",
    status: "ACTIVE",
    display_order: order,
});


/* =========================================================
   COMPONENT
========================================================= */

const InsurancePricingTier = () => {

    /* =====================================================
       DATA
    ===================================================== */

    const [
        pricingTiers,
        setPricingTiers,
    ] = useState([]);

    const [
        insurancePlans,
        setInsurancePlans,
    ] = useState([]);


    /* =====================================================
       CREATE
    ===================================================== */

    const [
        insurancePlanId,
        setInsurancePlanId,
    ] = useState("");

    const [
        pricingTierItems,
        setPricingTierItems,
    ] = useState([
        createEmptyPricingTier(0),
    ]);


    /* =====================================================
       EDIT
    ===================================================== */

    const [
        editingId,
        setEditingId,
    ] = useState(null);

    const [
        editInsurancePlanId,
        setEditInsurancePlanId,
    ] = useState("");

    const [
        editForm,
        setEditForm,
    ] = useState({
        title: "",
        duration_days: "",
        price_npr: "",
        status: "ACTIVE",
        display_order: 0,
    });


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
        changingStatusId,
        setChangingStatusId,
    ] = useState(null);


    /* =====================================================
       PAGINATION
    ===================================================== */

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        totalPages,
        setTotalPages,
    ] = useState(1);

    const [
        totalPricingTiers,
        setTotalPricingTiers,
    ] = useState(0);


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchInsurancePlans();

    }, []);


    useEffect(() => {

        fetchPricingTiers();

    }, [page]);


    /* =====================================================
       FETCH INSURANCE PLANS
    ===================================================== */

    const fetchInsurancePlans =
        async () => {

            try {

                const response =
                    await getInsurancePlans();

                console.log(
                    "INSURANCE PLANS RESPONSE:",
                    response.data
                );

                if (
                    response.data?.status
                ) {

                    const planData =
                        Array.isArray(
                            response.data.data
                        )
                            ? response.data.data
                            : response.data.data
                                  ?.data || [];

                    setInsurancePlans(
                        planData
                    );
                }

            } catch (error) {

                console.error(
                    "Error fetching insurance plans:",
                    error
                );

                Swal.fire({
                    icon: "error",
                    title: "Failed",

                    text:
                        error.response?.data
                            ?.message ||
                        "Unable to load insurance plans.",

                    confirmButtonColor:
                        "#351255",
                });
            }
        };


    /* =====================================================
       FETCH CMS PRICING TIERS
    ===================================================== */

    const fetchPricingTiers =
        async () => {

            try {

                setLoading(true);

                const response =
                    await getAllInsurancePricingTiersCms(
                        page
                    );

                console.log(
                    "INSURANCE PRICING TIERS CMS RESPONSE:",
                    response.data
                );

                if (
                    response.data?.status
                ) {

                    const responseData =
                        response.data.data;

                    /*
                     * PAGINATED
                     */
                    if (
                        responseData &&
                        Array.isArray(
                            responseData.data
                        )
                    ) {

                        setPricingTiers(
                            responseData.data
                        );

                        setTotalPages(
                            responseData
                                .last_page || 1
                        );

                        setTotalPricingTiers(
                            responseData.total ||
                                0
                        );

                    } else {

                        /*
                         * NON-PAGINATED
                         */

                        const tierData =
                            Array.isArray(
                                responseData
                            )
                                ? responseData
                                : [];

                        setPricingTiers(
                            tierData
                        );

                        setTotalPages(1);

                        setTotalPricingTiers(
                            tierData.length
                        );
                    }
                }

            } catch (error) {

                console.error(
                    "Error fetching insurance pricing tiers:",
                    error
                );

                Swal.fire({
                    icon: "error",
                    title: "Failed",

                    text:
                        error.response?.data
                            ?.message ||
                        "Unable to load insurance pricing tiers.",

                    confirmButtonColor:
                        "#351255",
                });

            } finally {

                setLoading(false);
            }
        };


    /* =====================================================
       ADD CREATE ROW
    ===================================================== */

    const addPricingTierRow =
        () => {

            setPricingTierItems(
                (previous) => [
                    ...previous,

                    createEmptyPricingTier(
                        previous.length
                    ),
                ]
            );
        };


    /* =====================================================
       REMOVE CREATE ROW
    ===================================================== */

    const removePricingTierRow = (
        index
    ) => {

        if (
            pricingTierItems.length ===
            1
        ) {
            return;
        }

        const updatedItems =
            pricingTierItems
                .filter(
                    (_, i) =>
                        i !== index
                )
                .map(
                    (tier, i) => ({
                        ...tier,

                        display_order:
                            i,
                    })
                );

        setPricingTierItems(
            updatedItems
        );
    };


    /* =====================================================
       CREATE FIELD CHANGE
    ===================================================== */

    const handlePricingTierChange = (
        index,
        field,
        value
    ) => {

        const updatedItems = [
            ...pricingTierItems,
        ];

        updatedItems[index] = {
            ...updatedItems[index],

            [field]: value,
        };

        setPricingTierItems(
            updatedItems
        );
    };


    /* =====================================================
       RESET CREATE
    ===================================================== */

    const resetCreateForm =
        () => {

            setInsurancePlanId("");

            setPricingTierItems([
                createEmptyPricingTier(
                    0
                ),
            ]);
        };


    /* =====================================================
       CREATE
    ===================================================== */

    const handleCreate =
        async (e) => {

            e.preventDefault();


            /* ---------------- PLAN ---------------- */

            if (!insurancePlanId) {

                Swal.fire({
                    icon: "warning",

                    title:
                        "Insurance Plan Required",

                    text:
                        "Please select an insurance plan.",

                    confirmButtonColor:
                        "#351255",
                });

                return;
            }


            /* ---------------- VALIDATION ---------------- */

            for (
                let i = 0;
                i <
                pricingTierItems.length;
                i++
            ) {

                const tier =
                    pricingTierItems[i];

                if (
                    !tier.title.trim()
                ) {

                    Swal.fire({
                        icon: "warning",

                        title:
                            "Title Required",

                        text:
                            `Please enter title for pricing tier ${
                                i + 1
                            }.`,

                        confirmButtonColor:
                            "#351255",
                    });

                    return;
                }


                if (
                    tier.duration_days ===
                        "" ||
                    Number(
                        tier.duration_days
                    ) <= 0
                ) {

                    Swal.fire({
                        icon: "warning",

                        title:
                            "Duration Required",

                        text:
                            `Please enter valid duration days for pricing tier ${
                                i + 1
                            }.`,

                        confirmButtonColor:
                            "#351255",
                    });

                    return;
                }


                if (
                    tier.price_npr ===
                        "" ||
                    Number(
                        tier.price_npr
                    ) < 0
                ) {

                    Swal.fire({
                        icon: "warning",

                        title:
                            "Price Required",

                        text:
                            `Please enter a valid price for pricing tier ${
                                i + 1
                            }.`,

                        confirmButtonColor:
                            "#351255",
                    });

                    return;
                }
            }


            /* =================================================
               CREATE PAYLOAD
            ================================================= */

            const data = {

                insurance_plan_id:
                    Number(
                        insurancePlanId
                    ),

                pricing_tiers:
                    pricingTierItems.map(
                        (
                            tier,
                            index
                        ) => ({

                            title:
                                tier.title.trim(),

                            duration_days:
                                Number(
                                    tier.duration_days
                                ),

                            price_npr:
                                Number(
                                    tier.price_npr
                                ),

                            status:
                                tier.status ||
                                "ACTIVE",

                            display_order:
                                tier.display_order ===
                                ""
                                    ? index
                                    : Number(
                                        tier.display_order
                                    ),
                        })
                    ),
            };


            try {

                setSaving(true);

                const response =
                    await createInsurancePricingTiers(
                        data
                    );

                if (
                    response.data?.status
                ) {

                    await Swal.fire({
                        icon:
                            "success",

                        title:
                            "Pricing Tiers Added",

                        text:
                            response.data
                                ?.message ||
                            "Insurance pricing tiers created successfully.",

                        confirmButtonColor:
                            "#351255",
                    });

                    resetCreateForm();

                    if (
                        page !== 1
                    ) {

                        setPage(1);

                    } else {

                        fetchPricingTiers();
                    }
                }

            } catch (error) {

                console.error(
                    "Error creating insurance pricing tiers:",
                    error
                );

                showValidationError(
                    error,
                    "Unable to create insurance pricing tiers."
                );

            } finally {

                setSaving(false);
            }
        };


    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (
        tier
    ) => {

        setEditingId(
            tier.id
        );

        setEditInsurancePlanId(
            (
                tier
                    .insurance_plan_id ||
                tier
                    .insurance_plan
                    ?.id ||
                tier
                    .insurancePlan
                    ?.id ||
                ""
            ).toString()
        );

        setEditForm({

            title:
                tier.title || "",

            duration_days:
                tier.duration_days ??
                "",

            price_npr:
                tier.price_npr ?? "",

            status:
                tier.status ||
                "ACTIVE",

            display_order:
                tier.display_order ??
                0,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =====================================================
       EDIT CHANGE
    ===================================================== */

    const handleEditChange = (
        field,
        value
    ) => {

        setEditForm(
            (previous) => ({
                ...previous,

                [field]: value,
            })
        );
    };


    /* =====================================================
       CANCEL EDIT
    ===================================================== */

    const cancelEdit =
        () => {

            setEditingId(null);

            setEditInsurancePlanId(
                ""
            );

            setEditForm({
                title: "",
                duration_days: "",
                price_npr: "",
                status: "ACTIVE",
                display_order: 0,
            });
        };


    /* =====================================================
       UPDATE
    ===================================================== */

    const handleUpdate =
        async (e) => {

            e.preventDefault();


            if (
                !editInsurancePlanId
            ) {

                Swal.fire({
                    icon: "warning",

                    title:
                        "Insurance Plan Required",

                    text:
                        "Please select an insurance plan.",

                    confirmButtonColor:
                        "#351255",
                });

                return;
            }


            if (
                !editForm.title.trim()
            ) {

                Swal.fire({
                    icon: "warning",

                    title:
                        "Title Required",

                    text:
                        "Please enter pricing tier title.",

                    confirmButtonColor:
                        "#351255",
                });

                return;
            }


            if (
                editForm
                    .duration_days ===
                    "" ||
                Number(
                    editForm
                        .duration_days
                ) <= 0
            ) {

                Swal.fire({
                    icon: "warning",

                    title:
                        "Duration Required",

                    text:
                        "Please enter valid duration days.",

                    confirmButtonColor:
                        "#351255",
                });

                return;
            }


            if (
                editForm
                    .price_npr ===
                    "" ||
                Number(
                    editForm
                        .price_npr
                ) < 0
            ) {

                Swal.fire({
                    icon: "warning",

                    title:
                        "Price Required",

                    text:
                        "Please enter a valid price.",

                    confirmButtonColor:
                        "#351255",
                });

                return;
            }


            const data = {

                insurance_plan_id:
                    Number(
                        editInsurancePlanId
                    ),

                title:
                    editForm.title.trim(),

                duration_days:
                    Number(
                        editForm
                            .duration_days
                    ),

                price_npr:
                    Number(
                        editForm.price_npr
                    ),

                status:
                    editForm.status,

                display_order:
                    editForm
                        .display_order ===
                    ""
                        ? 0
                        : Number(
                            editForm
                                .display_order
                        ),
            };


            try {

                setSaving(true);

                const response =
                    await updateInsurancePricingTier(
                        editingId,
                        data
                    );

                if (
                    response.data?.status
                ) {

                    await Swal.fire({
                        icon:
                            "success",

                        title:
                            "Pricing Tier Updated",

                        text:
                            response.data
                                ?.message ||
                            "Insurance pricing tier updated successfully.",

                        confirmButtonColor:
                            "#351255",
                    });

                    cancelEdit();

                    fetchPricingTiers();
                }

            } catch (error) {

                console.error(
                    "Error updating insurance pricing tier:",
                    error
                );

                showValidationError(
                    error,
                    "Unable to update insurance pricing tier."
                );

            } finally {

                setSaving(false);
            }
        };


    /* =====================================================
       STATUS

       ID ONLY
    ===================================================== */

    const handleStatusChange =
        async (tier) => {

            const newStatus =
                tier.status ===
                "ACTIVE"
                    ? "INACTIVE"
                    : "ACTIVE";


            const result =
                await Swal.fire({

                    icon:
                        "question",

                    title:
                        newStatus ===
                        "ACTIVE"
                            ? "Activate Pricing Tier?"
                            : "Deactivate Pricing Tier?",

                    text:
                        newStatus ===
                        "ACTIVE"
                            ? "This pricing tier will become active."
                            : "This pricing tier will become inactive.",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        newStatus ===
                        "ACTIVE"
                            ? "Activate"
                            : "Deactivate",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#351255",
                });


            if (
                !result.isConfirmed
            ) {
                return;
            }


            try {

                setChangingStatusId(
                    tier.id
                );

                /*
                 * ONLY ID.
                 * No status body.
                 */

                const response =
                    await changeInsurancePricingTierStatus(
                        tier.id
                    );

                if (
                    response.data?.status
                ) {

                    setPricingTiers(
                        (previous) =>
                            previous.map(
                                (
                                    item
                                ) =>
                                    item.id ===
                                    tier.id
                                        ? {
                                            ...item,

                                            status:
                                                response
                                                    .data
                                                    ?.data
                                                    ?.status ||
                                                newStatus,
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
                            response.data
                                ?.message ||
                            "Pricing tier status updated successfully.",

                        confirmButtonColor:
                            "#351255",
                    });
                }

            } catch (error) {

                console.error(
                    "Error changing pricing tier status:",
                    error
                );

                Swal.fire({
                    icon:
                        "error",

                    title:
                        "Failed",

                    text:
                        error.response
                            ?.data
                            ?.message ||
                        "Unable to change pricing tier status.",

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

    const handleDelete =
        async (id) => {

            const result =
                await Swal.fire({

                    icon:
                        "warning",

                    title:
                        "Delete Pricing Tier?",

                    text:
                        "This pricing tier will be permanently deleted.",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Delete",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#f52d91",

                    cancelButtonColor:
                        "#77717d",
                });


            if (
                !result.isConfirmed
            ) {
                return;
            }


            try {

                const response =
                    await deleteInsurancePricingTier(
                        id
                    );

                if (
                    response.data?.status
                ) {

                    await Swal.fire({
                        icon:
                            "success",

                        title:
                            "Deleted",

                        text:
                            response.data
                                ?.message ||
                            "Insurance pricing tier deleted successfully.",

                        confirmButtonColor:
                            "#351255",
                    });


                    if (
                        editingId ===
                        id
                    ) {

                        cancelEdit();
                    }


                    if (
                        pricingTiers.length ===
                            1 &&
                        page > 1
                    ) {

                        setPage(
                            (previous) =>
                                previous -
                                1
                        );

                    } else {

                        fetchPricingTiers();
                    }
                }

            } catch (error) {

                console.error(
                    "Error deleting insurance pricing tier:",
                    error
                );

                Swal.fire({
                    icon:
                        "error",

                    title:
                        "Failed",

                    text:
                        error.response
                            ?.data
                            ?.message ||
                        "Unable to delete insurance pricing tier.",

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
            error.response?.data
                ?.message ||
            fallback;

        const validationErrors =
            error.response?.data
                ?.errors;

        if (
            validationErrors
        ) {

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

            text:
                errorMessage,

            confirmButtonColor:
                "#351255",
        });
    };


    /* =====================================================
       GET PLAN NAME
    ===================================================== */

    const getPlanName = (
        tier
    ) => {

        return (
            tier
                .insurance_plan
                ?.name ||
            tier
                .insurancePlan
                ?.name ||
            insurancePlans.find(
                (plan) =>
                    String(
                        plan.id
                    ) ===
                    String(
                        tier
                            .insurance_plan_id
                    )
            )?.name ||
            "-"
        );
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

                    <div className="insurance-pricing-tier-page">


                        {/* ============================
                            HEADER
                        ============================ */}

                        <div className="insurance-pricing-tier-header">

                            <div>

                                <h1>
                                    Insurance Pricing Tiers
                                </h1>

                                <p>
                                    Manage pricing and duration options for insurance plans.
                                </p>

                            </div>

                        </div>


                        {/* ============================
                            FORM CARD
                        ============================ */}

                        <div className="insurance-pricing-tier-form-card">

                            <div className="insurance-pricing-tier-card-header">

                                <h2>

                                    {editingId
                                        ? "Edit Pricing Tier"
                                        : "Add Pricing Tiers"}

                                </h2>

                                <p>

                                    {editingId
                                        ? "Update the selected insurance pricing tier."
                                        : "Select an insurance plan and add one or more pricing tiers."}

                                </p>

                            </div>


                            {/* ========================
                                EDIT
                            ======================== */}

                            {editingId ? (

                                <form
                                    className="insurance-pricing-tier-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >

                                    <div className="insurance-pricing-tier-form-grid">


                                        {/* PLAN */}

                                        <div className="insurance-pricing-tier-form-group">

                                            <label>

                                                Insurance Plan

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <select
                                                value={
                                                    editInsurancePlanId
                                                }
                                                onChange={(e) =>
                                                    setEditInsurancePlanId(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                                required
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


                                        {/* TITLE */}

                                        <div className="insurance-pricing-tier-form-group">

                                            <label>

                                                Title

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editForm.title
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "title",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="e.g. 30 Day Coverage"
                                                disabled={
                                                    saving
                                                }
                                                required
                                            />

                                        </div>


                                        {/* DURATION */}

                                        <div className="insurance-pricing-tier-form-group">

                                            <label>

                                                Duration Days

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    editForm
                                                        .duration_days
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "duration_days",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="e.g. 30"
                                                disabled={
                                                    saving
                                                }
                                                required
                                            />

                                        </div>


                                        {/* PRICE */}

                                        <div className="insurance-pricing-tier-form-group">

                                            <label>

                                                Price (NPR)

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    editForm
                                                        .price_npr
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "price_npr",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="e.g. 5000"
                                                disabled={
                                                    saving
                                                }
                                                required
                                            />

                                        </div>


                                        {/* STATUS */}

                                        <div className="insurance-pricing-tier-form-group">

                                            <label>
                                                Status
                                            </label>

                                            <select
                                                value={
                                                    editForm.status
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "status",
                                                        e
                                                            .target
                                                            .value
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


                                        {/* ORDER */}

                                        <div className="insurance-pricing-tier-form-group">

                                            <label>
                                                Display Order
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    editForm
                                                        .display_order
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "display_order",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="insurance-pricing-tier-form-actions">

                                        <button
                                            type="button"
                                            className="insurance-pricing-tier-cancel-btn"
                                            onClick={
                                                cancelEdit
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            <FaTimes />

                                            Cancel

                                        </button>


                                        <button
                                            type="submit"
                                            className="insurance-pricing-tier-submit-btn"
                                            disabled={
                                                saving
                                            }
                                        >

                                            {saving
                                                ? "Updating..."
                                                : "Update Pricing Tier"}

                                        </button>

                                    </div>

                                </form>

                            ) : (

                                /* ========================
                                   CREATE
                                ======================== */

                                <form
                                    className="insurance-pricing-tier-form"
                                    onSubmit={
                                        handleCreate
                                    }
                                >


                                    {/* PLAN */}

                                    <div className="insurance-pricing-tier-plan-select">

                                        <div className="insurance-pricing-tier-form-group">

                                            <label>

                                                Insurance Plan

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <select
                                                value={
                                                    insurancePlanId
                                                }
                                                onChange={(e) =>
                                                    setInsurancePlanId(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                                required
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

                                    </div>


                                    {/* TIER LIST */}

                                    <div className="insurance-pricing-tier-create-list">

                                        {pricingTierItems.map(
                                            (
                                                tier,
                                                index
                                            ) => (

                                                <div
                                                    className="insurance-pricing-tier-create-item"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <div className="insurance-pricing-tier-create-item-header">

                                                        <h3>

                                                            Pricing Tier{" "}
                                                            {index +
                                                                1}

                                                        </h3>


                                                        <button
                                                            type="button"
                                                            className="insurance-pricing-tier-remove-btn"
                                                            onClick={() =>
                                                                removePricingTierRow(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                pricingTierItems.length ===
                                                                    1 ||
                                                                saving
                                                            }
                                                            title="Remove Pricing Tier"
                                                        >

                                                            <FaTimes />

                                                        </button>

                                                    </div>


                                                    <div className="insurance-pricing-tier-form-grid">


                                                        {/* TITLE */}

                                                        <div className="insurance-pricing-tier-form-group">

                                                            <label>

                                                                Title

                                                                <span className="required">
                                                                    *
                                                                </span>

                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    tier.title
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
                                                                        index,
                                                                        "title",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. 30 Day Coverage"
                                                                disabled={
                                                                    saving
                                                                }
                                                                required
                                                            />

                                                        </div>


                                                        {/* DURATION */}

                                                        <div className="insurance-pricing-tier-form-group">

                                                            <label>

                                                                Duration Days

                                                                <span className="required">
                                                                    *
                                                                </span>

                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={
                                                                    tier
                                                                        .duration_days
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
                                                                        index,
                                                                        "duration_days",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. 30"
                                                                disabled={
                                                                    saving
                                                                }
                                                                required
                                                            />

                                                        </div>


                                                        {/* PRICE */}

                                                        <div className="insurance-pricing-tier-form-group">

                                                            <label>

                                                                Price (NPR)

                                                                <span className="required">
                                                                    *
                                                                </span>

                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    tier
                                                                        .price_npr
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
                                                                        index,
                                                                        "price_npr",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. 5000"
                                                                disabled={
                                                                    saving
                                                                }
                                                                required
                                                            />

                                                        </div>


                                                        {/* STATUS */}

                                                        <div className="insurance-pricing-tier-form-group">

                                                            <label>
                                                                Status
                                                            </label>

                                                            <select
                                                                value={
                                                                    tier.status
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
                                                                        index,
                                                                        "status",
                                                                        e
                                                                            .target
                                                                            .value
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


                                                        {/* ORDER */}

                                                        <div className="insurance-pricing-tier-form-group">

                                                            <label>
                                                                Display Order
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    tier
                                                                        .display_order
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
                                                                        index,
                                                                        "display_order",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving
                                                                }
                                                            />

                                                        </div>

                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="insurance-pricing-tier-create-actions">

                                        <button
                                            type="button"
                                            className="insurance-pricing-tier-add-more-btn"
                                            onClick={
                                                addPricingTierRow
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            <FaPlus />

                                            Add Another Tier

                                        </button>


                                        <button
                                            type="submit"
                                            className="insurance-pricing-tier-submit-btn"
                                            disabled={
                                                saving
                                            }
                                        >

                                            {saving
                                                ? "Saving..."
                                                : "Save Pricing Tiers"}

                                        </button>

                                    </div>

                                </form>
                            )}

                        </div>


                        {/* ============================
                            TABLE
                        ============================ */}

                        <div className="insurance-pricing-tier-table-card">

                            <div className="insurance-pricing-tier-table-header">

                                <div>

                                    <h2>
                                        Pricing Tier List
                                    </h2>

                                    <p>

                                        {totalPricingTiers}{" "}

                                        {totalPricingTiers ===
                                        1
                                            ? "pricing tier"
                                            : "pricing tiers"}

                                    </p>

                                </div>

                            </div>


                            <div className="insurance-pricing-tier-table-responsive">

                                <table className="insurance-pricing-tier-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                S.N.
                                            </th>

                                            <th>
                                                Title
                                            </th>

                                            <th>
                                                Insurance Plan
                                            </th>

                                            <th>
                                                Duration
                                            </th>

                                            <th>
                                                Price (NPR)
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
                                                    colSpan="8"
                                                    className="insurance-pricing-tier-table-message"
                                                >

                                                    <div className="insurance-pricing-tier-loader"></div>

                                                    Loading pricing tiers...

                                                </td>

                                            </tr>

                                        ) : pricingTiers.length ===
                                          0 ? (

                                            <tr>

                                                <td
                                                    colSpan="8"
                                                    className="insurance-pricing-tier-table-message"
                                                >
                                                    No insurance pricing tiers found.
                                                </td>

                                            </tr>

                                        ) : (

                                            pricingTiers.map(
                                                (
                                                    tier,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            tier.id
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

                                                            <strong className="insurance-pricing-tier-title">

                                                                {
                                                                    tier.title
                                                                }

                                                            </strong>

                                                        </td>


                                                        <td>

                                                            {getPlanName(
                                                                tier
                                                            )}

                                                        </td>


                                                        <td>

                                                            {tier.duration_days
                                                                ? `${tier.duration_days} Days`
                                                                : "-"}

                                                        </td>


                                                        <td>

                                                            <span className="insurance-pricing-tier-price">

                                                                NPR{" "}

                                                                {Number(
                                                                    tier.price_npr ||
                                                                        0
                                                                ).toLocaleString()}

                                                            </span>

                                                        </td>


                                                        <td>

                                                            {tier.display_order ??
                                                                0}

                                                        </td>


                                                        <td>

                                                            <button
                                                                type="button"
                                                                className={`insurance-pricing-tier-status ${
                                                                    tier.status ===
                                                                    "ACTIVE"
                                                                        ? "active"
                                                                        : "inactive"
                                                                }`}
                                                                disabled={
                                                                    changingStatusId ===
                                                                    tier.id
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        tier
                                                                    )
                                                                }
                                                            >

                                                                {changingStatusId ===
                                                                tier.id
                                                                    ? "Updating..."
                                                                    : tier.status}

                                                            </button>

                                                        </td>


                                                        <td>

                                                            <div className="insurance-pricing-tier-actions">

                                                                <button
                                                                    type="button"
                                                                    className="insurance-pricing-tier-edit-btn"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            tier
                                                                        )
                                                                    }
                                                                    title="Edit"
                                                                >

                                                                    <FaPen />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="insurance-pricing-tier-delete-btn"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            tier.id
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
                                page={
                                    page
                                }
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


export default InsurancePricingTier;