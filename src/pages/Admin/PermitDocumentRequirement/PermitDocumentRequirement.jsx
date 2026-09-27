import { useEffect, useState } from "react";
import {
    FaPlus,
    FaPen,
    FaTrash,
    FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllPermitDocumentRequirementsCms,
    createPermitDocumentRequirements,
    updatePermitDocumentRequirement,
    changePermitDocumentRequirementStatus,
    deletePermitDocumentRequirement,
    getAllCountries,
} from "../../../api/BackendApi";

import "./PermitDocumentRequirement.css";

const PERMIT_TYPES = [
    {
        value: "NEW_LABOUR_PERMIT",
        label: "New Labour Permit",
    },
    {
        value: "RENEWAL_PERMIT",
        label: "Renewal Permit",
    },
    {
        value: "INDIVIDUAL_PERMIT",
        label: "Individual Permit",
    },
    {
        value: "LEGALIZATION_ATTESTATION",
        label: "Legalization / Attestation",
    },
];

const emptyDocument = (order = 0) => ({
    document_type: "",
    title: "",
    description: "",
    is_required: true,
    display_order: order,
});

const PermitDocumentRequirement = () => {
    const [documents, setDocuments] = useState([]);
    const [countries, setCountries] = useState([]);

    const [countryId, setCountryId] = useState("");
    const [permitType, setPermitType] = useState("");

    const [documentItems, setDocumentItems] = useState([
        emptyDocument(0),
    ]);

    const [editingId, setEditingId] = useState(null);

    const [editDocumentType, setEditDocumentType] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editRequired, setEditRequired] = useState(true);
    const [editDisplayOrder, setEditDisplayOrder] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Keeps track of which status badge is currently updating
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // ==========================================
    // INITIAL DATA
    // ==========================================

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [page]);

    // ==========================================
    // FETCH DOCUMENTS - CMS
    // ==========================================

    const fetchDocuments = async () => {
        try {
            setLoading(true);

            const response =
                await getAllPermitDocumentRequirementsCms(page);

            if (response.data.status) {
                setDocuments(
                    response.data.data?.data || []
                );

                setTotalPages(
                    response.data.data?.last_page || 1
                );
            }
        } catch (error) {
            console.error(
                "Error fetching permit document requirements:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load permit document requirements.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FETCH COUNTRIES
    // ==========================================

    const fetchCountries = async () => {
        try {
            const response = await getAllCountries();

            if (response.data.status) {
                const responseData = response.data.data;

                const countryList = Array.isArray(responseData)
                    ? responseData
                    : responseData?.data || [];

                setCountries(countryList);
            }
        } catch (error) {
            console.error(
                "Error fetching countries:",
                error
            );

            setCountries([]);
        }
    };

    // ==========================================
    // ADD DOCUMENT ROW
    // ==========================================

    const addDocumentRow = () => {
        setDocumentItems((previous) => [
            ...previous,
            emptyDocument(previous.length),
        ]);
    };

    // ==========================================
    // REMOVE DOCUMENT ROW
    // ==========================================

    const removeDocumentRow = (index) => {
        if (documentItems.length === 1) {
            return;
        }

        const updated = documentItems
            .filter((_, i) => i !== index)
            .map((item, i) => ({
                ...item,
                display_order: i,
            }));

        setDocumentItems(updated);
    };

    // ==========================================
    // DOCUMENT FIELD CHANGE
    // ==========================================

    const handleDocumentChange = (
        index,
        field,
        value
    ) => {
        setDocumentItems((previous) =>
            previous.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };

    // ==========================================
    // RESET CREATE FORM
    // ==========================================

    const resetCreateForm = () => {
        setCountryId("");
        setPermitType("");

        setDocumentItems([
            emptyDocument(0),
        ]);
    };

    // ==========================================
    // CREATE
    // ==========================================

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

        if (!permitType) {
            Swal.fire({
                icon: "warning",
                title: "Permit Type Required",
                text: "Please select a permit type.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        for (let i = 0; i < documentItems.length; i++) {
            if (!documentItems[i].document_type.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Document Type Required",
                    text: `Enter document type for document ${i + 1}.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }

            if (!documentItems[i].title.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Title Required",
                    text: `Enter title for document ${i + 1}.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const payload = {
            country_id: Number(countryId),

            permit_type: permitType,

            documents: documentItems.map(
                (item, index) => ({
                    document_type:
                        item.document_type
                            .trim()
                            .toUpperCase()
                            .replace(/\s+/g, "_"),

                    title:
                        item.title.trim(),

                    description:
                        item.description?.trim() || null,

                    is_required:
                        Boolean(item.is_required),

                    display_order:
                        item.display_order === ""
                            ? index
                            : Number(item.display_order),
                })
            ),
        };

        try {
            setSaving(true);

            const response =
                await createPermitDocumentRequirements(
                    payload
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Created",
                    text:
                        response.data.message ||
                        "Permit document requirements created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();

                if (page !== 1) {
                    setPage(1);
                } else {
                    await fetchDocuments();
                }
            }
        } catch (error) {
            console.error(
                "Create document error:",
                error
            );

            let message =
                error.response?.data?.message ||
                "Unable to create permit document requirements.";

            const errors =
                error.response?.data?.errors;

            if (errors) {
                const first =
                    Object.values(errors)[0];

                if (Array.isArray(first)) {
                    message = first[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: message,
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // START EDIT
    // ==========================================

    const handleEdit = (document) => {
        setEditingId(document.id);

        setCountryId(
            String(document.country_id || "")
        );

        setPermitType(
            document.permit_type || ""
        );

        setEditDocumentType(
            document.document_type || ""
        );

        setEditTitle(
            document.title || ""
        );

        setEditDescription(
            document.description || ""
        );

        setEditRequired(
            Boolean(document.is_required)
        );

        setEditDisplayOrder(
            document.display_order ?? 0
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ==========================================
    // CANCEL EDIT
    // ==========================================

    const cancelEdit = () => {
        setEditingId(null);

        setCountryId("");
        setPermitType("");

        setEditDocumentType("");
        setEditTitle("");
        setEditDescription("");
        setEditRequired(true);
        setEditDisplayOrder(0);
    };

    // ==========================================
    // UPDATE
    // ==========================================

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (
            !countryId ||
            !permitType ||
            !editDocumentType.trim() ||
            !editTitle.trim()
        ) {
            Swal.fire({
                icon: "warning",
                title: "Required Fields",
                text: "Please complete all required fields.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const payload = {
            country_id:
                Number(countryId),

            permit_type:
                permitType,

            document_type:
                editDocumentType
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "_"),

            title:
                editTitle.trim(),

            description:
                editDescription.trim() || null,

            is_required:
                editRequired,

            display_order:
                Number(editDisplayOrder) || 0,
        };

        try {
            setSaving(true);

            const response =
                await updatePermitDocumentRequirement(
                    editingId,
                    payload
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text:
                        response.data.message ||
                        "Document requirement updated successfully.",
                    confirmButtonColor: "#351255",
                });

                cancelEdit();

                await fetchDocuments();
            }
        } catch (error) {
            let message =
                error.response?.data?.message ||
                "Unable to update document requirement.";

            const errors =
                error.response?.data?.errors;

            if (errors) {
                const first =
                    Object.values(errors)[0];

                if (Array.isArray(first)) {
                    message = first[0];
                }
            }

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: message,
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // CHANGE STATUS
    // ==========================================

    const handleStatusChange = async (document) => {
        // Prevent multiple clicks while this document is updating
        if (statusUpdatingId === document.id) {
            return;
        }

        const newStatus =
            document.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result = await Swal.fire({
            icon: "warning",
            title: "Change Status?",
            text: `Are you sure you want to change this document requirement to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#351255",
            cancelButtonColor: "#77717d",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            // Disable only this status badge
            setStatusUpdatingId(document.id);

            const response =
                await changePermitDocumentRequirementStatus(
                    document.id
                );

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        `Document requirement status changed to ${newStatus}.`,
                    confirmButtonColor: "#351255",
                });

                await fetchDocuments();
            }
        } catch (error) {
            console.error(
                "Document requirement status change error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change document requirement status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            // Enable badge again
            setStatusUpdatingId(null);
        }
    };

    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Requirement?",
            text: "This document requirement will be permanently deleted.",
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
            const response =
                await deletePermitDocumentRequirement(
                    id
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Document requirement deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    cancelEdit();
                }

                await fetchDocuments();
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete document requirement.",
                confirmButtonColor: "#351255",
            });
        }
    };

    // ==========================================
    // PERMIT LABEL
    // ==========================================

    const getPermitTypeLabel = (value) => {
        return (
            PERMIT_TYPES.find(
                (type) => type.value === value
            )?.label || value
        );
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="permit-document-page">

                        {/* HEADER */}

                        <div className="permit-document-header">
                            <h1>
                                Permit Document Requirements
                            </h1>

                            <p>
                                Manage required documents by country and permit type.
                            </p>
                        </div>

                        {/* FORM CARD */}

                        <div className="permit-document-form-card">

                            <div className="permit-document-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Document Requirement"
                                        : "Add Document Requirements"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected document requirement."
                                        : "Add one or multiple documents for a country and permit type."}
                                </p>
                            </div>

                            {editingId ? (

                                /* EDIT FORM */

                                <form
                                    className="permit-document-form"
                                    onSubmit={handleUpdate}
                                >

                                    <div className="permit-document-form-group">
                                        <label>
                                            Country
                                            <span className="required">*</span>
                                        </label>

                                        <select
                                            value={countryId}
                                            onChange={(e) =>
                                                setCountryId(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Select Country
                                            </option>

                                            {countries.map((country) => (
                                                <option
                                                    key={country.id}
                                                    value={String(country.id)}
                                                >
                                                    {country.country_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="permit-document-form-group">
                                        <label>
                                            Permit Type
                                            <span className="required">*</span>
                                        </label>

                                        <select
                                            value={permitType}
                                            onChange={(e) =>
                                                setPermitType(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Select Permit Type
                                            </option>

                                            {PERMIT_TYPES.map((type) => (
                                                <option
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="permit-document-form-group permit-document-type-field">
                                        <label>
                                            Document Type
                                            <span className="required">*</span>
                                        </label>

                                        <input
                                            value={editDocumentType}
                                            onChange={(e) =>
                                                setEditDocumentType(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="PASSPORT"
                                        />
                                    </div>

                                    <div className="permit-document-form-group permit-document-title-field">
                                        <label>
                                            Title
                                            <span className="required">*</span>
                                        </label>

                                        <input
                                            value={editTitle}
                                            onChange={(e) =>
                                                setEditTitle(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Original Passport"
                                        />
                                    </div>

                                    <div className="permit-document-form-group permit-document-description-field">
                                        <label>
                                            Description
                                        </label>

                                        <input
                                            value={editDescription}
                                            onChange={(e) =>
                                                setEditDescription(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Optional description"
                                        />
                                    </div>

                                    <div className="permit-document-form-group permit-document-order-field">
                                        <label>
                                            Order
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={editDisplayOrder}
                                            onChange={(e) =>
                                                setEditDisplayOrder(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <label className="permit-document-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={editRequired}
                                            onChange={(e) =>
                                                setEditRequired(
                                                    e.target.checked
                                                )
                                            }
                                        />

                                        Required
                                    </label>

                                    <div className="permit-document-form-buttons">
                                        <button
                                            type="button"
                                            className="permit-document-cancel-btn"
                                            onClick={cancelEdit}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="permit-document-save-btn"
                                            disabled={saving}
                                        >
                                            <FaPen />

                                            {saving
                                                ? "Saving..."
                                                : "Update"}
                                        </button>
                                    </div>

                                </form>

                            ) : (

                                /* CREATE FORM */

                                <form onSubmit={handleCreate}>

                                    <div className="permit-document-country-section">

                                        <div className="permit-document-form-group">
                                            <label>
                                                Country
                                                <span className="required">*</span>
                                            </label>

                                            <select
                                                value={countryId}
                                                onChange={(e) =>
                                                    setCountryId(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Country
                                                </option>

                                                {countries.map((country) => (
                                                    <option
                                                        key={country.id}
                                                        value={String(country.id)}
                                                    >
                                                        {country.country_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="permit-document-form-group">
                                            <label>
                                                Permit Type
                                                <span className="required">*</span>
                                            </label>

                                            <select
                                                value={permitType}
                                                onChange={(e) =>
                                                    setPermitType(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Permit Type
                                                </option>

                                                {PERMIT_TYPES.map((type) => (
                                                    <option
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>

                                    <div className="permit-document-items-list">

                                        {documentItems.map(
                                            (document, index) => (

                                                <div
                                                    className="permit-document-item-row"
                                                    key={index}
                                                >

                                                    <div className="permit-document-number">
                                                        {index + 1}
                                                    </div>

                                                    <div className="permit-document-form-group permit-document-type-field">
                                                        <label>
                                                            Document Type
                                                            <span className="required">*</span>
                                                        </label>

                                                        <input
                                                            value={
                                                                document.document_type
                                                            }
                                                            onChange={(e) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "document_type",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="PASSPORT"
                                                        />
                                                    </div>

                                                    <div className="permit-document-form-group permit-document-title-field">
                                                        <label>
                                                            Title
                                                            <span className="required">*</span>
                                                        </label>

                                                        <input
                                                            value={
                                                                document.title
                                                            }
                                                            onChange={(e) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "title",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Original Passport"
                                                        />
                                                    </div>

                                                    <div className="permit-document-form-group permit-document-description-field">
                                                        <label>
                                                            Description
                                                        </label>

                                                        <input
                                                            value={
                                                                document.description
                                                            }
                                                            onChange={(e) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "description",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Optional"
                                                        />
                                                    </div>

                                                    <div className="permit-document-form-group permit-document-order-field">
                                                        <label>
                                                            Order
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                document.display_order
                                                            }
                                                            onChange={(e) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "display_order",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <label className="permit-document-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                document.is_required
                                                            }
                                                            onChange={(e) =>
                                                                handleDocumentChange(
                                                                    index,
                                                                    "is_required",
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />

                                                        Required
                                                    </label>

                                                    <button
                                                        type="button"
                                                        className="permit-document-remove-btn"
                                                        disabled={
                                                            documentItems.length === 1
                                                        }
                                                        onClick={() =>
                                                            removeDocumentRow(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <FaTimes />
                                                    </button>

                                                </div>
                                            )
                                        )}

                                    </div>

                                    <div className="permit-document-create-actions">

                                        <button
                                            type="button"
                                            className="permit-document-add-more-btn"
                                            onClick={addDocumentRow}
                                        >
                                            <FaPlus />
                                            Add Document
                                        </button>

                                        <button
                                            type="submit"
                                            className="permit-document-save-btn"
                                            disabled={saving}
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Documents"}
                                        </button>

                                    </div>

                                </form>
                            )}

                        </div>

                        {/* TABLE */}

                        <div className="permit-document-table-card">

                            <div className="permit-document-card-header">
                                <h2>
                                    Permit Document Requirements
                                </h2>

                                <p>
                                    View and manage all document requirements.
                                </p>
                            </div>

                            {loading ? (

                                <div className="permit-document-empty">
                                    Loading...
                                </div>

                            ) : documents.length === 0 ? (

                                <div className="permit-document-empty">
                                    No document requirements found.
                                </div>

                            ) : (
                                <>
                                    <div className="permit-document-table-wrapper">

                                        <table className="permit-document-table">

                                            <thead>
                                                <tr>
                                                    <th>S.N.</th>
                                                    <th>Country</th>
                                                    <th>Permit Type</th>
                                                    <th>Document</th>
                                                    <th>Required</th>
                                                    <th>Order</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {documents.map(
                                                    (document, index) => (

                                                        <tr key={document.id}>

                                                            <td>
                                                                {(page - 1) * 10 +
                                                                    index +
                                                                    1}
                                                            </td>

                                                            <td>
                                                                <span className="permit-document-country-name">
                                                                    {document.country?.country_name ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {getPermitTypeLabel(
                                                                    document.permit_type
                                                                )}
                                                            </td>

                                                            <td>
                                                                <div className="permit-document-info">

                                                                    <strong>
                                                                        {document.title}
                                                                    </strong>

                                                                    <span>
                                                                        {document.document_type}
                                                                    </span>

                                                                    {document.description && (
                                                                        <small>
                                                                            {document.description}
                                                                        </small>
                                                                    )}

                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={
                                                                        document.is_required
                                                                            ? "permit-document-required"
                                                                            : "permit-document-optional"
                                                                    }
                                                                >
                                                                    {document.is_required
                                                                        ? "Required"
                                                                        : "Optional"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="permit-document-order">
                                                                    {document.display_order ?? 0}
                                                                </span>
                                                            </td>

                                                            {/* CLICKABLE STATUS BADGE */}
                                                            <td>
                                                                <span
                                                                    className={`permit-document-status ${
                                                                        document.status === "ACTIVE"
                                                                            ? "active"
                                                                            : "inactive"
                                                                    } ${
                                                                        statusUpdatingId === document.id
                                                                            ? "updating"
                                                                            : ""
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (
                                                                            statusUpdatingId !==
                                                                            document.id
                                                                        ) {
                                                                            handleStatusChange(
                                                                                document
                                                                            );
                                                                        }
                                                                    }}
                                                                    role="button"
                                                                    tabIndex={
                                                                        statusUpdatingId ===
                                                                        document.id
                                                                            ? -1
                                                                            : 0
                                                                    }
                                                                    title="Click to change status"
                                                                >
                                                                    {statusUpdatingId === document.id
                                                                        ? "UPDATING..."
                                                                        : document.status}
                                                                </span>
                                                            </td>

                                                            {/* ACTIONS - EDIT + DELETE ONLY */}
                                                            <td>
                                                                <div className="permit-document-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="permit-document-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                document
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="permit-document-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                document.id
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

                                    {totalPages > 1 && (
                                        <Pagination
                                            page={page}
                                            totalPages={totalPages}
                                            onPageChange={setPage}
                                        />
                                    )}
                                </>
                            )}

                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default PermitDocumentRequirement;