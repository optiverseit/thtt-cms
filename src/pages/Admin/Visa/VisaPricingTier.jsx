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
    getAllVisaPricingTiersCms,
    getVisaCategories,
    createVisaPricingTiers,
    updateVisaPricingTier,
    changeVisaPricingTierStatus,
    deleteVisaPricingTier,
} from "../../../api/BackendApi";

import "./VisaPricingTier.css";


/* =========================================================
   EMPTY PRICING TIER
========================================================= */

const createEmptyPricingTier = (order = 0) => ({
    title: "",
    validity: "",
    price_npr: "",
    status: "ACTIVE",
    display_order: order,
});


const VisaPricingTier = () => {

    /* =====================================================
       DATA
    ===================================================== */

    const [pricingTiers, setPricingTiers] = useState([]);
    const [visaCategories, setVisaCategories] = useState([]);


    /* =====================================================
       CREATE
    ===================================================== */

    const [visaCategoryId, setVisaCategoryId] = useState("");

    const [pricingTierItems, setPricingTierItems] = useState([
        createEmptyPricingTier(0),
    ]);


    /* =====================================================
       EDIT
    ===================================================== */

    const [editingId, setEditingId] = useState(null);

    const [editVisaCategoryId, setEditVisaCategoryId] =
        useState("");

    const [editForm, setEditForm] = useState({
        title: "",
        validity: "",
        price_npr: "",
        status: "ACTIVE",
        display_order: 0,
    });


    /* =====================================================
       LOADING
    ===================================================== */

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [changingStatusId, setChangingStatusId] =
        useState(null);


    /* =====================================================
       PAGINATION
    ===================================================== */

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPricingTiers, setTotalPricingTiers] =
        useState(0);


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        fetchVisaCategories();
    }, []);

    useEffect(() => {
        fetchPricingTiers();
    }, [page]);


    /* =====================================================
       FETCH ACTIVE VISA CATEGORIES
    ===================================================== */

    const fetchVisaCategories = async () => {

        try {

            const response =
                await getVisaCategories();

            console.log(
                "VISA CATEGORIES RESPONSE:",
                response.data
            );

            if (response.data?.status) {

                const categoryData =
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : response.data.data?.data || [];

                setVisaCategories(categoryData);
            }

        } catch (error) {

            console.error(
                "Error fetching visa categories:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load visa categories.",
                confirmButtonColor: "#351255",
            });
        }
    };


    /* =====================================================
       FETCH CMS PRICING TIERS
    ===================================================== */

    const fetchPricingTiers = async () => {

        try {

            setLoading(true);

            const response =
                await getAllVisaPricingTiersCms(page);

            console.log(
                "VISA PRICING TIERS CMS RESPONSE:",
                response.data
            );

            if (response.data?.status) {

                const responseData =
                    response.data.data;

                /*
                 * Paginated response
                 */
                if (
                    responseData &&
                    Array.isArray(responseData.data)
                ) {

                    setPricingTiers(
                        responseData.data
                    );

                    setTotalPages(
                        responseData.last_page || 1
                    );

                    setTotalPricingTiers(
                        responseData.total || 0
                    );

                } else {

                    /*
                     * Non-paginated fallback
                     */
                    const tierData =
                        Array.isArray(responseData)
                            ? responseData
                            : [];

                    setPricingTiers(tierData);

                    setTotalPages(1);

                    setTotalPricingTiers(
                        tierData.length
                    );
                }
            }

        } catch (error) {

            console.error(
                "Error fetching pricing tiers:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load visa pricing tiers.",
                confirmButtonColor: "#351255",
            });

        } finally {

            setLoading(false);
        }
    };


    /* =====================================================
       CREATE - ADD ROW
    ===================================================== */

    const addPricingTierRow = () => {

        setPricingTierItems((previous) => [
            ...previous,
            createEmptyPricingTier(previous.length),
        ]);
    };


    /* =====================================================
       CREATE - REMOVE ROW
    ===================================================== */

    const removePricingTierRow = (index) => {

        if (pricingTierItems.length === 1) {
            return;
        }

        const updatedItems =
            pricingTierItems
                .filter((_, i) => i !== index)
                .map((tier, i) => ({
                    ...tier,
                    display_order: i,
                }));

        setPricingTierItems(updatedItems);
    };


    /* =====================================================
       CREATE - FIELD CHANGE
    ===================================================== */

    const handlePricingTierChange = (
        index,
        field,
        value
    ) => {

        const updatedItems =
            [...pricingTierItems];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        setPricingTierItems(updatedItems);
    };


    /* =====================================================
       RESET CREATE
    ===================================================== */

    const resetCreateForm = () => {

        setVisaCategoryId("");

        setPricingTierItems([
            createEmptyPricingTier(0),
        ]);
    };


    /* =====================================================
       CREATE
    ===================================================== */

    const handleCreate = async (e) => {

        e.preventDefault();


        /* ---------------- CATEGORY ---------------- */

        if (!visaCategoryId) {

            Swal.fire({
                icon: "warning",
                title: "Visa Category Required",
                text:
                    "Please select a visa category.",
                confirmButtonColor: "#351255",
            });

            return;
        }


        /* ---------------- VALIDATION ---------------- */

        for (
            let i = 0;
            i < pricingTierItems.length;
            i++
        ) {

            const tier =
                pricingTierItems[i];

            if (!tier.title.trim()) {

                Swal.fire({
                    icon: "warning",
                    title: "Title Required",
                    text:
                        `Please enter title for pricing tier ${i + 1}.`,
                    confirmButtonColor:
                        "#351255",
                });

                return;
            }

            if (!tier.validity.trim()) {

                Swal.fire({
                    icon: "warning",
                    title: "Validity Required",
                    text:
                        `Please enter validity for pricing tier ${i + 1}.`,
                    confirmButtonColor:
                        "#351255",
                });

                return;
            }

            if (
                tier.price_npr === "" ||
                Number(tier.price_npr) < 0
            ) {

                Swal.fire({
                    icon: "warning",
                    title: "Price Required",
                    text:
                        `Please enter a valid price for pricing tier ${i + 1}.`,
                    confirmButtonColor:
                        "#351255",
                });

                return;
            }
        }


        /* =================================================
           EXACT PAYLOAD EXPECTED BY BACKEND

           {
               visa_category_id: 1,
               pricing_tiers: [
                   {
                       title: "...",
                       validity: "...",
                       price_npr: 5000,
                       status: "ACTIVE",
                       display_order: 0
                   }
               ]
           }
        ================================================= */

        const data = {

            visa_category_id:
                Number(visaCategoryId),

            pricing_tiers:
                pricingTierItems.map(
                    (tier, index) => ({

                        title:
                            tier.title.trim(),

                        validity:
                            tier.validity.trim(),

                        price_npr:
                            Number(tier.price_npr),

                        status:
                            tier.status ||
                            "ACTIVE",

                        display_order:
                            tier.display_order === ""
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
                await createVisaPricingTiers(
                    data
                );

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title:
                        "Pricing Tiers Added",
                    text:
                        response.data?.message ||
                        "Visa pricing tiers created successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                resetCreateForm();

                if (page !== 1) {
                    setPage(1);
                } else {
                    fetchPricingTiers();
                }
            }

        } catch (error) {

            console.error(
                "Error creating pricing tiers:",
                error
            );

            showValidationError(
                error,
                "Unable to create visa pricing tiers."
            );

        } finally {

            setSaving(false);
        }
    };


    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (tier) => {

        setEditingId(tier.id);

        setEditVisaCategoryId(
            (
                tier.visa_category_id ||
                tier.visa_category?.id ||
                ""
            ).toString()
        );

        setEditForm({

            title:
                tier.title || "",

            validity:
                tier.validity || "",

            price_npr:
                tier.price_npr ?? "",

            status:
                tier.status || "ACTIVE",

            display_order:
                tier.display_order ?? 0,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =====================================================
       EDIT FIELD CHANGE
    ===================================================== */

    const handleEditChange = (
        field,
        value
    ) => {

        setEditForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };


    /* =====================================================
       CANCEL EDIT
    ===================================================== */

    const cancelEdit = () => {

        setEditingId(null);

        setEditVisaCategoryId("");

        setEditForm({
            title: "",
            validity: "",
            price_npr: "",
            status: "ACTIVE",
            display_order: 0,
        });
    };


    /* =====================================================
       UPDATE
    ===================================================== */

    const handleUpdate = async (e) => {

        e.preventDefault();

        if (!editVisaCategoryId) {

            Swal.fire({
                icon: "warning",
                title: "Visa Category Required",
                text:
                    "Please select a visa category.",
                confirmButtonColor: "#351255",
            });

            return;
        }


        if (!editForm.title.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Title Required",
                text:
                    "Please enter pricing tier title.",
                confirmButtonColor: "#351255",
            });

            return;
        }


        if (!editForm.validity.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Validity Required",
                text:
                    "Please enter pricing tier validity.",
                confirmButtonColor: "#351255",
            });

            return;
        }


        if (
            editForm.price_npr === "" ||
            Number(editForm.price_npr) < 0
        ) {

            Swal.fire({
                icon: "warning",
                title: "Price Required",
                text:
                    "Please enter a valid price.",
                confirmButtonColor: "#351255",
            });

            return;
        }


        const data = {

            visa_category_id:
                Number(editVisaCategoryId),

            title:
                editForm.title.trim(),

            validity:
                editForm.validity.trim(),

            price_npr:
                Number(editForm.price_npr),

            status:
                editForm.status,

            display_order:
                editForm.display_order === ""
                    ? 0
                    : Number(
                          editForm.display_order
                      ),
        };


        try {

            setSaving(true);

            const response =
                await updateVisaPricingTier(
                    editingId,
                    data
                );

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title:
                        "Pricing Tier Updated",
                    text:
                        response.data?.message ||
                        "Visa pricing tier updated successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                cancelEdit();

                fetchPricingTiers();
            }

        } catch (error) {

            console.error(
                "Error updating pricing tier:",
                error
            );

            showValidationError(
                error,
                "Unable to update visa pricing tier."
            );

        } finally {

            setSaving(false);
        }
    };


    /* =====================================================
       CHANGE STATUS
    ===================================================== */

    const handleStatusChange = async (tier) => {

        const newStatus =
            tier.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";


        const result =
            await Swal.fire({

                icon: "question",

                title:
                    newStatus === "ACTIVE"
                        ? "Activate Pricing Tier?"
                        : "Deactivate Pricing Tier?",

                text:
                    newStatus === "ACTIVE"
                        ? "This pricing tier will become active."
                        : "This pricing tier will become inactive.",

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

            setChangingStatusId(tier.id);

            const response =
                await changeVisaPricingTierStatus(
                    tier.id,
                    newStatus
                );

            if (response.data?.status) {

                setPricingTiers(
                    (previous) =>
                        previous.map(
                            (item) =>
                                item.id === tier.id
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
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
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
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change pricing tier status.",
                confirmButtonColor:
                    "#351255",
            });

        } finally {

            setChangingStatusId(null);
        }
    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (id) => {

        const result =
            await Swal.fire({

                icon: "warning",

                title:
                    "Delete Pricing Tier?",

                text:
                    "This pricing tier will be permanently deleted.",

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
                await deleteVisaPricingTier(id);

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Visa pricing tier deleted successfully.",
                    confirmButtonColor:
                        "#351255",
                });


                if (editingId === id) {
                    cancelEdit();
                }


                if (
                    pricingTiers.length === 1 &&
                    page > 1
                ) {

                    setPage(
                        (previous) =>
                            previous - 1
                    );

                } else {

                    fetchPricingTiers();
                }
            }

        } catch (error) {

            console.error(
                "Error deleting pricing tier:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete visa pricing tier.",
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

            if (Array.isArray(firstError)) {

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
       GET CATEGORY NAME
    ===================================================== */

    const getCategoryName = (tier) => {

        return (
            tier.visa_category?.name ||
            tier.category?.name ||
            visaCategories.find(
                (category) =>
                    String(category.id) ===
                    String(
                        tier.visa_category_id
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

                    <div className="visa-pricing-tier-page">


                        {/* ============================
                            HEADER
                        ============================ */}

                        <div className="visa-pricing-tier-header">

                            <div>

                                <h1>
                                    Visa Pricing Tiers
                                </h1>

                                <p>
                                    Manage pricing and validity options for visa categories.
                                </p>

                            </div>

                        </div>


                        {/* ============================
                            FORM CARD
                        ============================ */}

                        <div className="visa-pricing-tier-form-card">

                            <div className="visa-pricing-tier-card-header">

                                <h2>

                                    {editingId
                                        ? "Edit Pricing Tier"
                                        : "Add Pricing Tiers"}

                                </h2>

                                <p>

                                    {editingId
                                        ? "Update the selected visa pricing tier."
                                        : "Select a visa category and add one or more pricing tiers."}

                                </p>

                            </div>


                            {/* ========================
                                EDIT
                            ======================== */}

                            {editingId ? (

                                <form
                                    className="visa-pricing-tier-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >

                                    <div className="visa-pricing-tier-form-grid">


                                        {/* CATEGORY */}

                                        <div className="visa-pricing-tier-form-group">

                                            <label>

                                                Visa Category

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <select
                                                value={
                                                    editVisaCategoryId
                                                }
                                                onChange={(e) =>
                                                    setEditVisaCategoryId(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Visa Category
                                                </option>

                                                {visaCategories.map(
                                                    (category) => (

                                                        <option
                                                            key={
                                                                category.id
                                                            }
                                                            value={
                                                                category.id
                                                            }
                                                        >

                                                            {
                                                                category.name
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        {/* TITLE */}

                                        <div className="visa-pricing-tier-form-group">

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
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Standard Processing"
                                                disabled={
                                                    saving
                                                }
                                                required
                                            />

                                        </div>


                                        {/* VALIDITY */}

                                        <div className="visa-pricing-tier-form-group">

                                            <label>

                                                Validity

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editForm.validity
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "validity",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. 30 Days"
                                                disabled={
                                                    saving
                                                }
                                                required
                                            />

                                        </div>


                                        {/* PRICE */}

                                        <div className="visa-pricing-tier-form-group">

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
                                                    editForm.price_npr
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "price_npr",
                                                        e.target.value
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

                                        <div className="visa-pricing-tier-form-group">

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

                                        <div className="visa-pricing-tier-form-group">

                                            <label>
                                                Display Order
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    editForm.display_order
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "display_order",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="visa-pricing-tier-form-actions">

                                        <button
                                            type="button"
                                            className="visa-pricing-tier-cancel-btn"
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
                                            className="visa-pricing-tier-submit-btn"
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
                                    className="visa-pricing-tier-form"
                                    onSubmit={
                                        handleCreate
                                    }
                                >


                                    {/* CATEGORY */}

                                    <div className="visa-pricing-tier-category-select">

                                        <div className="visa-pricing-tier-form-group">

                                            <label>

                                                Visa Category

                                                <span className="required">
                                                    *
                                                </span>

                                            </label>

                                            <select
                                                value={
                                                    visaCategoryId
                                                }
                                                onChange={(e) =>
                                                    setVisaCategoryId(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Visa Category
                                                </option>

                                                {visaCategories.map(
                                                    (category) => (

                                                        <option
                                                            key={
                                                                category.id
                                                            }
                                                            value={
                                                                category.id
                                                            }
                                                        >

                                                            {
                                                                category.name
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>


                                    {/* PRICING TIER LIST */}

                                    <div className="visa-pricing-tier-create-list">

                                        {pricingTierItems.map(
                                            (
                                                tier,
                                                index
                                            ) => (

                                                <div
                                                    className="visa-pricing-tier-create-item"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <div className="visa-pricing-tier-create-item-header">

                                                        <h3>
                                                            Pricing Tier{" "}
                                                            {index +
                                                                1}
                                                        </h3>


                                                        <button
                                                            type="button"
                                                            className="visa-pricing-tier-remove-btn"
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


                                                    <div className="visa-pricing-tier-form-grid">


                                                        {/* TITLE */}

                                                        <div className="visa-pricing-tier-form-group">

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
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. Standard Processing"
                                                                disabled={
                                                                    saving
                                                                }
                                                                required
                                                            />

                                                        </div>


                                                        {/* VALIDITY */}

                                                        <div className="visa-pricing-tier-form-group">

                                                            <label>

                                                                Validity

                                                                <span className="required">
                                                                    *
                                                                </span>

                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    tier.validity
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
                                                                        index,
                                                                        "validity",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="e.g. 30 Days"
                                                                disabled={
                                                                    saving
                                                                }
                                                                required
                                                            />

                                                        </div>


                                                        {/* PRICE */}

                                                        <div className="visa-pricing-tier-form-group">

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
                                                                    tier.price_npr
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
                                                                        index,
                                                                        "price_npr",
                                                                        e.target.value
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

                                                        <div className="visa-pricing-tier-form-group">

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

                                                        <div className="visa-pricing-tier-form-group">

                                                            <label>
                                                                Display Order
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    tier.display_order
                                                                }
                                                                onChange={(e) =>
                                                                    handlePricingTierChange(
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

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>


                                    {/* CREATE ACTIONS */}

                                    <div className="visa-pricing-tier-create-actions">

                                        <button
                                            type="button"
                                            className="visa-pricing-tier-add-more-btn"
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
                                            className="visa-pricing-tier-submit-btn"
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

                        <div className="visa-pricing-tier-table-card">

                            <div className="visa-pricing-tier-table-header">

                                <div>

                                    <h2>
                                        Pricing Tier List
                                    </h2>

                                    <p>

                                        {totalPricingTiers}{" "}

                                        {totalPricingTiers === 1
                                            ? "pricing tier"
                                            : "pricing tiers"}

                                    </p>

                                </div>

                            </div>


                            <div className="visa-pricing-tier-table-responsive">

                                <table className="visa-pricing-tier-table">

                                    <thead>

                                        <tr>

                                            <th>S.N.</th>

                                            <th>
                                                Title
                                            </th>

                                            <th>
                                                Visa Category
                                            </th>

                                            <th>
                                                Validity
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
                                                    className="visa-pricing-tier-table-message"
                                                >

                                                    <div className="visa-pricing-tier-loader"></div>

                                                    Loading pricing tiers...

                                                </td>

                                            </tr>

                                        ) : pricingTiers.length ===
                                          0 ? (

                                            <tr>

                                                <td
                                                    colSpan="8"
                                                    className="visa-pricing-tier-table-message"
                                                >
                                                    No visa pricing tiers found.
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

                                                            <strong className="visa-pricing-tier-title">
                                                                {
                                                                    tier.title
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>

                                                            {getCategoryName(
                                                                tier
                                                            )}

                                                        </td>


                                                        <td>

                                                            {tier.validity ||
                                                                "-"}

                                                        </td>


                                                        <td>

                                                            <span className="visa-pricing-tier-price">

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
                                                                className={`visa-pricing-tier-status ${
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

                                                            <div className="visa-pricing-tier-actions">

                                                                <button
                                                                    type="button"
                                                                    className="visa-pricing-tier-edit-btn"
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
                                                                    className="visa-pricing-tier-delete-btn"
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


export default VisaPricingTier;