import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

import {
    FaEllipsisV,
    FaEye,
    FaCreditCard,
    FaPlus,
    FaFileAlt,
    FaExternalLinkAlt,
} from "react-icons/fa";

import {
    getAllWorkPermitsCms,
    getWorkPermitPayments,
    createWorkPermitPayment,
    getWorkPermitById,
    changeWorkPermitPaymentStatus,
    getWorkPermitDocuments,
} from "../../../api/BackendApi";

import "./WorkPermit.css";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const WorkPermit = () => {
    /* =========================================================
       WORK PERMITS
    ========================================================= */

    const [workPermits, setWorkPermits] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalWorkPermits, setTotalWorkPermits] = useState(0);

    /* =========================================================
       ACTION MENU
    ========================================================= */

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    /* =========================================================
       PAYMENT STATUS
    ========================================================= */

    const [paymentStatuses, setPaymentStatuses] = useState({});

    /* =========================================================
       ADD PAYMENT MODAL
    ========================================================= */

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPermit, setSelectedPermit] = useState(null);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);

    const [paymentForm, setPaymentForm] = useState({
        amount_npr: "",
        receipt: null,
    });

    /* =========================================================
       VIEW PAYMENT MODAL
    ========================================================= */

    const [viewPaymentModalOpen, setViewPaymentModalOpen] =
        useState(false);

    const [viewPaymentPermit, setViewPaymentPermit] =
        useState(null);

    const [viewPayments, setViewPayments] = useState([]);

    const [viewPaymentLoading, setViewPaymentLoading] =
        useState(false);

    const [changingPaymentId, setChangingPaymentId] =
        useState(null);

    /* =========================================================
       VIEW APPLICATION MODAL
    ========================================================= */

    const [viewApplicationModalOpen, setViewApplicationModalOpen] =
        useState(false);

    const [applicationDetail, setApplicationDetail] =
        useState(null);

    const [applicationDetailLoading, setApplicationDetailLoading] =
        useState(false);

    /* =========================================================
       VIEW DOCUMENTS MODAL
    ========================================================= */

    const [viewDocumentModalOpen, setViewDocumentModalOpen] = useState(false);
    const [viewDocumentPermit, setViewDocumentPermit] = useState(null);
    const [viewDocuments, setViewDocuments] = useState([]);
    const [viewDocumentLoading, setViewDocumentLoading] = useState(false);

    const openViewDocumentsModal = async (permit) => {
        setOpenMenuId(null);
        setViewDocumentPermit(permit);
        setViewDocuments([]);
        setViewDocumentModalOpen(true);
        setViewDocumentLoading(true);

        try {
            const response = await getWorkPermitDocuments(permit.id);

            if (response.data?.status) {
                setViewDocuments(
                    Array.isArray(response.data?.data?.data)
                        ? response.data.data.data
                        : []
                );
            } else {
                throw new Error(
                    response.data?.message || "Unable to fetch documents."
                );
            }
        } catch (error) {
            console.error("View documents error:", error);
            setViewDocumentModalOpen(false);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch permit documents.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setViewDocumentLoading(false);
        }
    };

    const closeViewDocumentsModal = () => {
        setViewDocumentModalOpen(false);
        setViewDocumentPermit(null);
        setViewDocuments([]);
    };

    /* =========================================================
       FETCH PAYMENT STATUS
    ========================================================= */

    const fetchPaymentStatus = async (workPermitId) => {
        try {
            const response =
                await getWorkPermitPayments(workPermitId);

            if (response.data?.status) {
                const payments = Array.isArray(
                    response.data.data
                )
                    ? response.data.data
                    : [];

                const latestPayment =
                    payments.length > 0
                        ? payments[0]
                        : null;

                const status =
                    latestPayment?.status || "NOT_PAID";

                setPaymentStatuses((previous) => ({
                    ...previous,
                    [workPermitId]: status,
                }));

                return latestPayment;
            }

            setPaymentStatuses((previous) => ({
                ...previous,
                [workPermitId]: "NOT_PAID",
            }));
        } catch (error) {
            console.error(
                "Payment fetch error:",
                error
            );

            setPaymentStatuses((previous) => ({
                ...previous,
                [workPermitId]: "NOT_PAID",
            }));
        }

        return null;
    };

    /* =========================================================
       FETCH WORK PERMITS
    ========================================================= */

    const fetchWorkPermits = async () => {
        try {
            setLoading(true);

            const response =
                await getAllWorkPermitsCms(page);

            if (response.data?.status) {
                const permits =
                    response.data.data?.data || [];

                setWorkPermits(permits);

                setTotalPages(
                    response.data.data?.last_page || 1
                );

                setTotalWorkPermits(
                    response.data.data?.total || 0
                );

                await Promise.all(
                    permits.map((permit) =>
                        fetchPaymentStatus(permit.id)
                    )
                );
            }
        } catch (error) {
            console.error(
                "Work permit fetch error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to fetch work permit applications.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkPermits();
    }, [page]);

    /* =========================================================
       CLOSE KEBAB MENU
    ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const toggleMenu = (id) => {
        setOpenMenuId((currentId) =>
            currentId === id ? null : id
        );
    };

    /* =========================================================
       STATUS CLASSES
    ========================================================= */

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case "DRAFT":
                return "status-draft";

            case "SUBMITTED":
                return "status-submitted";

            case "APPROVED":
                return "status-approved";

            case "REJECTED":
                return "status-rejected";

            case "PROCESSING":
            case "IN_REVIEW":
                return "status-processing";

            default:
                return "status-default";
        }
    };

    const getPaymentStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case "VERIFIED":
            case "PAID":
            case "APPROVED":
                return "payment-paid";

            case "PENDING":
            case "SUBMITTED":
                return "payment-pending";

            case "REJECTED":
            case "FAILED":
                return "payment-rejected";

            case "UNPAID":
            case "NOT_PAID":
                return "payment-unpaid";

            default:
                return "payment-default";
        }
    };

    const getPaymentStatus = (permit) => {
        return (
            paymentStatuses[permit.id] ||
            "NOT_PAID"
        );
    };

    /* =========================================================
       FORMAT HELPERS
    ========================================================= */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString();
    };

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();
    };

    const formatAmount = (amount) => {
        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {
            return "-";
        }

        return `NPR ${Number(amount).toLocaleString()}`;
    };

    const displayValue = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        if (value === true || value === 1) {
            return "Yes";
        }

        if (value === false || value === 0) {
            return "No";
        }

        return String(value).replaceAll("_", " ");
    };

    /* =========================================================
       VIEW APPLICATION
    ========================================================= */

    const openApplicationDetailModal = async (permit) => {
        setOpenMenuId(null);

        setViewApplicationModalOpen(true);
        setApplicationDetail(null);
        setApplicationDetailLoading(true);

        try {
            const response =
                await getWorkPermitById(permit.id);

            if (response.data?.status) {
                setApplicationDetail(
                    response.data.data
                );
            } else {
                throw new Error(
                    response.data?.message ||
                    "Unable to fetch work permit."
                );
            }
        } catch (error) {
            console.error(
                "Work permit detail error:",
                error
            );

            setViewApplicationModalOpen(false);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch work permit details.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setApplicationDetailLoading(false);
        }
    };

    const closeApplicationDetailModal = () => {
        setViewApplicationModalOpen(false);
        setApplicationDetail(null);
    };

    /* =========================================================
       VIEW PAYMENT
    ========================================================= */

    const openViewPaymentModal = async (permit) => {
        setOpenMenuId(null);

        setViewPaymentPermit(permit);
        setViewPayments([]);
        setViewPaymentModalOpen(true);
        setViewPaymentLoading(true);

        try {
            const response =
                await getWorkPermitPayments(
                    permit.id
                );

            if (response.data?.status) {
                const payments =
                    Array.isArray(response.data.data)
                        ? response.data.data
                        : [];

                setViewPayments(payments);
            } else {
                throw new Error(
                    response.data?.message ||
                    "Unable to fetch payments."
                );
            }
        } catch (error) {
            console.error(
                "View payment error:",
                error
            );

            setViewPaymentModalOpen(false);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch payment information.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setViewPaymentLoading(false);
        }
    };

    const closeViewPaymentModal = () => {
        if (changingPaymentId) {
            return;
        }

        setViewPaymentModalOpen(false);
        setViewPaymentPermit(null);
        setViewPayments([]);
    };

    /* =========================================================
       CHANGE PAYMENT STATUS
    ========================================================= */

    const handleChangePaymentStatus = async (
        payment,
        newStatus
    ) => {
        if (!viewPaymentPermit) {
            return;
        }

        if (payment.status === newStatus) {
            return;
        }

        const result = await Swal.fire({
            icon: "question",
            title: "Change Payment Status?",
            text: `Change payment status from ${payment.status} to ${newStatus}?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Change",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#351255",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setChangingPaymentId(payment.id);

            const response =
                await changeWorkPermitPaymentStatus(
                    viewPaymentPermit.id,
                    payment.id,
                    newStatus
                );

            if (response.data?.status) {
                /*
                 * Update payment inside modal.
                 */
                setViewPayments((previous) =>
                    previous.map((item) =>
                        item.id === payment.id
                            ? {
                                ...item,
                                ...response.data.data,
                            }
                            : item
                    )
                );

                /*
                 * Refresh table payment badge.
                 */
                await fetchPaymentStatus(
                    viewPaymentPermit.id
                );

                Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        "Payment status updated successfully.",
                    confirmButtonColor: "#351255",
                });
            }
        } catch (error) {
            console.error(
                "Payment status update error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to update payment status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setChangingPaymentId(null);
        }
    };

    /* =========================================================
       ADD PAYMENT
    ========================================================= */

    const openPaymentModal = (permit) => {
        setOpenMenuId(null);

        setSelectedPermit(permit);

        setPaymentForm({
            amount_npr: "",
            receipt: null,
        });

        setPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        if (paymentSubmitting) {
            return;
        }

        setPaymentModalOpen(false);
        setSelectedPermit(null);

        setPaymentForm({
            amount_npr: "",
            receipt: null,
        });
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;

        setPaymentForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: "warning",
                title: "Invalid File",
                text: "Only JPG, JPEG, PNG and PDF files are allowed.",
                confirmButtonColor: "#351255",
            });

            e.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
                icon: "warning",
                title: "File Too Large",
                text: "Receipt must not exceed 10 MB.",
                confirmButtonColor: "#351255",
            });

            e.target.value = "";
            return;
        }

        setPaymentForm((previous) => ({
            ...previous,
            receipt: file,
        }));
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        if (!paymentForm.amount_npr) {
            Swal.fire({
                icon: "warning",
                title: "Required Field",
                text: "Please enter payment amount.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        if (!paymentForm.receipt) {
            Swal.fire({
                icon: "warning",
                title: "Receipt Required",
                text: "Please upload a payment receipt.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const data = new FormData();

        data.append(
            "amount_npr",
            paymentForm.amount_npr
        );

        data.append(
            "receipt",
            paymentForm.receipt
        );

        try {
            setPaymentSubmitting(true);

            const response =
                await createWorkPermitPayment(
                    selectedPermit.id,
                    data
                );

            if (response.data?.status) {
                await fetchPaymentStatus(
                    selectedPermit.id
                );

                setPaymentModalOpen(false);
                setSelectedPermit(null);

                setPaymentForm({
                    amount_npr: "",
                    receipt: null,
                });

                Swal.fire({
                    icon: "success",
                    title: "Payment Added",
                    text:
                        response.data?.message ||
                        "Payment receipt uploaded successfully.",
                    confirmButtonColor: "#351255",
                });
            }
        } catch (error) {
            console.error(
                "Payment create error:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to create payment.";

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
                title: "Payment Failed",
                text: errorMessage,
                confirmButtonColor: "#351255",
            });
        } finally {
            setPaymentSubmitting(false);
        }
    };

    /* =========================================================
       JSX
    ========================================================= */

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Navbar />

                <main className="dashboard-content">

                    <div className="work-permit-page">

                        {/* PAGE HEADER */}

                        <div className="work-permit-header">
                            <div>
                                <h1>
                                    Work Permits
                                </h1>

                                <p>
                                    Manage work permit applications
                                    submitted by users.
                                </p>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div className="work-permit-table-card">

                            <div className="work-permit-table-header">

                                <div>
                                    <h2>
                                        Work Permit Applications
                                    </h2>

                                    <p>
                                        {totalWorkPermits}{" "}
                                        {totalWorkPermits === 1
                                            ? "application"
                                            : "applications"}
                                    </p>
                                </div>

                            </div>

                            <div className="table-responsive">

                                <table className="work-permit-table">

                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Application No.</th>
                                            <th>Applicant</th>
                                            <th>Permit Type</th>
                                            <th>Passport No.</th>
                                            <th>Job Title</th>
                                            <th>Employer</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Payment Status</th>
                                            <th className="action-column">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {loading ? (

                                            <tr>
                                                <td
                                                    colSpan="11"
                                                    className="table-message"
                                                >
                                                    <div className="work-permit-loader"></div>
                                                    Loading work permit applications...
                                                </td>
                                            </tr>

                                        ) : workPermits.length === 0 ? (

                                            <tr>
                                                <td
                                                    colSpan="11"
                                                    className="table-message"
                                                >
                                                    No work permit applications found.
                                                </td>
                                            </tr>

                                        ) : (

                                            workPermits.map(
                                                (permit, index) => {

                                                    const paymentStatus =
                                                        getPaymentStatus(
                                                            permit
                                                        );

                                                    return (
                                                        <tr key={permit.id}>

                                                            <td>
                                                                {(page - 1) *
                                                                    10 +
                                                                    index +
                                                                    1}
                                                            </td>

                                                            <td>
                                                                <span className="application-number">
                                                                    {permit.application_number ||
                                                                        "-"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="applicant-info">

                                                                    <span className="applicant-name">
                                                                        {permit.applicant_full_name ||
                                                                            "-"}
                                                                    </span>

                                                                    <span className="applicant-email">
                                                                        {permit.email ||
                                                                            "-"}
                                                                    </span>

                                                                </div>
                                                            </td>

                                                            <td>
                                                                {displayValue(
                                                                    permit.permit_type
                                                                )}
                                                            </td>

                                                            <td>
                                                                {permit.passport_number ||
                                                                    "-"}
                                                            </td>

                                                            <td>
                                                                {permit.job_title ||
                                                                    "-"}
                                                            </td>

                                                            <td>
                                                                {permit.employer_company_name ||
                                                                    "-"}
                                                            </td>

                                                            <td>
                                                                {permit.phone_number ||
                                                                    "-"}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={`work-permit-status ${getStatusClass(
                                                                        permit.status
                                                                    )}`}
                                                                >
                                                                    {displayValue(
                                                                        permit.status
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={`payment-status ${getPaymentStatusClass(
                                                                        paymentStatus
                                                                    )}`}
                                                                >
                                                                    {displayValue(
                                                                        paymentStatus
                                                                    )}
                                                                </span>
                                                            </td>

                                                            {/* ACTIONS */}

                                                            <td className="action-column">

                                                                <div
                                                                    className="kebab-wrapper"
                                                                    ref={
                                                                        openMenuId ===
                                                                            permit.id
                                                                            ? menuRef
                                                                            : null
                                                                    }
                                                                >

                                                                    <button
                                                                        type="button"
                                                                        className="kebab-button"
                                                                        onClick={() =>
                                                                            toggleMenu(
                                                                                permit.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <FaEllipsisV />
                                                                    </button>

                                                                    {openMenuId ===
                                                                        permit.id && (

                                                                            <div className="kebab-menu">

                                                                                {/* VIEW APPLICATION */}

                                                                                <button
                                                                                    type="button"
                                                                                    className="kebab-menu-item"
                                                                                    onClick={() =>
                                                                                        openApplicationDetailModal(
                                                                                            permit
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <FaEye />

                                                                                    <span>
                                                                                        View Application
                                                                                    </span>
                                                                                </button>

                                                                                {/* VIEW PAYMENT */}

                                                                                <button
                                                                                    type="button"
                                                                                    className="kebab-menu-item"
                                                                                    onClick={() =>
                                                                                        openViewPaymentModal(
                                                                                            permit
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <FaCreditCard />

                                                                                    <span>
                                                                                        View Payment
                                                                                    </span>
                                                                                </button>

                                                                                {/* ADD PAYMENT */}

                                                                                <button
                                                                                    type="button"
                                                                                    className="kebab-menu-item"
                                                                                    onClick={() =>
                                                                                        openPaymentModal(
                                                                                            permit
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <FaPlus />

                                                                                    <span>
                                                                                        Add Payment
                                                                                    </span>
                                                                                </button>

                                                                                {/* DOCUMENT */}

                                                                                <button
                                                                                    type="button"
                                                                                    className="kebab-menu-item"
                                                                                    onClick={() =>
                                                                                        openViewDocumentsModal(
                                                                                            permit
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <FaFileAlt />

                                                                                    <span>
                                                                                        View Documents
                                                                                    </span>
                                                                                </button>

                                                                            </div>
                                                                        )}

                                                                </div>

                                                            </td>

                                                        </tr>
                                                    );
                                                }
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

                        {/* =================================================
                            VIEW APPLICATION MODAL
                        ================================================= */}

                        {viewApplicationModalOpen && (

                            <div
                                className="payment-modal-overlay"
                                onMouseDown={(e) => {
                                    if (
                                        e.target ===
                                        e.currentTarget
                                    ) {
                                        closeApplicationDetailModal();
                                    }
                                }}
                            >

                                <div className="payment-modal work-permit-detail-modal">

                                    <div className="payment-modal-header">

                                        <div>
                                            <h2>
                                                Work Permit Details
                                            </h2>

                                            <p>
                                                {applicationDetail
                                                    ?.application_number ||
                                                    "Application Information"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="payment-modal-close"
                                            onClick={
                                                closeApplicationDetailModal
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <div className="payment-modal-body">

                                        {applicationDetailLoading ? (

                                            <div className="modal-loading-state">
                                                <div className="work-permit-loader"></div>
                                                Loading application details...
                                            </div>

                                        ) : applicationDetail ? (

                                            <>
                                                {/* GENERAL */}

                                                <div className="detail-section">

                                                    <h3>
                                                        Application
                                                    </h3>

                                                    <div className="detail-grid">

                                                        <div className="detail-item">
                                                            <span>
                                                                Application No.
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.application_number
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Permit Type
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.permit_type
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Status
                                                            </span>

                                                            <strong>
                                                                <span
                                                                    className={`work-permit-status ${getStatusClass(
                                                                        applicationDetail.status
                                                                    )}`}
                                                                >
                                                                    {displayValue(
                                                                        applicationDetail.status
                                                                    )}
                                                                </span>
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Country
                                                            </span>

                                                            <strong>
                                                                {applicationDetail
                                                                    ?.country
                                                                    ?.country_name ||
                                                                    applicationDetail.country_name ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* APPLICANT */}

                                                <div className="detail-section">

                                                    <h3>
                                                        Applicant Information
                                                    </h3>

                                                    <div className="detail-grid">

                                                        <div className="detail-item">
                                                            <span>
                                                                Full Name
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.applicant_full_name
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Email
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.email
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Phone
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.phone_number
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Gender
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.gender
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                DOB (AD)
                                                            </span>

                                                            <strong>
                                                                {formatDate(
                                                                    applicationDetail.dob_ad
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                DOB (BS)
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.dob_bs
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Age
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.calculated_age
                                                                )}
                                                            </strong>
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* PASSPORT */}

                                                <div className="detail-section">

                                                    <h3>
                                                        Passport Information
                                                    </h3>

                                                    <div className="detail-grid">

                                                        <div className="detail-item">
                                                            <span>
                                                                Passport Number
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.passport_number
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Expiry Date
                                                            </span>

                                                            <strong>
                                                                {formatDate(
                                                                    applicationDetail.passport_expiry_date
                                                                )}
                                                            </strong>
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* EMPLOYMENT */}

                                                <div className="detail-section">

                                                    <h3>
                                                        Employment
                                                    </h3>

                                                    <div className="detail-grid">

                                                        <div className="detail-item">
                                                            <span>
                                                                Job Title
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.job_title
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Employer
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.employer_company_name
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Company Changed
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.company_changed
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Previous Shram No.
                                                            </span>

                                                            <strong>
                                                                {displayValue(
                                                                    applicationDetail.previous_shram_number
                                                                )}
                                                            </strong>
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* DATES */}

                                                <div className="detail-section">

                                                    <h3>
                                                        Record Information
                                                    </h3>

                                                    <div className="detail-grid">

                                                        <div className="detail-item">
                                                            <span>
                                                                Created
                                                            </span>

                                                            <strong>
                                                                {formatDateTime(
                                                                    applicationDetail.created_at
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Updated
                                                            </span>

                                                            <strong>
                                                                {formatDateTime(
                                                                    applicationDetail.updated_at
                                                                )}
                                                            </strong>
                                                        </div>

                                                    </div>

                                                </div>
                                            </>

                                        ) : (

                                            <div className="modal-empty-state">
                                                No application information found.
                                            </div>

                                        )}

                                    </div>

                                    <div className="payment-modal-footer">

                                        <button
                                            type="button"
                                            className="payment-cancel-button"
                                            onClick={
                                                closeApplicationDetailModal
                                            }
                                        >
                                            Close
                                        </button>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            VIEW PAYMENT MODAL
                        ================================================= */}

                        {viewPaymentModalOpen && (

                            <div
                                className="payment-modal-overlay"
                                onMouseDown={(e) => {
                                    if (
                                        e.target ===
                                        e.currentTarget &&
                                        !changingPaymentId
                                    ) {
                                        closeViewPaymentModal();
                                    }
                                }}
                            >

                                <div className="payment-modal view-payment-modal">

                                    <div className="payment-modal-header">

                                        <div>
                                            <h2>
                                                Payment Details
                                            </h2>

                                            <p>
                                                {viewPaymentPermit
                                                    ?.application_number ||
                                                    ""}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="payment-modal-close"
                                            onClick={
                                                closeViewPaymentModal
                                            }
                                            disabled={
                                                Boolean(
                                                    changingPaymentId
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <div className="payment-modal-body">

                                        {viewPaymentLoading ? (

                                            <div className="modal-loading-state">

                                                <div className="work-permit-loader"></div>

                                                Loading payment information...

                                            </div>

                                        ) : viewPayments.length === 0 ? (

                                            <div className="modal-empty-state">

                                                <FaCreditCard />

                                                <h3>
                                                    No Payment Found
                                                </h3>

                                                <p>
                                                    No payment has been added
                                                    for this work permit.
                                                </p>

                                            </div>

                                        ) : (

                                            <div className="payment-records">

                                                {viewPayments.map(
                                                    (
                                                        payment,
                                                        index
                                                    ) => (

                                                        <div
                                                            className="payment-record-card"
                                                            key={
                                                                payment.id
                                                            }
                                                        >

                                                            <div className="payment-record-header">

                                                                <div>

                                                                    <span className="payment-record-label">
                                                                        Payment{" "}
                                                                        {index +
                                                                            1}
                                                                    </span>

                                                                    <h3>
                                                                        {formatAmount(
                                                                            payment.amount_npr
                                                                        )}
                                                                    </h3>

                                                                </div>

                                                                <span
                                                                    className={`payment-status ${getPaymentStatusClass(
                                                                        payment.status
                                                                    )}`}
                                                                >
                                                                    {displayValue(
                                                                        payment.status
                                                                    )}
                                                                </span>

                                                            </div>

                                                            <div className="detail-grid">

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Payment ID
                                                                    </span>

                                                                    <strong>
                                                                        #
                                                                        {
                                                                            payment.id
                                                                        }
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Amount
                                                                    </span>

                                                                    <strong>
                                                                        {formatAmount(
                                                                            payment.amount_npr
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Receipt File
                                                                    </span>

                                                                    <strong>
                                                                        {payment.receipt_file_name ||
                                                                            "-"}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Created
                                                                    </span>

                                                                    <strong>
                                                                        {formatDateTime(
                                                                            payment.created_at
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Verified By
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            payment.verified_by
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Verified At
                                                                    </span>

                                                                    <strong>
                                                                        {formatDateTime(
                                                                            payment.verified_at
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                            </div>

                                                            {payment.remarks && (

                                                                <div className="payment-remarks">

                                                                    <span>
                                                                        Remarks
                                                                    </span>

                                                                    <p>
                                                                        {
                                                                            payment.remarks
                                                                        }
                                                                    </p>

                                                                </div>

                                                            )}

                                                            {/* RECEIPT */}

                                                            {payment.receipt_url && (

                                                                <div className="payment-receipt-section">

                                                                    <span className="payment-receipt-title">
                                                                        Receipt
                                                                    </span>

                                                                    {/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
                                                                        payment.receipt_url
                                                                    ) ? (

                                                                        <a
                                                                            href={
                                                                                payment.receipt_url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="payment-receipt-preview"
                                                                        >

                                                                            <img
                                                                                src={
                                                                                    payment.receipt_url
                                                                                }
                                                                                alt="Payment receipt"
                                                                            />

                                                                        </a>

                                                                    ) : null}

                                                                    <a
                                                                        href={
                                                                            payment.receipt_url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="receipt-view-button"
                                                                    >
                                                                        <FaExternalLinkAlt />

                                                                        View Receipt
                                                                    </a>

                                                                </div>

                                                            )}

                                                            {/* STATUS CHANGE */}

                                                            <div className="payment-status-action">

                                                                <label>
                                                                    Change Status
                                                                </label>

                                                                <div className="payment-status-buttons">

                                                                    <button
                                                                        type="button"
                                                                        className={`payment-status-action-btn verify ${payment.status ===
                                                                                "VERIFIED"
                                                                                ? "active"
                                                                                : ""
                                                                            }`}
                                                                        disabled={
                                                                            changingPaymentId ===
                                                                            payment.id ||
                                                                            payment.status ===
                                                                            "VERIFIED"
                                                                        }
                                                                        onClick={() =>
                                                                            handleChangePaymentStatus(
                                                                                payment,
                                                                                "VERIFIED"
                                                                            )
                                                                        }
                                                                    >
                                                                        {changingPaymentId ===
                                                                            payment.id
                                                                            ? "Updating..."
                                                                            : "Verify"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className={`payment-status-action-btn pending ${payment.status ===
                                                                                "PENDING"
                                                                                ? "active"
                                                                                : ""
                                                                            }`}
                                                                        disabled={
                                                                            changingPaymentId ===
                                                                            payment.id ||
                                                                            payment.status ===
                                                                            "PENDING"
                                                                        }
                                                                        onClick={() =>
                                                                            handleChangePaymentStatus(
                                                                                payment,
                                                                                "PENDING"
                                                                            )
                                                                        }
                                                                    >
                                                                        Pending
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className={`payment-status-action-btn reject ${payment.status ===
                                                                                "REJECTED"
                                                                                ? "active"
                                                                                : ""
                                                                            }`}
                                                                        disabled={
                                                                            changingPaymentId ===
                                                                            payment.id ||
                                                                            payment.status ===
                                                                            "REJECTED"
                                                                        }
                                                                        onClick={() =>
                                                                            handleChangePaymentStatus(
                                                                                payment,
                                                                                "REJECTED"
                                                                            )
                                                                        }
                                                                    >
                                                                        Reject
                                                                    </button>

                                                                </div>

                                                            </div>

                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    <div className="payment-modal-footer">

                                        <button
                                            type="button"
                                            className="payment-cancel-button"
                                            onClick={
                                                closeViewPaymentModal
                                            }
                                            disabled={
                                                Boolean(
                                                    changingPaymentId
                                                )
                                            }
                                        >
                                            Close
                                        </button>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            VIEW DOCUMENTS MODAL
                        ================================================= */}

                        {viewDocumentModalOpen && (
                            <div
                                className="payment-modal-overlay"
                                onMouseDown={(e) => {
                                    if (e.target === e.currentTarget) {
                                        closeViewDocumentsModal();
                                    }
                                }}
                            >
                                <div className="payment-modal view-payment-modal">
                                    <div className="payment-modal-header">
                                        <div>
                                            <h2>Permit Documents</h2>
                                            <p>
                                                {viewDocumentPermit?.application_number || ""}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="payment-modal-close"
                                            onClick={closeViewDocumentsModal}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="payment-modal-body">
                                        {viewDocumentLoading ? (
                                            <div className="modal-loading-state">
                                                <div className="work-permit-loader"></div>
                                                Loading permit documents...
                                            </div>
                                        ) : viewDocuments.length === 0 ? (
                                            <div className="modal-empty-state">
                                                <FaFileAlt />
                                                <h3>No Documents Found</h3>
                                                <p>
                                                    No documents have been uploaded for this work permit.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="payment-records">
                                                {viewDocuments.map((document, index) => (
                                                    <div
                                                        className="payment-record-card"
                                                        key={document.id || index}
                                                    >
                                                        <div className="payment-record-header">
                                                            <div>
                                                                <span className="payment-record-label">
                                                                    Document {index + 1}
                                                                </span>
                                                                <h3>
                                                                    {displayValue(document.document_type)}
                                                                </h3>
                                                            </div>

                                                            <span
                                                                className={`payment-status ${document.is_verified
                                                                        ? "payment-paid"
                                                                        : "payment-pending"
                                                                    }`}
                                                            >
                                                                {document.is_verified
                                                                    ? "VERIFIED"
                                                                    : "NOT VERIFIED"}
                                                            </span>
                                                        </div>

                                                        <div className="detail-grid">
                                                            <div className="detail-item">
                                                                <span>Document Type</span>
                                                                <strong>
                                                                    {displayValue(document.document_type)}
                                                                </strong>
                                                            </div>

                                                            <div className="detail-item">
                                                                <span>File Name</span>
                                                                <strong>
                                                                    {document.file_name || "-"}
                                                                </strong>
                                                            </div>

                                                            <div className="detail-item">
                                                                <span>File Type</span>
                                                                <strong>
                                                                    {document.file_mime_type || "-"}
                                                                </strong>
                                                            </div>

                                                            <div className="detail-item">
                                                                <span>File Size</span>
                                                                <strong>
                                                                    {document.file_size_bytes
                                                                        ? `${(
                                                                            Number(document.file_size_bytes) /
                                                                            1024
                                                                        ).toFixed(2)} KB`
                                                                        : "-"}
                                                                </strong>
                                                            </div>

                                                            <div className="detail-item">
                                                                <span>Uploaded</span>
                                                                <strong>
                                                                    {formatDateTime(document.created_at)}
                                                                </strong>
                                                            </div>
                                                        </div>

                                                        {document.file_url && (
                                                            <div className="payment-receipt-section">
                                                                <span className="payment-receipt-title">
                                                                    Document
                                                                </span>

                                                                {/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
                                                                    document.file_url
                                                                ) && (
                                                                        <a
                                                                            href={document.file_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="payment-receipt-preview"
                                                                        >
                                                                            <img
                                                                                src={document.file_url}
                                                                                alt={
                                                                                    document.document_type ||
                                                                                    "Permit document"
                                                                                }
                                                                            />
                                                                        </a>
                                                                    )}

                                                                <a
                                                                    href={document.file_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="receipt-view-button"
                                                                >
                                                                    <FaExternalLinkAlt />
                                                                    View Document
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="payment-modal-footer">
                                        <button
                                            type="button"
                                            className="payment-cancel-button"
                                            onClick={closeViewDocumentsModal}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            ADD PAYMENT MODAL
                        ================================================= */}

                        {paymentModalOpen && (

                            <div
                                className="payment-modal-overlay"
                                onMouseDown={(e) => {
                                    if (
                                        e.target ===
                                        e.currentTarget &&
                                        !paymentSubmitting
                                    ) {
                                        closePaymentModal();
                                    }
                                }}
                            >

                                <div className="payment-modal">

                                    <div className="payment-modal-header">

                                        <div>
                                            <h2>
                                                Add Payment
                                            </h2>

                                            <p>
                                                {selectedPermit
                                                    ?.application_number ||
                                                    ""}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="payment-modal-close"
                                            onClick={
                                                closePaymentModal
                                            }
                                            disabled={
                                                paymentSubmitting
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <form
                                        onSubmit={
                                            handlePaymentSubmit
                                        }
                                    >

                                        <div className="payment-modal-body">

                                            <div className="payment-applicant">

                                                <span>
                                                    Applicant
                                                </span>

                                                <strong>
                                                    {selectedPermit
                                                        ?.applicant_full_name ||
                                                        "-"}
                                                </strong>

                                            </div>

                                            <div className="payment-form-group">

                                                <label>
                                                    Amount (NPR)
                                                </label>

                                                <input
                                                    type="number"
                                                    name="amount_npr"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={
                                                        paymentForm.amount_npr
                                                    }
                                                    onChange={
                                                        handlePaymentChange
                                                    }
                                                    placeholder="Enter payment amount"
                                                    disabled={
                                                        paymentSubmitting
                                                    }
                                                    required
                                                />

                                            </div>

                                            <div className="payment-form-group">

                                                <label>
                                                    Payment Receipt
                                                </label>

                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={
                                                        handleReceiptChange
                                                    }
                                                    disabled={
                                                        paymentSubmitting
                                                    }
                                                    required
                                                />

                                                <span className="payment-file-help">
                                                    JPG, JPEG, PNG or PDF.
                                                    Maximum 10 MB.
                                                </span>

                                                {paymentForm.receipt && (

                                                    <span className="payment-selected-file">
                                                        Selected:{" "}
                                                        {
                                                            paymentForm
                                                                .receipt
                                                                .name
                                                        }
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                        <div className="payment-modal-footer">

                                            <button
                                                type="button"
                                                className="payment-cancel-button"
                                                onClick={
                                                    closePaymentModal
                                                }
                                                disabled={
                                                    paymentSubmitting
                                                }
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="payment-submit-button"
                                                disabled={
                                                    paymentSubmitting
                                                }
                                            >
                                                {paymentSubmitting
                                                    ? "Uploading..."
                                                    : "Add Payment"}
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            </div>
                        )}

                    </div>

                </main>

            </div>

        </div>
    );
};

export default WorkPermit;