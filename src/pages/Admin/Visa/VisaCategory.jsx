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
    getAllVisaCategoriesCms,
    getCountries,
    createVisaCategories,
    updateVisaCategory,
    changeVisaCategoryStatus,
    deleteVisaCategory,
} from "../../../api/BackendApi";

import "./VisaCategory.css";

/* =========================================================
   EMPTY CATEGORY
========================================================= */

const createEmptyCategory = (order = 0) => ({
    name: "",
    short_description: "",
    description: "",
    processing_time: "",
    status: "ACTIVE",
    display_order: order,
    image: null,
    imagePreview: null,
});

/* =========================================================
   COMPONENT
========================================================= */

const VisaCategory = () => {

    /* =====================================================
       DATA
    ===================================================== */

    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);

    /* =====================================================
       CREATE FORM
    ===================================================== */

    const [countryId, setCountryId] = useState("");

    const [categoryItems, setCategoryItems] = useState([
        createEmptyCategory(0),
    ]);

    /* =====================================================
       EDIT FORM
    ===================================================== */

    const [editingId, setEditingId] = useState(null);

    const [editCountryId, setEditCountryId] = useState("");

    const [editForm, setEditForm] = useState({
        name: "",
        short_description: "",
        description: "",
        processing_time: "",
        status: "ACTIVE",
        display_order: 0,
        image: null,
        existingImage: null,
        imagePreview: null,
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
    const [totalCategories, setTotalCategories] = useState(0);

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [page]);

    /* =====================================================
       FETCH COUNTRIES
    ===================================================== */

    const fetchCountries = async () => {

        try {

            const response =
                await getCountries();

            console.log(
                "COUNTRIES RESPONSE:",
                response.data
            );

            if (response.data?.status) {

                /*
                 * Supports:
                 *
                 * data: [...]
                 *
                 * OR
                 *
                 * data: {
                 *     data: [...]
                 * }
                 */

                const countryData =
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : response.data.data?.data || [];

                setCountries(countryData);
            }

        } catch (error) {

            console.error(
                "Error fetching countries:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load countries.",
                confirmButtonColor: "#351255",
            });
        }
    };

    /* =====================================================
       FETCH VISA CATEGORIES
    ===================================================== */

    const fetchCategories = async () => {

        try {

            setLoading(true);

            const response =
                await getAllVisaCategoriesCms(page);

            console.log(
                "VISA CATEGORY CMS RESPONSE:",
                response.data
            );

            if (response.data?.status) {

                const responseData =
                    response.data.data;

                /*
                 * Pagination response
                 */

                if (
                    responseData &&
                    Array.isArray(responseData.data)
                ) {

                    setCategories(
                        responseData.data
                    );

                    setTotalPages(
                        responseData.last_page || 1
                    );

                    setTotalCategories(
                        responseData.total || 0
                    );

                } else {

                    /*
                     * Non-paginated fallback
                     */

                    const categoryData =
                        Array.isArray(responseData)
                            ? responseData
                            : [];

                    setCategories(categoryData);

                    setTotalPages(1);

                    setTotalCategories(
                        categoryData.length
                    );
                }
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

        } finally {

            setLoading(false);
        }
    };

    /* =====================================================
       CREATE - ADD ROW
    ===================================================== */

    const addCategoryRow = () => {

        setCategoryItems((previous) => [
            ...previous,
            createEmptyCategory(previous.length),
        ]);
    };

    /* =====================================================
       CREATE - REMOVE ROW
    ===================================================== */

    const removeCategoryRow = (index) => {

        if (categoryItems.length === 1) {
            return;
        }

        setCategoryItems((previous) =>
            previous
                .filter((_, i) => i !== index)
                .map((category, i) => ({
                    ...category,
                    display_order: i,
                }))
        );
    };

    /* =====================================================
       CREATE - FIELD CHANGE
    ===================================================== */

    const handleCategoryChange = (
        index,
        field,
        value
    ) => {

        setCategoryItems((previous) =>
            previous.map((category, i) =>
                i === index
                    ? {
                          ...category,
                          [field]: value,
                      }
                    : category
            )
        );
    };

    /* =====================================================
       CREATE - IMAGE
    ===================================================== */

    const handleCategoryImageChange = (
        index,
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

        if (!allowedTypes.includes(file.type)) {

            Swal.fire({
                icon: "warning",
                title: "Invalid Image",
                text:
                    "Only JPG, JPEG, PNG and WEBP images are allowed.",
                confirmButtonColor: "#351255",
            });

            event.target.value = "";

            return;
        }

        /*
         * Backend max: 5120 KB = 5 MB
         */

        if (file.size > 5 * 1024 * 1024) {

            Swal.fire({
                icon: "warning",
                title: "Image Too Large",
                text:
                    "Image must not exceed 5 MB.",
                confirmButtonColor: "#351255",
            });

            event.target.value = "";

            return;
        }

        const preview =
            URL.createObjectURL(file);

        setCategoryItems((previous) =>
            previous.map((category, i) =>
                i === index
                    ? {
                          ...category,
                          image: file,
                          imagePreview: preview,
                      }
                    : category
            )
        );
    };

    /* =====================================================
       RESET CREATE
    ===================================================== */

    const resetCreateForm = () => {

        setCountryId("");

        setCategoryItems([
            createEmptyCategory(0),
        ]);
    };

    /* =====================================================
       CREATE
    ===================================================== */

    const handleCreate = async (event) => {

        event.preventDefault();

        /* ---------------- COUNTRY ---------------- */

        if (!countryId) {

            Swal.fire({
                icon: "warning",
                title: "Country Required",
                text:
                    "Please select a country.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        /* ---------------- CATEGORY VALIDATION ---------------- */

        for (
            let i = 0;
            i < categoryItems.length;
            i++
        ) {

            if (!categoryItems[i].name.trim()) {

                Swal.fire({
                    icon: "warning",
                    title: "Category Name Required",
                    text:
                        `Please enter category name ${
                            i + 1
                        }.`,
                    confirmButtonColor:
                        "#351255",
                });

                return;
            }
        }

        /* =================================================
           FORM DATA

           Laravel expects:

           country_id

           categories[0][name]
           categories[0][short_description]
           categories[0][description]
           categories[0][image]
           categories[0][processing_time]
           categories[0][status]
           categories[0][display_order]
        ================================================= */

        const formData =
            new FormData();

        formData.append(
            "country_id",
            countryId
        );

        categoryItems.forEach(
            (category, index) => {

                formData.append(
                    `categories[${index}][name]`,
                    category.name.trim()
                );

                formData.append(
                    `categories[${index}][short_description]`,
                    category.short_description || ""
                );

                formData.append(
                    `categories[${index}][description]`,
                    category.description || ""
                );

                formData.append(
                    `categories[${index}][processing_time]`,
                    category.processing_time || ""
                );

                formData.append(
                    `categories[${index}][status]`,
                    category.status || "ACTIVE"
                );

                formData.append(
                    `categories[${index}][display_order]`,
                    category.display_order === ""
                        ? index
                        : Number(
                              category.display_order
                          )
                );

                /*
                 * Each category has its own image
                 */

                if (category.image) {

                    formData.append(
                        `categories[${index}][image]`,
                        category.image
                    );
                }
            }
        );

        try {

            setSaving(true);

            const response =
                await createVisaCategories(
                    formData
                );

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title:
                        "Visa Categories Added",
                    text:
                        response.data?.message ||
                        "Visa categories created successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                resetCreateForm();

                if (page !== 1) {
                    setPage(1);
                } else {
                    fetchCategories();
                }
            }

        } catch (error) {

            console.error(
                "Error creating visa categories:",
                error
            );

            showValidationError(
                error,
                "Unable to create visa categories."
            );

        } finally {

            setSaving(false);
        }
    };

    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (category) => {

        setEditingId(category.id);

        setEditCountryId(
            (
                category.country_id ||
                category.country?.id ||
                ""
            ).toString()
        );

        setEditForm({
            name:
                category.name || "",

            short_description:
                category.short_description || "",

            description:
                category.description || "",

            processing_time:
                category.processing_time || "",

            status:
                category.status || "ACTIVE",

            display_order:
                category.display_order ?? 0,

            image: null,

            existingImage:
                category.visa_image || null,

            imagePreview:
                category.visa_image || null,
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /* =====================================================
       EDIT FIELD
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
       EDIT IMAGE
    ===================================================== */

    const handleEditImageChange = (
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

        if (!allowedTypes.includes(file.type)) {

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

        if (file.size > 5 * 1024 * 1024) {

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

        setEditForm((previous) => ({
            ...previous,
            image: file,
            imagePreview:
                URL.createObjectURL(file),
        }));
    };

    /* =====================================================
       CANCEL EDIT
    ===================================================== */

    const cancelEdit = () => {

        setEditingId(null);

        setEditCountryId("");

        setEditForm({
            name: "",
            short_description: "",
            description: "",
            processing_time: "",
            status: "ACTIVE",
            display_order: 0,
            image: null,
            existingImage: null,
            imagePreview: null,
        });
    };

    /* =====================================================
       UPDATE
    ===================================================== */

    const handleUpdate = async (event) => {

        event.preventDefault();

        if (!editCountryId) {

            Swal.fire({
                icon: "warning",
                title: "Country Required",
                text:
                    "Please select a country.",
                confirmButtonColor:
                    "#351255",
            });

            return;
        }

        if (!editForm.name.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Category Name Required",
                text:
                    "Please enter the visa category name.",
                confirmButtonColor:
                    "#351255",
            });

            return;
        }

        /*
         * Image means update should also use FormData.
         */

        const formData =
            new FormData();

        formData.append(
            "country_id",
            editCountryId
        );

        formData.append(
            "name",
            editForm.name.trim()
        );

        formData.append(
            "short_description",
            editForm.short_description || ""
        );

        formData.append(
            "description",
            editForm.description || ""
        );

        formData.append(
            "processing_time",
            editForm.processing_time || ""
        );

        formData.append(
            "status",
            editForm.status
        );

        formData.append(
            "display_order",
            editForm.display_order === ""
                ? 0
                : Number(
                      editForm.display_order
                  )
        );

        if (editForm.image) {

            formData.append(
                "image",
                editForm.image
            );
        }

        try {

            setSaving(true);

            const response =
                await updateVisaCategory(
                    editingId,
                    formData
                );

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title:
                        "Visa Category Updated",
                    text:
                        response.data?.message ||
                        "Visa category updated successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                cancelEdit();

                fetchCategories();
            }

        } catch (error) {

            console.error(
                "Error updating visa category:",
                error
            );

            showValidationError(
                error,
                "Unable to update visa category."
            );

        } finally {

            setSaving(false);
        }
    };

    /* =====================================================
       CHANGE STATUS
    ===================================================== */

    const handleStatusChange = async (
        category
    ) => {

        const newStatus =
            category.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const result =
            await Swal.fire({

                icon: "question",

                title:
                    newStatus === "ACTIVE"
                        ? "Activate Category?"
                        : "Deactivate Category?",

                text:
                    newStatus === "ACTIVE"
                        ? "This visa category will become active."
                        : "This visa category will become inactive.",

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
                category.id
            );

            const response =
                await changeVisaCategoryStatus(
                    category.id,
                    newStatus
                );

            if (response.data?.status) {

                setCategories(
                    (previous) =>
                        previous.map(
                            (item) =>
                                item.id ===
                                category.id
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
                    title:
                        "Status Updated",
                    text:
                        response.data?.message ||
                        "Visa category status updated successfully.",
                    confirmButtonColor:
                        "#351255",
                });
            }

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to change category status.",
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
                    "Delete Visa Category?",

                text:
                    "This visa category will be permanently deleted.",

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
                await deleteVisaCategory(id);

            if (response.data?.status) {

                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data?.message ||
                        "Visa category deleted successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                if (editingId === id) {
                    cancelEdit();
                }

                /*
                 * If last row on page was deleted,
                 * move to previous page.
                 */

                if (
                    categories.length === 1 &&
                    page > 1
                ) {

                    setPage(
                        (previous) =>
                            previous - 1
                    );

                } else {

                    fetchCategories();
                }
            }

        } catch (error) {

            console.error(
                "Delete visa category error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete visa category.",
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
                Array.isArray(firstError)
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
       COUNTRY NAME
    ===================================================== */

    const getCountryName = (
        category
    ) => {

        return (
            category.country?.country_name ||
            category.country?.name ||
            countries.find(
                (country) =>
                    String(country.id) ===
                    String(category.country_id)
            )?.country_name ||
            countries.find(
                (country) =>
                    String(country.id) ===
                    String(category.country_id)
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

                    <div className="visa-category-page">

                        {/* ============================
                            PAGE HEADER
                        ============================ */}

                        <div className="visa-category-header">

                            <div>

                                <h1>
                                    Visa Categories
                                </h1>

                                <p>
                                    Manage visa categories available for each country.
                                </p>

                            </div>

                        </div>

                        {/* ============================
                            CREATE / EDIT CARD
                        ============================ */}

                        <div className="visa-category-form-card">

                            <div className="visa-category-card-header">

                                <h2>

                                    {editingId
                                        ? "Edit Visa Category"
                                        : "Add Visa Categories"}

                                </h2>

                                <p>

                                    {editingId
                                        ? "Update the selected visa category."
                                        : "Select a country and add one or more visa categories."}

                                </p>

                            </div>

                            {/* ============================
                                EDIT
                            ============================ */}

                            {editingId ? (

                                <form
                                    className="visa-category-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >

                                    <div className="visa-category-form-grid">

                                        {/* COUNTRY */}

                                        <div className="visa-category-form-group">

                                            <label>
                                                Country
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                value={
                                                    editCountryId
                                                }
                                                onChange={(e) =>
                                                    setEditCountryId(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Country
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

                                                            {country.country_name ||
                                                                country.name}

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                        {/* NAME */}

                                        <div className="visa-category-form-group">

                                            <label>
                                                Category Name
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editForm.name
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. Tourist Visa"
                                                disabled={
                                                    saving
                                                }
                                                required
                                            />

                                        </div>

                                        {/* PROCESSING */}

                                        <div className="visa-category-form-group">

                                            <label>
                                                Processing Time
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editForm.processing_time
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "processing_time",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. 5-7 working days"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        {/* ORDER */}

                                        <div className="visa-category-form-group">

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

                                        {/* STATUS */}

                                        <div className="visa-category-form-group">

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

                                        {/* IMAGE */}

                                        <div className="visa-category-form-group">

                                            <label>
                                                Visa Image
                                            </label>

                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp"
                                                onChange={
                                                    handleEditImageChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <span className="visa-category-file-help">
                                                JPG, JPEG, PNG or WEBP. Maximum 5 MB.
                                            </span>

                                        </div>

                                        {/* SHORT DESCRIPTION */}

                                        <div className="visa-category-form-group visa-category-full-width">

                                            <label>
                                                Short Description
                                            </label>

                                            <textarea
                                                rows="3"
                                                maxLength="500"
                                                value={
                                                    editForm.short_description
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "short_description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Short description about this visa category"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        {/* DESCRIPTION */}

                                        <div className="visa-category-form-group visa-category-full-width">

                                            <label>
                                                Description
                                            </label>

                                            <textarea
                                                rows="5"
                                                value={
                                                    editForm.description
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Detailed description about this visa category"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* IMAGE PREVIEW */}

                                    {editForm.imagePreview && (

                                        <div className="visa-category-image-preview">

                                            <span>
                                                Image Preview
                                            </span>

                                            <img
                                                src={
                                                    editForm.imagePreview
                                                }
                                                alt={
                                                    editForm.name ||
                                                    "Visa category"
                                                }
                                            />

                                        </div>

                                    )}

                                    <div className="visa-category-form-actions">

                                        <button
                                            type="button"
                                            className="visa-category-cancel-btn"
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
                                            className="visa-category-submit-btn"
                                            disabled={
                                                saving
                                            }
                                        >

                                            {saving
                                                ? "Updating..."
                                                : "Update Category"}

                                        </button>

                                    </div>

                                </form>

                            ) : (

                                /* ============================
                                    CREATE MULTIPLE
                                ============================ */

                                <form
                                    className="visa-category-form"
                                    onSubmit={
                                        handleCreate
                                    }
                                >

                                    {/* COUNTRY */}

                                    <div className="visa-category-country-select">

                                        <div className="visa-category-form-group">

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
                                                disabled={
                                                    saving
                                                }
                                                required
                                            >

                                                <option value="">
                                                    Select Country
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

                                                            {country.country_name ||
                                                                country.name}

                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>

                                    {/* CATEGORY ROWS */}

                                    <div className="visa-category-create-list">

                                        {categoryItems.map(
                                            (
                                                category,
                                                index
                                            ) => (

                                                <div
                                                    className="visa-category-create-item"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <div className="visa-category-create-item-header">

                                                        <h3>
                                                            Visa Category{" "}
                                                            {index +
                                                                1}
                                                        </h3>

                                                        <button
                                                            type="button"
                                                            className="visa-category-remove-btn"
                                                            onClick={() =>
                                                                removeCategoryRow(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                categoryItems.length ===
                                                                    1 ||
                                                                saving
                                                            }
                                                            title="Remove Category"
                                                        >

                                                            <FaTimes />

                                                        </button>

                                                    </div>

                                                    <div className="visa-category-form-grid">

                                                        {/* NAME */}

                                                        <div className="visa-category-form-group">

                                                            <label>

                                                                Category Name

                                                                <span className="required">
                                                                    *
                                                                </span>

                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    category.name
                                                                }
                                                                onChange={(e) =>
                                                                    handleCategoryChange(
                                                                        index,
                                                                        "name",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. Tourist Visa"
                                                                disabled={
                                                                    saving
                                                                }
                                                                required
                                                            />

                                                        </div>

                                                        {/* PROCESSING TIME */}

                                                        <div className="visa-category-form-group">

                                                            <label>
                                                                Processing Time
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    category.processing_time
                                                                }
                                                                onChange={(e) =>
                                                                    handleCategoryChange(
                                                                        index,
                                                                        "processing_time",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. 5-7 working days"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />

                                                        </div>

                                                        {/* STATUS */}

                                                        <div className="visa-category-form-group">

                                                            <label>
                                                                Status
                                                            </label>

                                                            <select
                                                                value={
                                                                    category.status
                                                                }
                                                                onChange={(e) =>
                                                                    handleCategoryChange(
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

                                                        {/* DISPLAY ORDER */}

                                                        <div className="visa-category-form-group">

                                                            <label>
                                                                Display Order
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    category.display_order
                                                                }
                                                                onChange={(e) =>
                                                                    handleCategoryChange(
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

                                                        {/* IMAGE */}

                                                        <div className="visa-category-form-group visa-category-full-width">

                                                            <label>
                                                                Visa Image
                                                            </label>

                                                            <input
                                                                type="file"
                                                                accept=".jpg,.jpeg,.png,.webp"
                                                                onChange={(e) =>
                                                                    handleCategoryImageChange(
                                                                        index,
                                                                        e
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving
                                                                }
                                                            />

                                                            <span className="visa-category-file-help">
                                                                JPG, JPEG, PNG or WEBP. Maximum 5 MB.
                                                            </span>

                                                        </div>

                                                        {/* SHORT DESCRIPTION */}

                                                        <div className="visa-category-form-group visa-category-full-width">

                                                            <label>
                                                                Short Description
                                                            </label>

                                                            <textarea
                                                                rows="3"
                                                                maxLength="500"
                                                                value={
                                                                    category.short_description
                                                                }
                                                                onChange={(e) =>
                                                                    handleCategoryChange(
                                                                        index,
                                                                        "short_description",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Short description about this visa category"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />

                                                        </div>

                                                        {/* DESCRIPTION */}

                                                        <div className="visa-category-form-group visa-category-full-width">

                                                            <label>
                                                                Description
                                                            </label>

                                                            <textarea
                                                                rows="5"
                                                                value={
                                                                    category.description
                                                                }
                                                                onChange={(e) =>
                                                                    handleCategoryChange(
                                                                        index,
                                                                        "description",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Detailed description about this visa category"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />

                                                        </div>

                                                    </div>

                                                    {/* PREVIEW */}

                                                    {category.imagePreview && (

                                                        <div className="visa-category-image-preview">

                                                            <span>
                                                                Image Preview
                                                            </span>

                                                            <img
                                                                src={
                                                                    category.imagePreview
                                                                }
                                                                alt={
                                                                    category.name ||
                                                                    "Visa category"
                                                                }
                                                            />

                                                        </div>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                    {/* CREATE ACTIONS */}

                                    <div className="visa-category-create-actions">

                                        <button
                                            type="button"
                                            className="visa-category-add-more-btn"
                                            onClick={
                                                addCategoryRow
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

                                            <FaPlus />

                                            Add Another Category

                                        </button>

                                        <button
                                            type="submit"
                                            className="visa-category-submit-btn"
                                            disabled={
                                                saving
                                            }
                                        >

                                            {saving
                                                ? "Saving..."
                                                : "Save Categories"}

                                        </button>

                                    </div>

                                </form>

                            )}

                        </div>

                        {/* ============================
                            TABLE CARD
                        ============================ */}

                        <div className="visa-category-table-card">

                            <div className="visa-category-table-header">

                                <div>

                                    <h2>
                                        Visa Category List
                                    </h2>

                                    <p>

                                        {totalCategories}{" "}

                                        {totalCategories === 1
                                            ? "category"
                                            : "categories"}

                                    </p>

                                </div>

                            </div>

                            <div className="visa-category-table-responsive">

                                <table className="visa-category-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                S.N.
                                            </th>

                                            <th>
                                                Image
                                            </th>

                                            <th>
                                                Category
                                            </th>

                                            <th>
                                                Country
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
                                                    colSpan="8"
                                                    className="visa-category-table-message"
                                                >

                                                    <div className="visa-category-loader"></div>

                                                    Loading visa categories...

                                                </td>

                                            </tr>

                                        ) : categories.length ===
                                          0 ? (

                                            <tr>

                                                <td
                                                    colSpan="8"
                                                    className="visa-category-table-message"
                                                >
                                                    No visa categories found.
                                                </td>

                                            </tr>

                                        ) : (

                                            categories.map(
                                                (
                                                    category,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            category.id
                                                        }
                                                    >

                                                        {/* SN */}

                                                        <td>

                                                            {(page -
                                                                1) *
                                                                10 +
                                                                index +
                                                                1}

                                                        </td>

                                                        {/* IMAGE */}

                                                        <td>

                                                            {category.visa_image ? (

                                                                <img
                                                                    className="visa-category-table-image"
                                                                    src={
                                                                        category.visa_image
                                                                    }
                                                                    alt={
                                                                        category.name
                                                                    }
                                                                />

                                                            ) : (

                                                                <div className="visa-category-no-image">
                                                                    No Image
                                                                </div>

                                                            )}

                                                        </td>

                                                        {/* CATEGORY */}

                                                        <td>

                                                            <div className="visa-category-name-cell">

                                                                <strong>
                                                                    {
                                                                        category.name
                                                                    }
                                                                </strong>

                                                                {category.short_description && (

                                                                    <span>
                                                                        {
                                                                            category.short_description
                                                                        }
                                                                    </span>

                                                                )}

                                                            </div>

                                                        </td>

                                                        {/* COUNTRY */}

                                                        <td>
                                                            {getCountryName(
                                                                category
                                                            )}
                                                        </td>

                                                        {/* PROCESSING */}

                                                        <td>

                                                            {category.processing_time ||
                                                                "-"}

                                                        </td>

                                                        {/* ORDER */}

                                                        <td>

                                                            {category.display_order ??
                                                                0}

                                                        </td>

                                                        {/* STATUS */}

                                                        <td>

                                                            <button
                                                                type="button"
                                                                className={`visa-category-status ${
                                                                    category.status ===
                                                                    "ACTIVE"
                                                                        ? "active"
                                                                        : "inactive"
                                                                }`}
                                                                disabled={
                                                                    changingStatusId ===
                                                                    category.id
                                                                }
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        category
                                                                    )
                                                                }
                                                            >

                                                                {changingStatusId ===
                                                                category.id
                                                                    ? "Updating..."
                                                                    : category.status}

                                                            </button>

                                                        </td>

                                                        {/* ACTIONS */}

                                                        <td>

                                                            <div className="visa-category-actions">

                                                                <button
                                                                    type="button"
                                                                    className="visa-category-edit-btn"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            category
                                                                        )
                                                                    }
                                                                    title="Edit"
                                                                >

                                                                    <FaPen />

                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="visa-category-delete-btn"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            category.id
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

export default VisaCategory;