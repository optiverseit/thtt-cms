import { useEffect, useState } from "react";
import { FaPen, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

import {
    getCountriesCms,
    createCountry,
    updateCountry,
    deleteCountry,
    changeCountryStatus,
} from "../../../api/BackendApi";

import "./Country.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const initialFormData = {
    country_code: "",
    country_name: "",
    iso_2: "",
    flag_code: "",
    short_description: "",
    processing_days: "",
    display_order: 0,
};

const Country = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCountries, setTotalCountries] = useState(0);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Form
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [changingStatusId, setChangingStatusId] = useState(null);

    // ============================
    // FETCH COUNTRIES
    // ============================

    const fetchCountries = async () => {
        try {
            setLoading(true);

            const response = await getCountriesCms(page);

            if (response.data?.status) {
                const responseData = response.data.data;

                // Laravel paginated response
                if (
                    responseData &&
                    !Array.isArray(responseData) &&
                    Array.isArray(responseData.data)
                ) {
                    setCountries(responseData.data || []);
                    setTotalPages(responseData.last_page || 1);
                    setTotalCountries(responseData.total || 0);
                }

                // Non-paginated response
                else if (Array.isArray(responseData)) {
                    setCountries(responseData);
                    setTotalPages(1);
                    setTotalCountries(responseData.length);
                } else {
                    setCountries([]);
                    setTotalPages(1);
                    setTotalCountries(0);
                }
            }
        } catch (error) {
            console.error("Country fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch countries.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, [page]);

    // ============================
    // CREATE MODAL
    // ============================

    const openCreateModal = () => {
        setModalMode("create");
        setSelectedCountry(null);
        setFormData(initialFormData);
        setErrors({});
        setModalOpen(true);
    };

    // ============================
    // EDIT MODAL
    // ============================

    const openEditModal = (country) => {
        setModalMode("edit");
        setSelectedCountry(country);
        setErrors({});

        setFormData({
            country_code: country.country_code || "",
            country_name: country.country_name || "",
            iso_2: country.iso_2 || "",
            flag_code: country.flag_code || "",
            short_description: country.short_description || "",
            processing_days: country.processing_days ?? "",
            display_order: country.display_order ?? 0,
        });

        setModalOpen(true);
    };

    // ============================
    // CLOSE MODAL
    // ============================

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setModalOpen(false);
        setSelectedCountry(null);
        setFormData(initialFormData);
        setErrors({});
    };

    // ============================
    // INPUT CHANGE
    // ============================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((previous) => ({
                ...previous,
                [name]: null,
            }));
        }
    };

    // ============================
    // CREATE / UPDATE
    // ============================

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setErrors({});

            const payload = {
                country_code: formData.country_code.trim(),
                country_name: formData.country_name.trim(),

                iso_2:
                    formData.iso_2.trim() !== ""
                        ? formData.iso_2.trim()
                        : null,

                flag_code:
                    formData.flag_code.trim() !== ""
                        ? formData.flag_code.trim()
                        : null,

                short_description:
                    formData.short_description.trim() !== ""
                        ? formData.short_description.trim()
                        : null,

                processing_days:
                    formData.processing_days === ""
                        ? null
                        : Number(formData.processing_days),

                display_order:
                    formData.display_order === ""
                        ? 0
                        : Number(formData.display_order),
            };

            let response;

            if (modalMode === "create") {
                response = await createCountry(payload);
            } else {
                response = await updateCountry(
                    selectedCountry.id,
                    payload
                );
            }

            if (response.data?.status) {
                setModalOpen(false);
                setSelectedCountry(null);
                setFormData(initialFormData);
                setErrors({});

                await Swal.fire({
                    icon: "success",
                    title:
                        modalMode === "create"
                            ? "Country Created"
                            : "Country Updated",
                    text:
                        response.data?.message ||
                        (modalMode === "create"
                            ? "Country created successfully."
                            : "Country updated successfully."),
                    confirmButtonColor: "#351255",
                });

                fetchCountries();
            }
        } catch (error) {
            console.error("Country submit error:", error);

            if (
                error.response?.status === 422 &&
                error.response?.data?.errors
            ) {
                setErrors(error.response.data.errors);
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Something went wrong.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ============================
    // DELETE
    // ============================

    const handleDelete = async (country) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Country?",
            text: `Are you sure you want to delete "${country.country_name}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await deleteCountry(country.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Country deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                // If last item on current page was deleted,
                // move back one page if possible.
                if (countries.length === 1 && page > 1) {
                    setPage((previous) => previous - 1);
                } else {
                    fetchCountries();
                }
            }
        } catch (error) {
            console.error("Country delete error:", error);

            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete country.",
                confirmButtonColor: "#351255",
            });
        }
    };

    const handleStatusChange = async (country) => {
        // Prevent multiple clicks
        if (changingStatusId === country.id) {
            return;
        }

        const newStatus =
            country.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        const result = await Swal.fire({
            icon: "question",
            title: "Change Status?",
            text: `Are you sure you want to change ${country.country_name} from ${country.status} to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: `Yes, make ${newStatus}`,
            cancelButtonText: "Cancel",
            confirmButtonColor:
                newStatus === "ACTIVE" ? "#18794e" : "#b42345",
            cancelButtonColor: "#6b7280",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            // Lock badge after confirmation
            setChangingStatusId(country.id);

            const response = await changeCountryStatus(country.id);

            if (response.data?.status) {
                setCountries((previous) =>
                    previous.map((item) =>
                        item.id === country.id
                            ? {
                                ...item,
                                status: response.data.data.status,
                            }
                            : item
                    )
                );

                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        "Country status changed successfully.",
                    confirmButtonColor: "#351255",
                });
            }
        } catch (error) {
            console.error("Country status change error:", error);

            await Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change country status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            // Unlock after request finishes
            setChangingStatusId(null);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="country-page">

                        {/* ============================
                            HEADER
                        ============================ */}

                        <div className="country-header">
                            <div>
                                <h1>Countries</h1>

                                <p>
                                    Manage countries available for work
                                    permit applications.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="country-create-button"
                                onClick={openCreateModal}
                            >
                                <span>+</span>
                                Create Country
                            </button>
                        </div>

                        {/* ============================
                            TABLE CARD
                        ============================ */}

                        <div className="country-table-card">
                            <div className="country-table-header">
                                <div>
                                    <h2>Country List</h2>

                                    <p>
                                        {totalCountries}{" "}
                                        {totalCountries === 1
                                            ? "country"
                                            : "countries"}
                                    </p>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="country-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Code</th>
                                            <th>Country</th>
                                            <th>ISO 2</th>
                                            <th>Flag Code</th>
                                            <th>Description</th>
                                            <th>Processing Days</th>
                                            <th>Order</th>
                                            <th>Status</th>
                                            <th className="action-column">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="10"
                                                    className="table-message"
                                                >
                                                    <div className="country-loader"></div>
                                                    Loading countries...
                                                </td>
                                            </tr>
                                        ) : countries.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="10"
                                                    className="table-message"
                                                >
                                                    No countries found.
                                                </td>
                                            </tr>
                                        ) : (
                                            countries.map(
                                                (country, index) => (
                                                    <tr key={country.id}>
                                                        <td>
                                                            {(page - 1) *
                                                                10 +
                                                                index +
                                                                1}
                                                        </td>

                                                        <td>
                                                            <span className="country-code">
                                                                {country.country_code ||
                                                                    "-"}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className="country-name">
                                                                {country.country_name ||
                                                                    "-"}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {country.iso_2 ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {country.flag_code ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            <div className="country-description">
                                                                {country.short_description ||
                                                                    "-"}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {country.processing_days ??
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {country.display_order ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`status-badge ${country.status === "ACTIVE"
                                                                        ? "status-active"
                                                                        : "status-inactive"
                                                                    } ${changingStatusId === country.id
                                                                        ? "status-changing"
                                                                        : ""
                                                                    }`}
                                                                onClick={() => {
                                                                    if (changingStatusId !== country.id) {
                                                                        handleStatusChange(country);
                                                                    }
                                                                }}
                                                                title="Click to change status"
                                                            >
                                                                {changingStatusId === country.id
                                                                    ? "UPDATING..."
                                                                    : country.status || "-"}
                                                            </span>
                                                        </td>

                                                        <td className="action-column">
                                                            <div className="action-buttons">
                                                                <button
                                                                    type="button"
                                                                    className="edit-button"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            country
                                                                        )
                                                                    }
                                                                    title="Edit Country"
                                                                >
                                                                    <FaPen />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="delete-button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            country
                                                                        )
                                                                    }
                                                                    title="Delete Country"
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
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* ============================
                CREATE / EDIT MODAL
            ============================ */}

            {modalOpen && (
                <div
                    className="country-modal-overlay"
                    onMouseDown={closeModal}
                >
                    <div
                        className="country-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="country-modal-header">
                            <div>
                                <h2>
                                    {modalMode === "create"
                                        ? "Create Country"
                                        : "Edit Country"}
                                </h2>

                                <p>
                                    {modalMode === "create"
                                        ? "Add a new country for work permit applications."
                                        : `Update ${selectedCountry?.country_name ||
                                        "country"
                                        }.`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="country-modal-close"
                                onClick={closeModal}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form
                            className="country-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="country-form-grid">

                                {/* COUNTRY CODE */}

                                <div className="country-form-group">
                                    <label>
                                        Country Code *
                                    </label>

                                    <input
                                        type="text"
                                        name="country_code"
                                        value={
                                            formData.country_code
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. UAE"
                                    />

                                    {errors.country_code && (
                                        <span className="country-field-error">
                                            {
                                                errors
                                                    .country_code[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* COUNTRY NAME */}

                                <div className="country-form-group">
                                    <label>
                                        Country Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="country_name"
                                        value={
                                            formData.country_name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. United Arab Emirates"
                                    />

                                    {errors.country_name && (
                                        <span className="country-field-error">
                                            {
                                                errors
                                                    .country_name[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* ISO */}

                                <div className="country-form-group">
                                    <label>ISO 2</label>

                                    <input
                                        type="text"
                                        name="iso_2"
                                        value={formData.iso_2}
                                        onChange={
                                            handleInputChange
                                        }
                                        maxLength={2}
                                        placeholder="AE"
                                    />

                                    {errors.iso_2 && (
                                        <span className="country-field-error">
                                            {errors.iso_2[0]}
                                        </span>
                                    )}
                                </div>

                                {/* FLAG */}

                                <div className="country-form-group">
                                    <label>Flag Code</label>

                                    <input
                                        type="text"
                                        name="flag_code"
                                        value={
                                            formData.flag_code
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="AE"
                                    />

                                    {errors.flag_code && (
                                        <span className="country-field-error">
                                            {
                                                errors
                                                    .flag_code[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* PROCESSING DAYS */}

                                <div className="country-form-group">
                                    <label>
                                        Processing Days
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        name="processing_days"
                                        value={
                                            formData.processing_days
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="7"
                                    />

                                    {errors.processing_days && (
                                        <span className="country-field-error">
                                            {
                                                errors
                                                    .processing_days[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* DISPLAY ORDER */}

                                <div className="country-form-group">
                                    <label>
                                        Display Order
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        name="display_order"
                                        value={
                                            formData.display_order
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="0"
                                    />

                                    {errors.display_order && (
                                        <span className="country-field-error">
                                            {
                                                errors
                                                    .display_order[0]
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* DESCRIPTION */}

                                <div className="country-form-group country-form-full">
                                    <label>
                                        Short Description
                                    </label>

                                    <textarea
                                        name="short_description"
                                        value={
                                            formData.short_description
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        rows="4"
                                        placeholder="Enter a short description..."
                                    />

                                    {errors.short_description && (
                                        <span className="country-field-error">
                                            {
                                                errors
                                                    .short_description[0]
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* BUTTONS */}

                            <div className="country-modal-actions">
                                <button
                                    type="button"
                                    className="country-cancel-button"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="country-submit-button"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Saving..."
                                        : modalMode ===
                                            "create"
                                            ? "Create Country"
                                            : "Update Country"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Country;