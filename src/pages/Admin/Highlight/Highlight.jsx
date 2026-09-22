import { useEffect, useState } from "react";
import {
    FaPlus,
    FaPen,
    FaTrash,
    FaTimes,
    FaImage,
} from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllHighlightsCms,
    getAllPackagesCms,
    createHighlight,
    updateHighlight,
    deleteHighlight,
} from "../../../api/BackendApi";

import "./Highlight.css";

const createEmptyHighlight = (order = 0) => ({
    highlight: "",
    image: null,
    imagePreview: null,
    display_order: order,
});

const Highlight = () => {
    const [highlights, setHighlights] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");

    // Multiple highlights for create
    const [highlightItems, setHighlightItems] = useState([
        createEmptyHighlight(0),
    ]);

    // Single highlight for edit
    const [highlight, setHighlight] = useState("");
    const [displayOrder, setDisplayOrder] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        fetchHighlights();
    }, [page]);

    const fetchHighlights = async () => {
        try {
            setLoading(true);

            const response =
                await getAllHighlightsCms(page);

            if (response.data.status) {
                setHighlights(
                    response.data.data.data || []
                );

                setTotalPages(
                    response.data.data.last_page || 1
                );
            }
        } catch (error) {
            console.error(
                "Error fetching highlights:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load highlights.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const response =
                await getAllPackagesCms();

            if (response.data.status) {
                setPackages(
                    response.data.data.data || []
                );
            }
        } catch (error) {
            console.error(
                "Error fetching packages:",
                error
            );
        }
    };

    // ==========================================
    // CREATE
    // ==========================================

    const addHighlightRow = () => {
        setHighlightItems([
            ...highlightItems,
            createEmptyHighlight(
                highlightItems.length
            ),
        ]);
    };

    const removeHighlightRow = (index) => {
        if (highlightItems.length === 1) {
            return;
        }

        const updatedItems = highlightItems
            .filter((_, i) => i !== index)
            .map((item, i) => ({
                ...item,
                display_order: i,
            }));

        setHighlightItems(updatedItems);
    };

    const handleHighlightChange = (
        index,
        field,
        value
    ) => {
        const updatedItems = [
            ...highlightItems,
        ];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        setHighlightItems(updatedItems);
    };

    const handleCreateImageChange = (
        index,
        file
    ) => {
        const updatedItems = [
            ...highlightItems,
        ];

        if (!file) {
            updatedItems[index] = {
                ...updatedItems[index],
                image: null,
                imagePreview: null,
            };

            setHighlightItems(updatedItems);
            return;
        }

        updatedItems[index] = {
            ...updatedItems[index],
            image: file,
            imagePreview:
                URL.createObjectURL(file),
        };

        setHighlightItems(updatedItems);
    };

    const resetCreateForm = () => {
        setPackageId("");

        setHighlightItems([
            createEmptyHighlight(0),
        ]);
    };

    const handleCreate = async (e) => {
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

        for (
            let i = 0;
            i < highlightItems.length;
            i++
        ) {
            if (
                !highlightItems[
                    i
                ].highlight.trim()
            ) {
                Swal.fire({
                    icon: "warning",
                    title: "Highlight Required",
                    text: `Please enter highlight ${
                        i + 1
                    }.`,
                    confirmButtonColor:
                        "#351255",
                });

                return;
            }
        }

        const formData = new FormData();

        highlightItems.forEach(
            (item, index) => {
                formData.append(
                    `highlights[${index}][highlight]`,
                    item.highlight.trim()
                );

                formData.append(
                    `highlights[${index}][display_order]`,
                    item.display_order === ""
                        ? index
                        : Number(
                              item.display_order
                          )
                );

                if (item.image) {
                    formData.append(
                        `highlights[${index}][image]`,
                        item.image
                    );
                }
            }
        );

        try {
            setSaving(true);

            const response =
                await createHighlight(
                    packageId,
                    formData
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Highlights Added",
                    text:
                        response.data.message ||
                        "Package highlights created successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                resetCreateForm();
                fetchHighlights();
            }
        } catch (error) {
            console.error(
                "Error creating highlights:",
                error
            );

            let errorMessage =
                error.response?.data
                    ?.message ||
                "Unable to create highlights.";

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
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // EDIT
    // ==========================================

    const handleEdit = (
        highlightData
    ) => {
        setEditingId(highlightData.id);

        setPackageId(
            highlightData.package_id?.toString() ||
                ""
        );

        setHighlight(
            highlightData.highlight || ""
        );

        setDisplayOrder(
            highlightData.display_order?.toString() ||
                "0"
        );

        setExistingImage(
            highlightData.image || null
        );

        setImage(null);
        setImagePreview(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleEditImageChange = (
        file
    ) => {
        if (!file) {
            setImage(null);
            setImagePreview(null);
            return;
        }

        setImage(file);

        setImagePreview(
            URL.createObjectURL(file)
        );
    };

    const cancelEdit = () => {
        setEditingId(null);

        setPackageId("");
        setHighlight("");
        setDisplayOrder("");

        setImage(null);
        setImagePreview(null);
        setExistingImage(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!highlight.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Highlight Required",
                text: "Please enter a highlight.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const formData = new FormData();

        formData.append(
            "highlight",
            highlight.trim()
        );

        formData.append(
            "display_order",
            displayOrder === ""
                ? 0
                : Number(displayOrder)
        );

        if (image) {
            formData.append(
                "image",
                image
            );
        }

        try {
            setSaving(true);

            const response =
                await updateHighlight(
                    editingId,
                    formData
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Highlight Updated",
                    text:
                        response.data.message ||
                        "Package highlight updated successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                cancelEdit();
                fetchHighlights();
            }
        } catch (error) {
            console.error(
                "Error updating highlight:",
                error
            );

            let errorMessage =
                error.response?.data
                    ?.message ||
                "Unable to update highlight.";

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
                confirmButtonColor: "#351255",
            });
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Highlight?",
            text: "This package highlight will be permanently deleted.",
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
                await deleteHighlight(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Package highlight deleted successfully.",
                    confirmButtonColor:
                        "#351255",
                });

                if (editingId === id) {
                    cancelEdit();
                }

                fetchHighlights();
            }
        } catch (error) {
            console.error(
                "Error deleting highlight:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data
                        ?.message ||
                    "Unable to delete highlight.",
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
                    <div className="highlight-page">

                        <div className="highlight-header">
                            <div>
                                <h1>
                                    Package Highlights
                                </h1>

                                <p>
                                    Manage highlights and
                                    images for packages.
                                </p>
                            </div>
                        </div>

                        <div className="highlight-form-card">

                            <div className="highlight-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit Highlight"
                                        : "Add Highlights"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected package highlight."
                                        : "Add multiple highlights to a package."}
                                </p>
                            </div>

                            {editingId ? (
                                /* =====================
                                   EDIT
                                ===================== */

                                <form
                                    className="highlight-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >
                                    <div className="highlight-form-group">
                                        <label>
                                            Package
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            value={
                                                packageId
                                            }
                                            disabled
                                        >
                                            <option value="">
                                                Select Package
                                            </option>

                                            {packages.map(
                                                (pkg) => (
                                                    <option
                                                        key={
                                                            pkg.id
                                                        }
                                                        value={
                                                            pkg.id
                                                        }
                                                    >
                                                        {
                                                            pkg.title
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="highlight-form-group highlight-text-field">
                                        <label>
                                            Highlight
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                highlight
                                            }
                                            onChange={(e) =>
                                                setHighlight(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. Stunning Himalayan views"
                                            maxLength={
                                                255
                                            }
                                            disabled={
                                                saving
                                            }
                                        />
                                    </div>

                                    <div className="highlight-form-group highlight-order-field">
                                        <label>
                                            Display Order
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                displayOrder
                                            }
                                            onChange={(e) =>
                                                setDisplayOrder(
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

                                    <div className="highlight-form-group">
                                        <label>
                                            Image
                                        </label>

                                        <label className="highlight-file-input">
                                            <FaImage />

                                            <span>
                                                {image
                                                    ? image.name
                                                    : "Choose Image"}
                                            </span>

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleEditImageChange(
                                                        e
                                                            .target
                                                            .files?.[0] ||
                                                            null
                                                    )
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </label>

                                        {(imagePreview ||
                                            existingImage) && (
                                            <div className="highlight-image-preview">
                                                <img
                                                    src={
                                                        imagePreview ||
                                                        existingImage
                                                    }
                                                    alt="Highlight preview"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="highlight-form-buttons">

                                        <button
                                            type="button"
                                            className="highlight-cancel-btn"
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
                                            className="highlight-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPen />

                                            {saving
                                                ? "Saving..."
                                                : "Update"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* =====================
                                   CREATE MULTIPLE
                                ===================== */

                                <form
                                    onSubmit={
                                        handleCreate
                                    }
                                >
                                    <div className="highlight-package-section">

                                        <div className="highlight-form-group">
                                            <label>
                                                Package
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                value={
                                                    packageId
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setPackageId(
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
                                                    Select Package
                                                </option>

                                                {packages.map(
                                                    (
                                                        pkg
                                                    ) => (
                                                        <option
                                                            key={
                                                                pkg.id
                                                            }
                                                            value={
                                                                pkg.id
                                                            }
                                                        >
                                                            {
                                                                pkg.title
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="highlight-items-list">

                                        {highlightItems.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="highlight-item-row"
                                                    key={
                                                        index
                                                    }
                                                >
                                                    <div className="highlight-number">
                                                        {index +
                                                            1}
                                                    </div>

                                                    <div className="highlight-row-content">

                                                        <div className="highlight-row-top">

                                                            <div className="highlight-form-group highlight-text-field">
                                                                <label>
                                                                    Highlight
                                                                    <span className="required">
                                                                        *
                                                                    </span>
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        item.highlight
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleHighlightChange(
                                                                            index,
                                                                            "highlight",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="e.g. Stunning Himalayan views"
                                                                    maxLength={
                                                                        255
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="highlight-form-group highlight-order-field">
                                                                <label>
                                                                    Display
                                                                    Order
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={
                                                                        item.display_order
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleHighlightChange(
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

                                                            <button
                                                                type="button"
                                                                className="highlight-remove-btn"
                                                                onClick={() =>
                                                                    removeHighlightRow(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    highlightItems.length ===
                                                                        1 ||
                                                                    saving
                                                                }
                                                                title="Remove Highlight"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </div>

                                                        <div className="highlight-form-group">
                                                            <label>
                                                                Image
                                                            </label>

                                                            <label className="highlight-file-input">
                                                                <FaImage />

                                                                <span>
                                                                    {item.image
                                                                        ? item
                                                                              .image
                                                                              .name
                                                                        : "Choose Image"}
                                                                </span>

                                                                <input
                                                                    type="file"
                                                                    accept="image/jpeg,image/png,image/webp"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleCreateImageChange(
                                                                            index,
                                                                            e
                                                                                .target
                                                                                .files?.[0] ||
                                                                                null
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                />
                                                            </label>

                                                            {item.imagePreview && (
                                                                <div className="highlight-image-preview">
                                                                    <img
                                                                        src={
                                                                            item.imagePreview
                                                                        }
                                                                        alt={`Highlight ${
                                                                            index +
                                                                            1
                                                                        } preview`}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="highlight-create-actions">

                                        <button
                                            type="button"
                                            className="highlight-add-more-btn"
                                            onClick={
                                                addHighlightRow
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />
                                            Add Highlight
                                        </button>

                                        <button
                                            type="submit"
                                            className="highlight-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Highlights"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* =====================
                            TABLE
                        ===================== */}

                        <div className="highlight-table-card">

                            <div className="highlight-card-header">
                                <h2>
                                    All Highlights
                                </h2>
                            </div>

                            {loading ? (
                                <div className="highlight-empty">
                                    Loading highlights...
                                </div>
                            ) : highlights.length ===
                              0 ? (
                                <div className="highlight-empty">
                                    No highlights found.
                                </div>
                            ) : (
                                <>
                                    <div className="highlight-table-wrapper">

                                        <table className="highlight-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        S.N.
                                                    </th>

                                                    <th>
                                                        Package
                                                    </th>

                                                    <th>
                                                        Image
                                                    </th>

                                                    <th>
                                                        Highlight
                                                    </th>

                                                    <th>
                                                        Display
                                                        Order
                                                    </th>

                                                    <th>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {highlights.map(
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
                                                                <span className="highlight-package-name">
                                                                    {item
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {item.image ? (
                                                                    <img
                                                                        className="highlight-table-image"
                                                                        src={
                                                                            item.image
                                                                        }
                                                                        alt={
                                                                            item.highlight
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <span className="highlight-no-image">
                                                                        No
                                                                        image
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td>
                                                                {
                                                                    item.highlight
                                                                }
                                                            </td>

                                                            <td>
                                                                <span className="highlight-order">
                                                                    {item.display_order ??
                                                                        0}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="highlight-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="highlight-edit-btn"
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
                                                                        className="highlight-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                item.id
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

export default Highlight;