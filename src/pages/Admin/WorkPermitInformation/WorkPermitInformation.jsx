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
    getAllWorkPermitInformationCms,
    createWorkPermitInformation,
    updateWorkPermitInformation,
    changeWorkPermitInformationStatus,
    deleteWorkPermitInformation,
    getAllCountries,
} from "../../../api/BackendApi";

import "./WorkPermitInformation.css";


// ==========================================
// INFORMATION TYPES
// ==========================================

const INFORMATION_TYPES = [
    {
        value: "POLICY",
        label: "Policy",
    },
    {
        value: "TERMS_CONDITION",
        label: "Terms & Conditions",
    },
    {
        value: "INCLUDED",
        label: "What's Included",
    },
];


// ==========================================
// EMPTY ITEM
// ==========================================

const emptyItem = (order = 0) => ({
    content: "",
    display_order: order,
});


const WorkPermitInformation = () => {

    // ==========================================
    // DATA
    // ==========================================

    const [information, setInformation] = useState([]);
    const [countries, setCountries] = useState([]);

    // ==========================================
    // CREATE FORM
    // ==========================================

    const [countryId, setCountryId] = useState("");
    const [informationType, setInformationType] = useState("");

    const [items, setItems] = useState([
        emptyItem(0),
    ]);

    // ==========================================
    // EDIT FORM
    // ==========================================

    const [editingId, setEditingId] = useState(null);

    const [editContent, setEditContent] = useState("");
    const [editDisplayOrder, setEditDisplayOrder] = useState(0);

    // ==========================================
    // LOADING
    // ==========================================

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [statusUpdatingId, setStatusUpdatingId] =
        useState(null);

    // ==========================================
    // PAGINATION
    // ==========================================

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        fetchCountries();
    }, []);


    useEffect(() => {
        fetchInformation();
    }, [page]);


    // ==========================================
    // FETCH INFORMATION
    // ==========================================

    const fetchInformation = async () => {

        try {

            setLoading(true);

            const response =
                await getAllWorkPermitInformationCms(page);

            if (response.data?.status) {

                setInformation(
                    response.data.data?.data || []
                );

                setTotalPages(
                    response.data.data?.last_page || 1
                );
            }

        } catch (error) {

            console.error(
                "Work permit information fetch error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load work permit information.",
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

            const response =
                await getAllCountries();

            if (response.data?.status) {

                const responseData =
                    response.data.data;

                // Supports normal array and Laravel pagination
                const countryList =
                    Array.isArray(responseData)
                        ? responseData
                        : responseData?.data || [];

                setCountries(countryList);
            }

        } catch (error) {

            console.error(
                "Country fetch error:",
                error
            );

            setCountries([]);
        }
    };


    // ==========================================
    // ADD ITEM
    // ==========================================

    const addItem = () => {

        setItems((previous) => [
            ...previous,
            emptyItem(previous.length),
        ]);
    };


    // ==========================================
    // REMOVE ITEM
    // ==========================================

    const removeItem = (index) => {

        if (items.length === 1) {
            return;
        }

        const updated = items
            .filter((_, i) => i !== index)
            .map((item, i) => ({
                ...item,
                display_order: i,
            }));

        setItems(updated);
    };


    // ==========================================
    // ITEM CHANGE
    // ==========================================

    const handleItemChange = (
        index,
        field,
        value
    ) => {

        setItems((previous) =>
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
        setInformationType("");

        setItems([
            emptyItem(0),
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


        if (!informationType) {

            Swal.fire({
                icon: "warning",
                title: "Type Required",
                text: "Please select an information type.",
                confirmButtonColor: "#351255",
            });

            return;
        }


        for (let i = 0; i < items.length; i++) {

            if (!items[i].content.trim()) {

                Swal.fire({
                    icon: "warning",
                    title: "Content Required",
                    text: `Enter content for item ${i + 1}.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }


        const payload = {

            country_id:
                Number(countryId),

            type:
                informationType,

            items:
                items.map((item, index) => ({

                    content:
                        item.content.trim(),

                    display_order:
                        item.display_order === ""
                            ? index
                            : Number(
                                  item.display_order
                              ),
                })),
        };


        try {

            setSaving(true);

            const response =
                await createWorkPermitInformation(
                    payload
                );


            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Created",
                    text:
                        response.data.message ||
                        "Work permit information created successfully.",
                    confirmButtonColor: "#351255",
                });


                resetCreateForm();


                if (page !== 1) {

                    setPage(1);

                } else {

                    await fetchInformation();
                }
            }

        } catch (error) {

            console.error(
                "Create work permit information error:",
                error
            );


            let message =
                error.response?.data?.message ||
                "Unable to create work permit information.";


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

    const handleEdit = (item) => {

        setEditingId(item.id);

        setCountryId(
            String(item.country_id || "")
        );

        setInformationType(
            item.type || ""
        );

        setEditContent(
            item.content || ""
        );

        setEditDisplayOrder(
            item.display_order ?? 0
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
        setInformationType("");

        setEditContent("");
        setEditDisplayOrder(0);
    };


    // ==========================================
    // UPDATE
    // ==========================================

    const handleUpdate = async (e) => {

        e.preventDefault();


        if (
            !countryId ||
            !informationType ||
            !editContent.trim()
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

            type:
                informationType,

            content:
                editContent.trim(),

            display_order:
                Number(editDisplayOrder) || 0,
        };


        try {

            setSaving(true);


            const response =
                await updateWorkPermitInformation(
                    editingId,
                    payload
                );


            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text:
                        response.data.message ||
                        "Work permit information updated successfully.",
                    confirmButtonColor: "#351255",
                });


                cancelEdit();

                await fetchInformation();
            }

        } catch (error) {

            console.error(
                "Update work permit information error:",
                error
            );


            let message =
                error.response?.data?.message ||
                "Unable to update work permit information.";


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

    const handleStatusChange = async (item) => {

        if (statusUpdatingId === item.id) {
            return;
        }


        const newStatus =
            item.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";


        const result = await Swal.fire({
            icon: "warning",
            title: "Change Status?",
            text: `Are you sure you want to change this information to ${newStatus}?`,
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

            setStatusUpdatingId(item.id);


            const response =
                await changeWorkPermitInformationStatus(
                    item.id
                );


            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data.message ||
                        `Status changed to ${newStatus}.`,
                    confirmButtonColor: "#351255",
                });


                await fetchInformation();
            }

        } catch (error) {

            console.error(
                "Status change error:",
                error
            );


            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change status.",
                confirmButtonColor: "#351255",
            });

        } finally {

            setStatusUpdatingId(null);
        }
    };


    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (item) => {

        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Information?",
            text:
                "This work permit information will be permanently deleted.",
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
                await deleteWorkPermitInformation(
                    item.id
                );


            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Work permit information deleted successfully.",
                    confirmButtonColor: "#351255",
                });


                if (editingId === item.id) {
                    cancelEdit();
                }


                await fetchInformation();
            }

        } catch (error) {

            console.error(
                "Delete work permit information error:",
                error
            );


            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete work permit information.",
                confirmButtonColor: "#351255",
            });
        }
    };


    // ==========================================
    // TYPE LABEL
    // ==========================================

    const getTypeLabel = (value) => {

        return (
            INFORMATION_TYPES.find(
                (type) =>
                    type.value === value
            )?.label || value
        );
    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="dashboard-layout">

            <Sidebar />


            <div className="dashboard-main">

                <Navbar />


                <main className="dashboard-content">

                    <div className="work-permit-info-page">


                        {/* HEADER */}

                        <div className="work-permit-info-header">

                            <h1>
                                Work Permit Information
                            </h1>

                            <p>
                                Manage policies, terms and conditions,
                                and included services by country.
                            </p>

                        </div>


                        {/* FORM CARD */}

                        <div className="work-permit-info-form-card">


                            <div className="work-permit-info-card-header">

                                <h2>
                                    {editingId
                                        ? "Edit Work Permit Information"
                                        : "Add Work Permit Information"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected information."
                                        : "Add one or multiple information items for a country and type."}
                                </p>

                            </div>


                            {editingId ? (

                                /* =====================================
                                   EDIT
                                ====================================== */

                                <form
                                    className="work-permit-info-form"
                                    onSubmit={handleUpdate}
                                >


                                    <div className="work-permit-info-form-group">

                                        <label>
                                            Country
                                            <span className="required">
                                                *
                                            </span>
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


                                            {countries.map(
                                                (country) => (

                                                    <option
                                                        key={
                                                            country.id
                                                        }
                                                        value={String(
                                                            country.id
                                                        )}
                                                    >
                                                        {
                                                            country.country_name
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="work-permit-info-form-group">

                                        <label>
                                            Type
                                            <span className="required">
                                                *
                                            </span>
                                        </label>


                                        <select
                                            value={
                                                informationType
                                            }
                                            onChange={(e) =>
                                                setInformationType(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select Type
                                            </option>


                                            {INFORMATION_TYPES.map(
                                                (type) => (

                                                    <option
                                                        key={
                                                            type.value
                                                        }
                                                        value={
                                                            type.value
                                                        }
                                                    >
                                                        {
                                                            type.label
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="work-permit-info-form-group work-permit-info-content-field">

                                        <label>
                                            Content
                                            <span className="required">
                                                *
                                            </span>
                                        </label>


                                        <textarea
                                            value={
                                                editContent
                                            }
                                            onChange={(e) =>
                                                setEditContent(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter information..."
                                            rows="3"
                                        />

                                    </div>


                                    <div className="work-permit-info-form-group work-permit-info-order-field">

                                        <label>
                                            Order
                                        </label>


                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                editDisplayOrder
                                            }
                                            onChange={(e) =>
                                                setEditDisplayOrder(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    <div className="work-permit-info-form-buttons">

                                        <button
                                            type="button"
                                            className="work-permit-info-cancel-btn"
                                            onClick={
                                                cancelEdit
                                            }
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            type="submit"
                                            className="work-permit-info-save-btn"
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

                                /* =====================================
                                   CREATE
                                ====================================== */

                                <form
                                    onSubmit={handleCreate}
                                >


                                    <div className="work-permit-info-country-section">


                                        <div className="work-permit-info-form-group">

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
                                                onChange={(e) =>
                                                    setCountryId(
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Select Country
                                                </option>


                                                {countries.map(
                                                    (country) => (

                                                        <option
                                                            key={
                                                                country.id
                                                            }
                                                            value={String(
                                                                country.id
                                                            )}
                                                        >
                                                            {
                                                                country.country_name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div className="work-permit-info-form-group">

                                            <label>
                                                Type
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>


                                            <select
                                                value={
                                                    informationType
                                                }
                                                onChange={(e) =>
                                                    setInformationType(
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="">
                                                    Select Type
                                                </option>


                                                {INFORMATION_TYPES.map(
                                                    (type) => (

                                                        <option
                                                            key={
                                                                type.value
                                                            }
                                                            value={
                                                                type.value
                                                            }
                                                        >
                                                            {
                                                                type.label
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                    </div>


                                    {/* ITEMS */}

                                    <div className="work-permit-info-items-list">


                                        {items.map(
                                            (item, index) => (

                                                <div
                                                    className="work-permit-info-item-row"
                                                    key={index}
                                                >


                                                    <div className="work-permit-info-number">
                                                        {index + 1}
                                                    </div>


                                                    <div className="work-permit-info-form-group work-permit-info-content-field">

                                                        <label>
                                                            Content
                                                            <span className="required">
                                                                *
                                                            </span>
                                                        </label>


                                                        <textarea
                                                            value={
                                                                item.content
                                                            }
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "content",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Enter policy, terms, or included information..."
                                                            rows="3"
                                                        />

                                                    </div>


                                                    <div className="work-permit-info-form-group work-permit-info-order-field">

                                                        <label>
                                                            Order
                                                        </label>


                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                item.display_order
                                                            }
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "display_order",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="work-permit-info-remove-btn"
                                                        disabled={
                                                            items.length ===
                                                            1
                                                        }
                                                        onClick={() =>
                                                            removeItem(
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


                                    <div className="work-permit-info-create-actions">


                                        <button
                                            type="button"
                                            className="work-permit-info-add-more-btn"
                                            onClick={addItem}
                                        >

                                            <FaPlus />

                                            Add Item

                                        </button>


                                        <button
                                            type="submit"
                                            className="work-permit-info-save-btn"
                                            disabled={saving}
                                        >

                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Information"}

                                        </button>


                                    </div>


                                </form>

                            )}


                        </div>


                        {/* =====================================
                            TABLE
                        ====================================== */}

                        <div className="work-permit-info-table-card">


                            <div className="work-permit-info-card-header">

                                <h2>
                                    Work Permit Information
                                </h2>

                                <p>
                                    View and manage all work permit
                                    information.
                                </p>

                            </div>


                            {loading ? (

                                <div className="work-permit-info-empty">
                                    Loading...
                                </div>

                            ) : information.length === 0 ? (

                                <div className="work-permit-info-empty">
                                    No work permit information found.
                                </div>

                            ) : (

                                <>

                                    <div className="work-permit-info-table-wrapper">


                                        <table className="work-permit-info-table">


                                            <thead>

                                                <tr>

                                                    <th>S.N.</th>

                                                    <th>
                                                        Country
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


                                                {information.map(
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
                                                                {(page -
                                                                    1) *
                                                                    10 +
                                                                    index +
                                                                    1}
                                                            </td>


                                                            <td>

                                                                <span className="work-permit-info-country-name">

                                                                    {item
                                                                        .country
                                                                        ?.country_name ||
                                                                        "N/A"}

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <span className="work-permit-info-type">

                                                                    {getTypeLabel(
                                                                        item.type
                                                                    )}

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <div className="work-permit-info-content">

                                                                    {
                                                                        item.content
                                                                    }

                                                                </div>

                                                            </td>


                                                            <td>

                                                                <span className="work-permit-info-order">

                                                                    {item.display_order ??
                                                                        0}

                                                                </span>

                                                            </td>


                                                            {/* CLICKABLE STATUS */}

                                                            <td>

                                                                <span
                                                                    className={`work-permit-info-status ${
                                                                        item.status ===
                                                                        "ACTIVE"
                                                                            ? "active"
                                                                            : "inactive"
                                                                    } ${
                                                                        statusUpdatingId ===
                                                                        item.id
                                                                            ? "updating"
                                                                            : ""
                                                                    }`}
                                                                    onClick={() => {

                                                                        if (
                                                                            statusUpdatingId !==
                                                                            item.id
                                                                        ) {

                                                                            handleStatusChange(
                                                                                item
                                                                            );
                                                                        }
                                                                    }}
                                                                    role="button"
                                                                    tabIndex={
                                                                        statusUpdatingId ===
                                                                        item.id
                                                                            ? -1
                                                                            : 0
                                                                    }
                                                                    title="Click to change status"
                                                                >

                                                                    {statusUpdatingId ===
                                                                    item.id
                                                                        ? "UPDATING..."
                                                                        : item.status}

                                                                </span>

                                                            </td>


                                                            {/* ACTIONS */}

                                                            <td>

                                                                <div className="work-permit-info-actions">


                                                                    <button
                                                                        type="button"
                                                                        className="work-permit-info-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                item
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >

                                                                        <FaPen />

                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        className="work-permit-info-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                item
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
                                            totalPages={
                                                totalPages
                                            }
                                            onPageChange={
                                                setPage
                                            }
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


export default WorkPermitInformation;