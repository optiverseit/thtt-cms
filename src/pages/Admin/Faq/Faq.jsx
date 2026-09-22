import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

import {
    getAllFaqsCms,
    getAllPackagesCms,
    createFaq,
    updateFaq,
    deleteFaq,
} from "../../../api/BackendApi";

import "./Faq.css";

const createEmptyFaq = (order = 0) => ({
    question: "",
    answer: "",
    display_order: order,
});

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [packages, setPackages] = useState([]);

    const [packageId, setPackageId] = useState("");

    // Multiple FAQs for create
    const [faqItems, setFaqItems] = useState([
        createEmptyFaq(0),
    ]);

    // Single FAQ for edit
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [displayOrder, setDisplayOrder] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [page]);

    const fetchFaqs = async () => {
        try {
            setLoading(true);

            const response = await getAllFaqsCms(page);

            if (response.data.status) {
                setFaqs(response.data.data.data || []);
                setTotalPages(
                    response.data.data.last_page || 1
                );
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to load FAQs.",
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

    // ==============================
    // CREATE
    // ==============================

    const addFaqRow = () => {
        setFaqItems([
            ...faqItems,
            createEmptyFaq(faqItems.length),
        ]);
    };

    const removeFaqRow = (index) => {
        if (faqItems.length === 1) {
            return;
        }

        const updatedItems = faqItems
            .filter((_, i) => i !== index)
            .map((faq, i) => ({
                ...faq,
                display_order: i,
            }));

        setFaqItems(updatedItems);
    };

    const handleFaqChange = (
        index,
        field,
        value
    ) => {
        const updatedItems = [...faqItems];

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };

        setFaqItems(updatedItems);
    };

    const resetCreateForm = () => {
        setPackageId("");
        setFaqItems([
            createEmptyFaq(0),
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

        for (let i = 0; i < faqItems.length; i++) {
            const faq = faqItems[i];

            if (!faq.question.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Question Required",
                    text: `Please enter question for FAQ ${
                        i + 1
                    }.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }

            if (!faq.answer.trim()) {
                Swal.fire({
                    icon: "warning",
                    title: "Answer Required",
                    text: `Please enter answer for FAQ ${
                        i + 1
                    }.`,
                    confirmButtonColor: "#351255",
                });

                return;
            }
        }

        const data = {
            faqs: faqItems.map(
                (faq, index) => ({
                    question: faq.question.trim(),
                    answer: faq.answer.trim(),
                    display_order:
                        faq.display_order === ""
                            ? index
                            : Number(
                                  faq.display_order
                              ),
                })
            ),
        };

        try {
            setSaving(true);

            const response = await createFaq(
                packageId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "FAQs Added",
                    text:
                        response.data.message ||
                        "FAQs created successfully.",
                    confirmButtonColor: "#351255",
                });

                resetCreateForm();
                fetchFaqs();
            }
        } catch (error) {
            console.error(
                "Error creating FAQs:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create FAQs.";

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

    // ==============================
    // EDIT
    // ==============================

    const handleEdit = (faq) => {
        setEditingId(faq.id);

        setPackageId(
            faq.package_id?.toString() || ""
        );

        setQuestion(faq.question || "");
        setAnswer(faq.answer || "");

        setDisplayOrder(
            faq.display_order?.toString() || "0"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setPackageId("");
        setQuestion("");
        setAnswer("");
        setDisplayOrder("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Question Required",
                text: "Please enter a question.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (!answer.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Answer Required",
                text: "Please enter an answer.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = {
            question: question.trim(),
            answer: answer.trim(),
            display_order:
                displayOrder === ""
                    ? 0
                    : Number(displayOrder),
        };

        try {
            setSaving(true);

            const response = await updateFaq(
                editingId,
                data
            );

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "FAQ Updated",
                    text:
                        response.data.message ||
                        "FAQ updated successfully.",
                    confirmButtonColor: "#351255",
                });

                cancelEdit();
                fetchFaqs();
            }
        } catch (error) {
            console.error(
                "Error updating FAQ:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to update FAQ.";

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

    // ==============================
    // DELETE
    // ==============================

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete FAQ?",
            text: "This FAQ will be permanently deleted.",
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
                await deleteFaq(id);

            if (response.data.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text:
                        response.data.message ||
                        "FAQ deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (editingId === id) {
                    cancelEdit();
                }

                fetchFaqs();
            }
        } catch (error) {
            console.error(
                "Error deleting FAQ:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to delete FAQ.",
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
                    <div className="faq-page">

                        <div className="faq-header">
                            <h1>
                                Package FAQs
                            </h1>

                            <p>
                                Manage frequently asked
                                questions for packages.
                            </p>
                        </div>

                        <div className="faq-form-card">

                            <div className="faq-card-header">
                                <h2>
                                    {editingId
                                        ? "Edit FAQ"
                                        : "Add FAQs"}
                                </h2>

                                <p>
                                    {editingId
                                        ? "Update the selected FAQ."
                                        : "Add multiple FAQs to a package."}
                                </p>
                            </div>

                            {editingId ? (
                                /* ==================
                                   EDIT ONE FAQ
                                ================== */

                                <form
                                    className="faq-form"
                                    onSubmit={
                                        handleUpdate
                                    }
                                >
                                    <div className="faq-form-group">
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

                                    <div className="faq-form-group faq-question-field">
                                        <label>
                                            Question
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                question
                                            }
                                            onChange={(e) =>
                                                setQuestion(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter FAQ question"
                                            disabled={
                                                saving
                                            }
                                        />
                                    </div>

                                    <div className="faq-form-group faq-order-field">
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

                                    <div className="faq-form-group faq-answer-field">
                                        <label>
                                            Answer
                                            <span className="required">
                                                *
                                            </span>
                                        </label>

                                        <textarea
                                            value={
                                                answer
                                            }
                                            onChange={(e) =>
                                                setAnswer(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter FAQ answer"
                                            disabled={
                                                saving
                                            }
                                            rows="4"
                                        />
                                    </div>

                                    <div className="faq-form-buttons">
                                        <button
                                            type="button"
                                            className="faq-cancel-btn"
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
                                            className="faq-save-btn"
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
                                /* ==================
                                   CREATE MULTIPLE
                                ================== */

                                <form
                                    onSubmit={
                                        handleCreate
                                    }
                                >
                                    <div className="faq-package-section">
                                        <div className="faq-form-group">
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

                                    <div className="faq-items-list">
                                        {faqItems.map(
                                            (
                                                faq,
                                                index
                                            ) => (
                                                <div
                                                    className="faq-item-row"
                                                    key={
                                                        index
                                                    }
                                                >
                                                    <div className="faq-number">
                                                        {index +
                                                            1}
                                                    </div>

                                                    <div className="faq-row-fields">
                                                        <div className="faq-row-top">

                                                            <div className="faq-form-group faq-question-field">
                                                                <label>
                                                                    Question
                                                                    <span className="required">
                                                                        *
                                                                    </span>
                                                                </label>

                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        faq.question
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleFaqChange(
                                                                            index,
                                                                            "question",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="Enter FAQ question"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="faq-form-group faq-order-field">
                                                                <label>
                                                                    Display
                                                                    Order
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={
                                                                        faq.display_order
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleFaqChange(
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
                                                                className="faq-remove-btn"
                                                                onClick={() =>
                                                                    removeFaqRow(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    faqItems.length ===
                                                                        1 ||
                                                                    saving
                                                                }
                                                                title="Remove FAQ"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </div>

                                                        <div className="faq-form-group faq-answer-field">
                                                            <label>
                                                                Answer
                                                                <span className="required">
                                                                    *
                                                                </span>
                                                            </label>

                                                            <textarea
                                                                value={
                                                                    faq.answer
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleFaqChange(
                                                                        index,
                                                                        "answer",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Enter FAQ answer"
                                                                disabled={
                                                                    saving
                                                                }
                                                                rows="3"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="faq-create-actions">
                                        <button
                                            type="button"
                                            className="faq-add-more-btn"
                                            onClick={
                                                addFaqRow
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />
                                            Add FAQ
                                        </button>

                                        <button
                                            type="submit"
                                            className="faq-save-btn"
                                            disabled={
                                                saving
                                            }
                                        >
                                            <FaPlus />

                                            {saving
                                                ? "Saving..."
                                                : "Save FAQs"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* ==================
                            TABLE
                        ================== */}

                        <div className="faq-table-card">
                            <div className="faq-card-header">
                                <h2>
                                    All FAQs
                                </h2>
                            </div>

                            {loading ? (
                                <div className="faq-empty">
                                    Loading FAQs...
                                </div>
                            ) : faqs.length ===
                              0 ? (
                                <div className="faq-empty">
                                    No FAQs found.
                                </div>
                            ) : (
                                <>
                                    <div className="faq-table-wrapper">
                                        <table className="faq-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        S.N.
                                                    </th>
                                                    <th>
                                                        Package
                                                    </th>
                                                    <th>
                                                        Question
                                                    </th>
                                                    <th>
                                                        Answer
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
                                                {faqs.map(
                                                    (
                                                        faq,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                faq.id
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
                                                                <span className="faq-package-name">
                                                                    {faq
                                                                        .package
                                                                        ?.title ||
                                                                        "N/A"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span className="faq-question">
                                                                    {
                                                                        faq.question
                                                                    }
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="faq-answer">
                                                                    {
                                                                        faq.answer
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span className="faq-order">
                                                                    {faq.display_order ??
                                                                        0}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="faq-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="faq-edit-btn"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                faq
                                                                            )
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <FaPen />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="faq-delete-btn"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                faq.id
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

export default Faq;