import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllPricingTiersCms,
    getAllPackagesCms,
    createPricingTier,
    updatePricingTier,
    deletePricingTier,
} from "../../../api/BackendApi";

import "./PricingTier.css";

const PricingTier = () => {
    const [pricingTiers, setPricingTiers] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");
    const [service, setService] = useState("");
    const [ageGroup, setAgeGroup] = useState("");
    const [priceNpr, setPriceNpr] = useState("");
    const [priceUsd, setPriceUsd] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        fetchPricingTiers();
    }, [page]);

    const fetchPricingTiers = async () => {
        try {
            setLoading(true);

            const response = await getAllPricingTiersCms(page);

            if (response.data.status) {
                setPricingTiers(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
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
                    "Unable to load pricing tiers.",
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
                setPackages(response.data.data.data || []);
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
        setService("");
        setAgeGroup("");
        setPriceNpr("");
        setPriceUsd("");
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

        if (!service.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Service Required",
                text: "Please enter a service.",
                confirmButtonColor: "#351255",
            });
            return;
        }

        if (!ageGroup.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Age Group Required",
                text: "Please enter an age group.",
                confirmButtonColor: "#351255",
            });
            return;
        }

        if (priceNpr === "") {
            Swal.fire({
                icon: "warning",
                title: "NPR Price Required",
                text: "Please enter the price in NPR.",
                confirmButtonColor: "#351255",
            });
            return;
        }

        if (priceUsd === "") {
            Swal.fire({
                icon: "warning",
                title: "USD Price Required",
                text: "Please enter the price in USD.",
                confirmButtonColor: "#351255",
            });
            return;
        }

        const data = {
            service: service.trim(),
            age_group: ageGroup.trim(),
            price_npr: Number(priceNpr),
            price_usd: Number(priceUsd),
        };

        try {
            setSaving(true);

            let response;

            if (editingId) {
                response = await updatePricingTier(
                    editingId,
                    data
                );
            } else {
                response = await createPricingTier(
                    packageId,
                    data
                );
            }

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: editingId
                        ? "Pricing Tier Updated"
                        : "Pricing Tier Added",
                    text:
                        response.data.message ||
                        (editingId
                            ? "Pricing tier updated successfully."
                            : "Pricing tier added successfully."),
                    confirmButtonColor: "#351255",
                });

                resetForm();
                fetchPricingTiers();
            }
        } catch (error) {
            console.error(
                "Error saving pricing tier:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to save pricing tier.";

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

    const handleEdit = (tier) => {
        setEditingId(tier.id);

        setPackageId(
            tier.package_id?.toString() || ""
        );

        setService(tier.service || "");
        setAgeGroup(tier.age_group || "");

        setPriceNpr(
            tier.price_npr?.toString() || ""
        );

        setPriceUsd(
            tier.price_usd?.toString() || ""
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Pricing Tier?",
            text: "This pricing tier will be permanently deleted.",
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
            const response = await deletePricingTier(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Pricing tier deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    resetForm();
                }

                fetchPricingTiers();
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
                    "Unable to delete pricing tier.",
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
                    <div className="pricing-tier-page">
                        <div className="pricing-tier-header">
                            <h1>Package Pricing Tiers</h1>
                            <p>
                                Manage pricing tiers for packages.
                            </p>
                        </div>

                        <div className="pricing-tier-form-card">
                            <div className="pricing-tier-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Pricing Tier"
                                        : "Add Pricing Tier"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected pricing tier."
                                        : "Add a new pricing tier to a package."}
                                </p>
                            </div>

                            <form
                                className="pricing-tier-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="pricing-tier-form-group">
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
                                        disabled={editingId !== null}
                                    >
                                        <option value="">
                                            Select Package
                                        </option>

                                        {packages.map((pkg) => (
                                            <option
                                                key={pkg.id}
                                                value={pkg.id}
                                            >
                                                {pkg.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pricing-tier-form-group pricing-tier-service-field">
                                    <label>
                                        Service
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={service}
                                        onChange={(e) =>
                                            setService(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter service"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="pricing-tier-form-group pricing-tier-age-field">
                                    <label>
                                        Age Group
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={ageGroup}
                                        onChange={(e) =>
                                            setAgeGroup(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. Adult"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="pricing-tier-form-group pricing-tier-price-field">
                                    <label>
                                        Price NPR
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={priceNpr}
                                        onChange={(e) =>
                                            setPriceNpr(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="pricing-tier-form-group pricing-tier-price-field">
                                    <label>
                                        Price USD
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={priceUsd}
                                        onChange={(e) =>
                                            setPriceUsd(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="pricing-tier-form-buttons">
                                    {editingId && (
                                        <button
                                            type="button"
                                            className="pricing-tier-cancel-btn"
                                            onClick={resetForm}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="pricing-tier-save-btn"
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

                        <div className="pricing-tier-table-card">
                            <div className="pricing-tier-card-header">
                                <h2>All Pricing Tiers</h2>
                            </div>

                            {loading ? (
                                <div className="pricing-tier-empty">
                                    Loading pricing tiers...
                                </div>
                            ) : pricingTiers.length === 0 ? (
                                <div className="pricing-tier-empty">
                                    No pricing tiers found.
                                </div>
                            ) : (
                                <>
                                    <div className="pricing-tier-table-wrapper">
                                        <table className="pricing-tier-table">
                                            <thead>
                                                <tr>
                                                    <th>S.N.</th>
                                                    <th>Package</th>
                                                    <th>Service</th>
                                                    <th>Age Group</th>
                                                    <th>Price NPR</th>
                                                    <th>Price USD</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {pricingTiers.map(
                                                    (tier, index) => (
                                                        <tr key={tier.id}>
                                                            <td>
                                                                {(page - 1) *
                                                                    10 +
                                                                    index +
                                                                    1}
                                                            </td>

                                                            <td>
                                                                <span className="pricing-tier-package-name">
                                                                    {tier.package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {tier.service}
                                                            </td>

                                                            <td>
                                                                {
                                                                    tier.age_group
                                                                }
                                                            </td>

                                                            <td>
                                                                <span className="pricing-tier-price">
                                                                    NPR{" "}
                                                                    {
                                                                        tier.price_npr
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="pricing-tier-price">
                                                                    ${tier.price_usd}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="pricing-tier-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="pricing-tier-edit-btn"
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
                                                                        className="pricing-tier-delete-btn"
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
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Pagination
                                        page={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
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

export default PricingTier;