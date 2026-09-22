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
    getAllItinerariesCms,
    getAllPackagesCms,
    createItineraries,
    updateItinerary,
    deleteItinerary,
} from "../../../api/BackendApi";

import "./Itinerary.css";

const createEmptyDay = (order = 1) => ({
    day: `Day ${order}`,
    title: "",
    description: "",
    display_order: order,
});

const Itinerary = () => {
    const [itineraries, setItineraries] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");

    const [days, setDays] = useState([
        createEmptyDay(1),
    ]);

    const [editingId, setEditingId] = useState(null);

    const [editDay, setEditDay] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] =
        useState("");
    const [editDisplayOrder, setEditDisplayOrder] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        fetchItineraries();
    }, [page]);

    const fetchItineraries = async () => {
        try {
            setLoading(true);

            const response =
                await getAllItinerariesCms(page);

            if (response.data.status) {
                setItineraries(
                    response.data.data.data || []
                );

                setTotalPages(
                    response.data.data.last_page || 1
                );
            }
        } catch (error) {
            console.error(
                "Error fetching itineraries:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load itineraries.",
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

    const addDay = () => {
        const nextOrder = days.length + 1;

        setDays([
            ...days,
            createEmptyDay(nextOrder),
        ]);
    };

    const removeDay = (index) => {
        if (days.length === 1) {
            return;
        }

        const updatedDays = days
            .filter((_, i) => i !== index)
            .map((item, i) => ({
                ...item,
                display_order: i + 1,
            }));

        setDays(updatedDays);
    };

    const handleDayChange = (
        index,
        field,
        value
    ) => {
        const updatedDays = [...days];

        updatedDays[index] = {
            ...updatedDays[index],
            [field]: value,
        };

        setDays(updatedDays);
    };

    const resetCreateForm = () => {
        setPackageId("");
        setDays([createEmptyDay(1)]);
    };

    const resetEditForm = () => {
        setEditingId(null);
        setEditDay("");
        setEditTitle("");
        setEditDescription("");
        setEditDisplayOrder("");
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

        for (let i = 0; i < days.length; i++) {
            const item = days[i];

            if (!item.day.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Day Required",
                    text: `Please enter the day for itinerary ${
                        i + 1
                    }.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }

            if (!item.title.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Title Required",
                    text: `Please enter the title for ${
                        item.day || `itinerary ${i + 1}`
                    }.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }

            if (!item.description.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Description Required",
                    text: `Please enter the description for ${
                        item.day || `itinerary ${i + 1}`
                    }.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const data = {
            itineraries: days.map(
                (item, index) => ({
                    day: item.day.trim(),
                    title: item.title.trim(),
                    description:
                        item.description.trim(),
                    display_order:
                        Number(
                            item.display_order
                        ) ||
                        index + 1,
                })
            ),
        };

        try {
            setSaving(true);

            const response =
                await createItineraries(
                    packageId,
                    data
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Itinerary Added",
                    text:
                        response.data.message ||
                        "Itineraries created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();
                fetchItineraries();
            }
        } catch (error) {
            console.error(
                "Error creating itineraries:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create itineraries.";

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

    const handleEdit = (itinerary) => {
        setEditingId(itinerary.id);

        setEditDay(
            itinerary.day || ""
        );

        setEditTitle(
            itinerary.title || ""
        );

        setEditDescription(
            itinerary.description || ""
        );

        setEditDisplayOrder(
            itinerary.display_order?.toString() ||
                "1"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editDay.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Day Required",
                text: "Please enter the day.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (!editTitle.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Title Required",
                text: "Please enter the title.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (!editDescription.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Description Required",
                text: "Please enter the description.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = {
            day: editDay.trim(),
            title: editTitle.trim(),
            description:
                editDescription.trim(),
            display_order:
                Number(editDisplayOrder) || 1,
        };

        try {
            setSaving(true);

            const response =
                await updateItinerary(
                    editingId,
                    data
                );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Itinerary Updated",
                    text:
                        response.data.message ||
                        "Itinerary updated successfully.",
                    confirmButtonColor: "#351255",
                });

                resetEditForm();
                fetchItineraries();
            }
        } catch (error) {
            console.error(
                "Error updating itinerary:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update itinerary.";

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

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Itinerary?",
            text: "This itinerary will be permanently deleted.",
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
                await deleteItinerary(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "Itinerary deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    resetEditForm();
                }

                fetchItineraries();
            }
        } catch (error) {
            console.error(
                "Error deleting itinerary:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete itinerary.",
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
                    <div className="itinerary-page">
                        <div className="itinerary-header">
                            <h1>
                                Package Itineraries
                            </h1>

                            <p>
                                Manage daily itineraries
                                for packages.
                            </p>
                        </div>

                        {editingId ? (
                            <div className="itinerary-form-card">
                                <div className="itinerary-card-header">
                                    <h2>
                                        Edit Itinerary
                                    </h2>

                                    <p>
                                        Update the selected
                                        itinerary day.
                                    </p>
                                </div>

                                <form
                                    className="itinerary-edit-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >
                                    <div className="itinerary-form-row">
                                        <div className="itinerary-form-group itinerary-day-field">
                                            <label>
                                                Day
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editDay
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setEditDay(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Day 1"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="itinerary-form-group itinerary-title-field">
                                            <label>
                                                Title
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    editTitle
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setEditTitle(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Enter itinerary title"
                                                disabled={
                                                    saving
                                                }
                                            />
                                        </div>

                                        <div className="itinerary-form-group itinerary-order-field">
                                            <label>
                                                Display
                                                Order
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    editDisplayOrder
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setEditDisplayOrder(
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

                                    <div className="itinerary-form-group">
                                        <label>
                                            Description
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <textarea
                                            value={
                                                editDescription
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setEditDescription(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            rows="4"
                                            placeholder="Enter itinerary description"
                                            disabled={
                                                saving
                                            }
                                        />
                                    </div>

                                    <div className="itinerary-form-buttons">
                                        <button
                                            type="button"
                                            className="itinerary-cancel-btn"
                                            onClick={
                                                resetEditForm
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="itinerary-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPen />

                                            {saving
                                                ? "Updating..."
                                                : "Update"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="itinerary-form-card">
                                <div className="itinerary-card-header">
                                    <div>
                                        <h2>
                                            Add
                                            Itinerary
                                        </h2>

                                        <p>
                                            Add multiple
                                            days to a
                                            package at
                                            once.
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={
                                        handleCreate
                                    }
                                >
                                    <div className="itinerary-package-section">
                                        <div className="itinerary-form-group">
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
                                                    Select
                                                    Package
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

                                    <div className="itinerary-days">
                                        {days.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="itinerary-day-card"
                                                    key={
                                                        index
                                                    }
                                                >
                                                    <div className="itinerary-day-header">
                                                        <h3>
                                                            Day{" "}
                                                            {index +
                                                                1}
                                                        </h3>

                                                        {days.length >
                                                            1 && (
                                                            <button
                                                                type="button"
                                                                className="itinerary-remove-day-btn"
                                                                onClick={() =>
                                                                    removeDay(
                                                                        index
                                                                    )
                                                                }
                                                                title="Remove Day"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="itinerary-form-row">
                                                        <div className="itinerary-form-group itinerary-day-field">
                                                            <label>
                                                                Day
                                                                <span className="required">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    item.day
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleDayChange(
                                                                        index,
                                                                        "day",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Day 1"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />
                                                        </div>

                                                        <div className="itinerary-form-group itinerary-title-field">
                                                            <label>
                                                                Title
                                                                <span className="required">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={
                                                                    item.title
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleDayChange(
                                                                        index,
                                                                        "title",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Enter itinerary title"
                                                                disabled={
                                                                    saving
                                                                }
                                                            />
                                                        </div>

                                                        <div className="itinerary-form-group itinerary-order-field">
                                                            <label>
                                                                Display
                                                                Order
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={
                                                                    item.display_order
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleDayChange(
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

                                                    <div className="itinerary-form-group">
                                                        <label>
                                                            Description
                                                            <span className="required">
                                                                *
                                                            </span>
                                                        </label>

                                                        <textarea
                                                            value={
                                                                item.description
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleDayChange(
                                                                    index,
                                                                    "description",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            rows="4"
                                                            placeholder="Enter itinerary description"
                                                            disabled={
                                                                saving
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="itinerary-create-actions">
                                        <button
                                            type="button"
                                            className="itinerary-add-day-btn"
                                            onClick={
                                                addDay
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />
                                            Add Day
                                        </button>

                                        <button
                                            type="submit"
                                            className="itinerary-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save Itinerary"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="itinerary-table-card">
                            <div className="itinerary-card-header">
                                <h2>
                                    All Itineraries
                                </h2>
                            </div>

                            {loading ? (
                                <div className="itinerary-empty">
                                    Loading
                                    itineraries...
                                </div>
                            ) : itineraries.length ===
                              0 ? (
                                <div className="itinerary-empty">
                                    No itineraries
                                    found.
                                </div>
                            ) : (
                                <>
                                    <div className="itinerary-table-wrapper">
                                        <table className="itinerary-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        S.N.
                                                    </th>
                                                    <th>
                                                        Package
                                                    </th>
                                                    <th>
                                                        Day
                                                    </th>
                                                    <th>
                                                        Title
                                                    </th>
                                                    <th>
                                                        Description
                                                    </th>
                                                    <th>
                                                        Order
                                                    </th>
                                                    <th>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {itineraries.map(
                                                    (
                                                        itinerary,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                itinerary.id
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
                                                                <span className="itinerary-package-name">
                                                                    {itinerary
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="itinerary-day-badge">
                                                                    {
                                                                        itinerary.day
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="itinerary-title">
                                                                    {
                                                                        itinerary.title
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="itinerary-description">
                                                                    {
                                                                        itinerary.description
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td>
                                                                {
                                                                    itinerary.display_order
                                                                }
                                                            </td>

                                                            <td>
                                                                <div className="itinerary-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="itinerary-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                itinerary
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="itinerary-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                itinerary.id
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

export default Itinerary;