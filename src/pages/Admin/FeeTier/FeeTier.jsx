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
    getAllPermitFeeTiersCms,
    getAllCountries,
    createPermitFeeTiers,
    updatePermitFeeTier,
    changePermitFeeTierStatus,
    deletePermitFeeTier,
} from "../../../api/BackendApi";

import "./FeeTier.css";


const createEmptyTier = () => ({
    age_group_label: "",
    min_age: "",
    max_age: "",
    welfare_fund_npr: "",
    ssf_contribution_npr: "",
    insurance_premium_npr: "",
    service_fee_npr: "",
});


const FeeTier = () => {
    const [feeTiers, setFeeTiers] = useState([]);
    const [countries, setCountries] = useState([]);

    const [countryId, setCountryId] = useState("");

    // Multiple tiers for create
    const [tierItems, setTierItems] = useState([
        createEmptyTier(),
    ]);

    // Edit
    const [editForm, setEditForm] = useState(
        createEmptyTier()
    );

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [changingStatusId, setChangingStatusId] =
        useState(null);

    const [deletingId, setDeletingId] =
        useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] =
        useState(1);


    useEffect(() => {
        fetchCountries();
    }, []);


    useEffect(() => {
        fetchFeeTiers();
    }, [page]);


    // =========================================
    // FETCH
    // =========================================

    const fetchFeeTiers = async () => {
        try {
            setLoading(true);

            const response =
                await getAllPermitFeeTiersCms(page);

            if (response.data.status) {
                /*
                    Supports both:

                    data: {
                        data: [],
                        last_page: 1
                    }

                    AND

                    data: []
                */

                if (Array.isArray(response.data.data)) {
                    setFeeTiers(response.data.data);
                    setTotalPages(1);
                } else {
                    setFeeTiers(
                        response.data.data?.data || []
                    );

                    setTotalPages(
                        response.data.data?.last_page || 1
                    );
                }
            }
        } catch (error) {
            console.error(
                "Error fetching fee tiers:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load permit fee tiers.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };


    const fetchCountries = async () => {
        try {
            const response =
                await getAllCountries();

            if (response.data.status) {
                if (Array.isArray(response.data.data)) {
                    setCountries(response.data.data);
                } else {
                    setCountries(
                        response.data.data?.data || []
                    );
                }
            }
        } catch (error) {
            console.error(
                "Error fetching countries:",
                error
            );
        }
    };


    // =========================================
    // CREATE
    // =========================================

    const addTierRow = () => {
        setTierItems([
            ...tierItems,
            createEmptyTier(),
        ]);
    };


    const removeTierRow = (index) => {
        if (tierItems.length === 1) {
            return;
        }

        setTierItems(
            tierItems.filter(
                (_, i) => i !== index
            )
        );
    };


    const handleTierChange = (
        index,
        field,
        value
    ) => {
        const updatedItems = [...tierItems];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        setTierItems(updatedItems);
    };


    const resetCreateForm = () => {
        setCountryId("");

        setTierItems([
            createEmptyTier(),
        ]);
    };


    const validateTier = (tier, index) => {
        if (!tier.age_group_label.trim()) {
            return `Enter age group label for tier ${
                index + 1
            }.`;
        }

        if (
            tier.min_age === "" ||
            tier.max_age === ""
        ) {
            return `Enter minimum and maximum age for tier ${
                index + 1
            }.`;
        }

        if (
            Number(tier.max_age) <
            Number(tier.min_age)
        ) {
            return `Maximum age cannot be less than minimum age for tier ${
                index + 1
            }.`;
        }

        if (
            tier.welfare_fund_npr === "" ||
            tier.ssf_contribution_npr === "" ||
            tier.insurance_premium_npr === "" ||
            tier.service_fee_npr === ""
        ) {
            return `Enter all fee amounts for tier ${
                index + 1
            }.`;
        }

        return null;
    };


    const handleCreate = async (e) => {
        e.preventDefault();

        if (!countryId) {
            Swal.fire({
                icon: "warning",
                title: "Country Required",
                text: "Please select a country.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        for (
            let i = 0;
            i < tierItems.length;
            i++
        ) {
            const error = validateTier(
                tierItems[i],
                i
            );

            if (error) {
                Swal.fire({
                    icon: "warning",
                    title: "Invalid Fee Tier",
                    text: error,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const data = {
            country_id: Number(countryId),

            tiers: tierItems.map((tier) => ({
                age_group_label:
                    tier.age_group_label.trim(),

                min_age: Number(tier.min_age),

                max_age: Number(tier.max_age),

                welfare_fund_npr: Number(
                    tier.welfare_fund_npr
                ),

                ssf_contribution_npr: Number(
                    tier.ssf_contribution_npr
                ),

                insurance_premium_npr: Number(
                    tier.insurance_premium_npr
                ),

                service_fee_npr: Number(
                    tier.service_fee_npr
                ),
            })),
        };

        try {
            setSaving(true);

            const response =
                await createPermitFeeTiers(data);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Fee Tiers Added",
                    text:
                        response.data.message ||
                        "Permit fee tiers created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();

                setPage(1);

                await fetchFeeTiers();
            }
        } catch (error) {
            console.error(
                "Error creating fee tiers:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create permit fee tiers.";

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


    // =========================================
    // EDIT
    // =========================================

    const handleEdit = (tier) => {
        setEditingId(tier.id);

        setCountryId(
            tier.country_id?.toString() || ""
        );

        setEditForm({
            age_group_label:
                tier.age_group_label || "",

            min_age:
                tier.min_age?.toString() || "",

            max_age:
                tier.max_age?.toString() || "",

            welfare_fund_npr:
                tier.welfare_fund_npr?.toString() ||
                "",

            ssf_contribution_npr:
                tier.ssf_contribution_npr?.toString() ||
                "",

            insurance_premium_npr:
                tier.insurance_premium_npr?.toString() ||
                "",

            service_fee_npr:
                tier.service_fee_npr?.toString() ||
                "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    const handleEditChange = (
        field,
        value
    ) => {
        setEditForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };


    const cancelEdit = () => {
        setEditingId(null);
        setCountryId("");
        setEditForm(createEmptyTier());
    };


    const handleUpdate = async (e) => {
        e.preventDefault();

        const validationError =
            validateTier(editForm, 0);

        if (validationError) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Fee Tier",
                text: validationError,
                confirmButtonColor: "#351255",
            });

            return;
        }

        /*
            IMPORTANT:
            This assumes your update API expects
            the fields directly, not tiers: [].

            If your update() validator has different
            field names, send me that method and I
            will match it exactly.
        */

        const data = {
            country_id: Number(countryId),

            age_group_label:
                editForm.age_group_label.trim(),

            min_age: Number(editForm.min_age),

            max_age: Number(editForm.max_age),

            welfare_fund_npr: Number(
                editForm.welfare_fund_npr
            ),

            ssf_contribution_npr: Number(
                editForm.ssf_contribution_npr
            ),

            insurance_premium_npr: Number(
                editForm.insurance_premium_npr
            ),

            service_fee_npr: Number(
                editForm.service_fee_npr
            ),
        };

        try {
            setSaving(true);

            const response =
                await updatePermitFeeTier(
                    editingId,
                    data
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Fee Tier Updated",
                    text:
                        response.data.message ||
                        "Permit fee tier updated successfully.",
                    confirmButtonColor: "#351255",
                });

                cancelEdit();
                await fetchFeeTiers();
            }
        } catch (error) {
            console.error(
                "Error updating fee tier:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update permit fee tier.";

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


    // =========================================
    // STATUS
    // =========================================

    const handleStatusChange = async (tier) => {
        if (changingStatusId === tier.id) {
            return;
        }

        const newStatus =
            tier.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result = await Swal.fire({
            icon: "question",
            title: "Change Status?",
            text: `Change this fee tier from ${tier.status} to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: `Yes, make ${newStatus}`,
            cancelButtonText: "Cancel",
            confirmButtonColor:
                newStatus === "ACTIVE"
                    ? "#18794e"
                    : "#b42345",
            cancelButtonColor: "#77717d",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setChangingStatusId(tier.id);

            const response =
                await changePermitFeeTierStatus(
                    tier.id
                );

            if (response.data.status) {
                setFeeTiers((previous) =>
                    previous.map((item) =>
                        item.id === tier.id
                            ? {
                                  ...item,
                                  status:
                                      response.data
                                          .data
                                          .status,
                              }
                            : item
                    )
                );

                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data.message ||
                        "Fee tier status changed successfully.",
                    confirmButtonColor: "#351255",
                });
            }
        } catch (error) {
            console.error(
                "Error changing status:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change fee tier status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setChangingStatusId(null);
        }
    };


    // =========================================
    // DELETE
    // =========================================

    const handleDelete = async (id) => {
        if (deletingId === id) {
            return;
        }

        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Fee Tier?",
            text: "This permit fee tier will be permanently deleted.",
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
            setDeletingId(id);

            const response =
                await deletePermitFeeTier(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Fee tier deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    cancelEdit();
                }

                await fetchFeeTiers();
            }
        } catch (error) {
            console.error(
                "Error deleting fee tier:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete fee tier.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setDeletingId(null);
        }
    };


    const getTotal = (tier) => {
        return (
            Number(
                tier.welfare_fund_npr || 0
            ) +
            Number(
                tier.ssf_contribution_npr || 0
            ) +
            Number(
                tier.insurance_premium_npr || 0
            ) +
            Number(
                tier.service_fee_npr || 0
            )
        );
    };


    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="fee-tier-page">

                        {/* HEADER */}

                        <div className="fee-tier-header">
                            <div>
                                <h1>
                                    Permit Fee Tiers
                                </h1>

                                <p>
                                    Manage age-based work
                                    permit fees for each
                                    country.
                                </p>
                            </div>
                        </div>


                        {/* =====================================
                            CREATE / EDIT FORM
                        ===================================== */}

                        <div className="fee-tier-form-card">

                            <div className="fee-tier-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Fee Tier"
                                        : "Add Fee Tiers"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected permit fee tier."
                                        : "Add multiple age-based fee tiers for a country."}
                                </p>
                            </div>


                            {editingId ? (

                                /* ============================
                                   EDIT
                                ============================ */

                                <form
                                    className="fee-tier-edit-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >

                                    <div className="fee-tier-form-group fee-tier-country-field">
                                        <label>
                                            Country
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            value={
                                                countryId
                                            }
                                            disabled
                                        >
                                            <option value="">
                                                Select
                                                Country
                                            </option>

                                            {countries.map(
                                                (
                                                    country
                                                ) => (
                                                    <option
                                                        key={
                                                            country.id
                                                        }
                                                        value={
                                                            country.id
                                                        }
                                                    >
                                                        {
                                                            country.country_name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>


                                    <div className="fee-tier-edit-grid">

                                        <div className="fee-tier-form-group">
                                            <label>
                                                Age Group
                                                Label
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editForm.age_group_label
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditChange(
                                                        "age_group_label",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="e.g. Age 18 - 35"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>


                                        <div className="fee-tier-form-group">
                                            <label>
                                                Min Age
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    editForm.min_age
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditChange(
                                                        "min_age",
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


                                        <div className="fee-tier-form-group">
                                            <label>
                                                Max Age
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    editForm.max_age
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditChange(
                                                        "max_age",
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


                                        <div className="fee-tier-form-group">
                                            <label>
                                                Welfare Fund
                                                (NPR)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    editForm.welfare_fund_npr
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditChange(
                                                        "welfare_fund_npr",
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


                                        <div className="fee-tier-form-group">
                                            <label>
                                                SSF
                                                Contribution
                                                (NPR)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    editForm.ssf_contribution_npr
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditChange(
                                                        "ssf_contribution_npr",
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


                                        <div className="fee-tier-form-group">
                                            <label>
                                                Insurance
                                                Premium (NPR)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    editForm.insurance_premium_npr
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditChange(
                                                        "insurance_premium_npr",
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


                                        <div className="fee-tier-form-group">
                                            <label>
                                                Service Fee
                                                (NPR)
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    editForm.service_fee_npr
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditChange(
                                                        "service_fee_npr",
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


                                    <div className="fee-tier-form-buttons">

                                        <button
                                            type="button"
                                            className="fee-tier-cancel-btn"
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
                                            className="fee-tier-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPen />

                                            {saving
                                                ? "Saving..."
                                                : "Update Fee Tier"}
                                        </button>

                                    </div>

                                </form>

                            ) : (

                                /* ============================
                                   CREATE MULTIPLE
                                ============================ */

                                <form
                                    onSubmit={
                                        handleCreate
                                    }
                                >

                                    <div className="fee-tier-country-section">

                                        <div className="fee-tier-form-group">

                                            <label>
                                                Country
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                value={
                                                    countryId
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setCountryId(
                                                        e
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
                                                    Country
                                                </option>

                                                {countries.map(
                                                    (
                                                        country
                                                    ) => (
                                                        <option
                                                            key={
                                                                country.id
                                                            }
                                                            value={
                                                                country.id
                                                            }
                                                        >
                                                            {
                                                                country.country_name
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>


                                    <div className="fee-tier-items-list">

                                        {tierItems.map(
                                            (
                                                tier,
                                                index
                                            ) => (

                                                <div
                                                    className="fee-tier-item-row"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <div className="fee-tier-number">
                                                        {index +
                                                            1}
                                                    </div>


                                                    <div className="fee-tier-fields">

                                                        <div className="fee-tier-form-group fee-tier-label-field">
                                                            <label>
                                                                Age
                                                                Group
                                                                Label
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    tier.age_group_label
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleTierChange(
                                                                        index,
                                                                        "age_group_label",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. Age 18 - 35"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />
                                                        </div>


                                                        <div className="fee-tier-form-group">
                                                            <label>
                                                                Min
                                                                Age
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    tier.min_age
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleTierChange(
                                                                        index,
                                                                        "min_age",
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


                                                        <div className="fee-tier-form-group">
                                                            <label>
                                                                Max
                                                                Age
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    tier.max_age
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleTierChange(
                                                                        index,
                                                                        "max_age",
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


                                                        <div className="fee-tier-form-group">
                                                            <label>
                                                                Welfare
                                                                Fund
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    tier.welfare_fund_npr
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleTierChange(
                                                                        index,
                                                                        "welfare_fund_npr",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="NPR"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />
                                                        </div>


                                                        <div className="fee-tier-form-group">
                                                            <label>
                                                                SSF
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    tier.ssf_contribution_npr
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleTierChange(
                                                                        index,
                                                                        "ssf_contribution_npr",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="NPR"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />
                                                        </div>


                                                        <div className="fee-tier-form-group">
                                                            <label>
                                                                Insurance
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    tier.insurance_premium_npr
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleTierChange(
                                                                        index,
                                                                        "insurance_premium_npr",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="NPR"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />
                                                        </div>


                                                        <div className="fee-tier-form-group">
                                                            <label>
                                                                Service
                                                                Fee
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    tier.service_fee_npr
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleTierChange(
                                                                        index,
                                                                        "service_fee_npr",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="NPR"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />
                                                        </div>


                                                        <div className="fee-tier-form-group">
                                                            <label>
                                                                Total
                                                            </label>

                                                            <div className="fee-tier-total-preview">
                                                                NPR{" "}
                                                                {getTotal(
                                                                    tier
                                                                ).toLocaleString()}
                                                            </div>
                                                        </div>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="fee-tier-remove-btn"
                                                        onClick={() =>
                                                            removeTierRow(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            tierItems.length ===
                                                                1 ||
                                                            saving
                                                        }
                                                        title="Remove Fee Tier"
                                                    >
                                                        <FaTimes />
                                                    </button>

                                                </div>
                                            )
                                        )}

                                    </div>


                                    <div className="fee-tier-create-actions">

                                        <button
                                            type="button"
                                            className="fee-tier-add-more-btn"
                                            onClick={
                                                addTierRow
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />
                                            Add Fee Tier
                                        </button>


                                        <button
                                            type="submit"
                                            className="fee-tier-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Fee Tiers"}
                                        </button>

                                    </div>

                                </form>
                            )}

                        </div>


                        {/* =====================================
                            TABLE
                        ===================================== */}

                        <div className="fee-tier-table-card">

                            <div className="fee-tier-card-header">
                                <h2>
                                    All Permit Fee Tiers
                                </h2>
                            </div>


                            {loading ? (

                                <div className="fee-tier-empty">
                                    Loading fee
                                    tiers...
                                </div>

                            ) : feeTiers.length === 0 ? (

                                <div className="fee-tier-empty">
                                    No permit fee
                                    tiers found.
                                </div>

                            ) : (
                                <>

                                    <div className="fee-tier-table-wrapper">

                                        <table className="fee-tier-table">

                                            <thead>
                                                <tr>
                                                    <th>
                                                        S.N.
                                                    </th>

                                                    <th>
                                                        Country
                                                    </th>

                                                    <th>
                                                        Age
                                                        Group
                                                    </th>

                                                    <th>
                                                        Age
                                                        Range
                                                    </th>

                                                    <th>
                                                        Welfare
                                                    </th>

                                                    <th>
                                                        SSF
                                                    </th>

                                                    <th>
                                                        Insurance
                                                    </th>

                                                    <th>
                                                        Service
                                                        Fee
                                                    </th>

                                                    <th>
                                                        Total
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

                                                {feeTiers.map(
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
                                                                <span className="fee-tier-country-name">
                                                                    {tier
                                                                        .country
                                                                        ?.country_name ||
                                                                        tier.country_name ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>


                                                            <td>
                                                                {
                                                                    tier.age_group_label
                                                                }
                                                            </td>


                                                            <td>
                                                                <span className="fee-tier-age">
                                                                    {
                                                                        tier.min_age
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        tier.max_age
                                                                    }
                                                                </span>
                                                            </td>


                                                            <td>
                                                                NPR{" "}
                                                                {Number(
                                                                    tier.welfare_fund_npr ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </td>


                                                            <td>
                                                                NPR{" "}
                                                                {Number(
                                                                    tier.ssf_contribution_npr ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </td>


                                                            <td>
                                                                NPR{" "}
                                                                {Number(
                                                                    tier.insurance_premium_npr ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </td>


                                                            <td>
                                                                NPR{" "}
                                                                {Number(
                                                                    tier.service_fee_npr ||
                                                                        0
                                                                ).toLocaleString()}
                                                            </td>


                                                            <td>
                                                                <strong className="fee-tier-total">
                                                                    NPR{" "}
                                                                    {Number(
                                                                        tier.total_cost_npr ||
                                                                            getTotal(
                                                                                tier
                                                                            )
                                                                    ).toLocaleString()}
                                                                </strong>
                                                            </td>


                                                            <td>
                                                                <span
                                                                    className={`fee-tier-status ${
                                                                        tier.status ===
                                                                        "ACTIVE"
                                                                            ? "fee-tier-status-active"
                                                                            : "fee-tier-status-inactive"
                                                                    } ${
                                                                        changingStatusId ===
                                                                        tier.id
                                                                            ? "fee-tier-status-changing"
                                                                            : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (
                                                                            changingStatusId !==
                                                                            tier.id
                                                                        ) {
                                                                            handleStatusChange(
                                                                                tier
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {changingStatusId ===
                                                                    tier.id
                                                                        ? "UPDATING..."
                                                                        : tier.status}
                                                                </span>
                                                            </td>


                                                            <td>
                                                                <div className="fee-tier-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="fee-tier-edit-btn"
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
                                                                        className="fee-tier-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                tier.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            deletingId ===
                                                                            tier.id
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


export default FeeTier;