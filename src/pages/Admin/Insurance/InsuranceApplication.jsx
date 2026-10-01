import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

import {
    FaEllipsisV,
    FaEye,
    FaFileAlt,
    FaExternalLinkAlt,
    FaUpload,
    FaUsers,
} from "react-icons/fa";

import {
    getAllInsuranceApplicationsCms,
    getInsuranceApplicationById,
    getInsuranceApplicantsByApplicationId,
    uploadInsuranceApplicationVoucher,
    verifyInsuranceDocument,
    changeInsuranceApplicationStatus,
} from "../../../api/BackendApi";

import "./InsuranceApplication.css";

import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const InsuranceApplication = () => {

    /* =========================================================
       INSURANCE APPLICATIONS
    ========================================================= */

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);

    /* =========================================================
       ACTION MENU
    ========================================================= */

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    /* =========================================================
       VIEW APPLICATION
    ========================================================= */

    const [viewApplicationModalOpen, setViewApplicationModalOpen] =
        useState(false);

    const [applicationDetail, setApplicationDetail] =
        useState(null);

    const [applicationDetailLoading, setApplicationDetailLoading] =
        useState(false);

    /* =========================================================
       APPLICANTS
    ========================================================= */

    const [viewApplicantsModalOpen, setViewApplicantsModalOpen] =
        useState(false);

    const [viewApplicantsApplication, setViewApplicantsApplication] =
        useState(null);

    const [viewApplicants, setViewApplicants] =
        useState([]);

    const [viewApplicantsLoading, setViewApplicantsLoading] =
        useState(false);

    /* =========================================================
       DOCUMENTS
    ========================================================= */

    const [viewDocumentModalOpen, setViewDocumentModalOpen] =
        useState(false);

    const [viewDocumentApplication, setViewDocumentApplication] =
        useState(null);

    const [viewDocuments, setViewDocuments] =
        useState([]);

    const [viewDocumentLoading, setViewDocumentLoading] =
        useState(false);

    const [verifyingDocumentId, setVerifyingDocumentId] =
        useState(null);

    /* =========================================================
       VOUCHER
    ========================================================= */

    const [voucherModalOpen, setVoucherModalOpen] =
        useState(false);

    const [selectedApplication, setSelectedApplication] =
        useState(null);

    const [voucherFile, setVoucherFile] =
        useState(null);

    const [voucherSubmitting, setVoucherSubmitting] =
        useState(false);

    /* =========================================================
       FETCH APPLICATIONS
    ========================================================= */

    const fetchApplications = async () => {

        try {

            setLoading(true);

            const response =
                await getAllInsuranceApplicationsCms(page);

            console.log(
                "INSURANCE APPLICATION CMS RESPONSE:",
                response.data
            );

            if (response.data?.status) {

                const paginationData =
                    response.data?.data;

                setApplications(
                    paginationData?.data || []
                );

                setTotalPages(
                    paginationData?.last_page || 1
                );

                setTotalApplications(
                    paginationData?.total || 0
                );

            } else {

                throw new Error(
                    response.data?.message ||
                    "Unable to fetch insurance applications."
                );
            }

        } catch (error) {

            console.error(
                "Insurance application fetch error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch insurance applications.",
                confirmButtonColor: "#351255",
            });

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchApplications();

    }, [page]);

    /* =========================================================
       CLOSE KEBAB
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
       HELPERS
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
       STATUS
    ========================================================= */

    const getStatusClass = (status) => {

        switch (status?.toUpperCase()) {

            case "DRAFT":
                return "status-draft";

            case "SUBMITTED":
                return "status-submitted";

            case "PROCESSING":
                return "status-processing";

            case "APPROVED":
                return "status-approved";

            case "REJECTED":
                return "status-rejected";

            case "COMPLETED":
                return "status-completed";

            default:
                return "status-default";
        }
    };

    const getPaymentStatusClass = (status) => {

        switch (status?.toUpperCase()) {

            case "PAID":
            case "VERIFIED":
            case "APPROVED":
                return "payment-paid";

            case "PENDING":
            case "SUBMITTED":
                return "payment-pending";

            case "FAILED":
            case "REJECTED":
                return "payment-rejected";

            case "UNPAID":
            case "NOT_PAID":
                return "payment-unpaid";

            default:
                return "payment-default";
        }
    };

    /* =========================================================
       VIEW APPLICATION
    ========================================================= */

    const openApplicationDetailModal = async (application) => {

        setOpenMenuId(null);

        setViewApplicationModalOpen(true);
        setApplicationDetail(null);
        setApplicationDetailLoading(true);

        try {

            const response =
                await getInsuranceApplicationById(
                    application.id
                );

            console.log(
                "INSURANCE APPLICATION DETAIL:",
                response.data
            );

            if (response.data?.status) {

                setApplicationDetail(
                    response.data.data
                );

            } else {

                throw new Error(
                    response.data?.message ||
                    "Unable to fetch insurance application."
                );
            }

        } catch (error) {

            console.error(
                "Insurance application detail error:",
                error
            );

            setViewApplicationModalOpen(false);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch insurance application details.",
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
       VIEW APPLICANTS
    ========================================================= */

    const openViewApplicantsModal = async (application) => {

        setOpenMenuId(null);

        setViewApplicantsApplication(application);
        setViewApplicants([]);
        setViewApplicantsModalOpen(true);
        setViewApplicantsLoading(true);

        try {

            const response =
                await getInsuranceApplicantsByApplicationId(
                    application.id
                );

            if (response.data?.status) {

                const applicants =
                    response.data?.data;

                setViewApplicants(
                    Array.isArray(applicants)
                        ? applicants
                        : applicants?.data || []
                );

            } else {

                throw new Error(
                    response.data?.message ||
                    "Unable to fetch insurance applicants."
                );
            }

        } catch (error) {

            console.error(
                "Insurance applicants error:",
                error
            );

            setViewApplicantsModalOpen(false);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch insurance applicants.",
                confirmButtonColor: "#351255",
            });

        } finally {

            setViewApplicantsLoading(false);
        }
    };

    const closeViewApplicantsModal = () => {

        setViewApplicantsModalOpen(false);
        setViewApplicantsApplication(null);
        setViewApplicants([]);
    };

    /* =========================================================
       VIEW DOCUMENTS
    ========================================================= */

    const openViewDocumentsModal = async (application) => {

        setOpenMenuId(null);

        setViewDocumentApplication(application);
        setViewDocuments([]);
        setViewDocumentModalOpen(true);
        setViewDocumentLoading(true);

        try {

            /*
             * Insurance show() already loads:
             *
             * applicants.documents.requirement
             * applicants.documents.verifiedBy
             */

            const response =
                await getInsuranceApplicationById(
                    application.id
                );

            if (response.data?.status) {

                const detail =
                    response.data.data;

                const documents =
                    Array.isArray(detail?.applicants)
                        ? detail.applicants.flatMap(
                            (applicant) =>
                                Array.isArray(applicant?.documents)
                                    ? applicant.documents.map(
                                        (document) => ({
                                            ...document,
                                            applicant_full_name:
                                                applicant.applicant_full_name,
                                            insurance_applicant_id:
                                                applicant.id,
                                        })
                                    )
                                    : []
                        )
                        : [];

                setViewDocuments(documents);

            } else {

                throw new Error(
                    response.data?.message ||
                    "Unable to fetch insurance documents."
                );
            }

        } catch (error) {

            console.error(
                "Insurance documents error:",
                error
            );

            setViewDocumentModalOpen(false);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to fetch insurance documents.",
                confirmButtonColor: "#351255",
            });

        } finally {

            setViewDocumentLoading(false);
        }
    };

    const closeViewDocumentsModal = () => {

        if (verifyingDocumentId) {
            return;
        }

        setViewDocumentModalOpen(false);
        setViewDocumentApplication(null);
        setViewDocuments([]);
    };

    /* =========================================================
       VERIFY DOCUMENT
    ========================================================= */

    const handleVerifyDocument = async (document) => {

        const newVerifiedStatus =
            !Boolean(document.is_verified);

        setViewDocumentModalOpen(false);

        await new Promise((resolve) =>
            setTimeout(resolve, 50)
        );

        const result = await Swal.fire({

            icon: "question",

            title: newVerifiedStatus
                ? "Verify Document?"
                : "Unverify Document?",

            text: newVerifiedStatus
                ? "Are you sure you want to verify this document?"
                : "Are you sure you want to remove verification from this document?",

            input: "textarea",

            inputLabel: "Remarks",

            inputPlaceholder:
                "Enter remarks (optional)",

            showCancelButton: true,

            confirmButtonText:
                newVerifiedStatus
                    ? "Yes, Verify"
                    : "Yes, Unverify",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#351255",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            setVerifyingDocumentId(
                document.id
            );

            const response =
                await verifyInsuranceDocument(
                    document.id,
                    {
                        is_verified:
                            newVerifiedStatus,

                        remarks:
                            result.value || null,
                    }
                );

            if (response.data?.status) {

                setViewDocumentApplication(null);
                setViewDocuments([]);

                await Swal.fire({
                    icon: "success",

                    title: newVerifiedStatus
                        ? "Document Verified"
                        : "Verification Removed",

                    text:
                        response.data?.message ||
                        "Document verification updated.",

                    confirmButtonColor:
                        "#351255",
                });
            }

        } catch (error) {

            console.error(
                "Insurance document verification error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to update document verification.",
                confirmButtonColor: "#351255",
            });

        } finally {

            setVerifyingDocumentId(null);
        }
    };

    /* =========================================================
       CHANGE APPLICATION STATUS
    ========================================================= */

    const handleChangeApplicationStatus = async (
        application,
        newStatus
    ) => {

        if (application.status === newStatus) {
            return;
        }

        setOpenMenuId(null);

        const result = await Swal.fire({

            icon: "question",

            title: "Change Application Status?",

            text:
                `Change application status from ` +
                `${displayValue(application.status)} to ` +
                `${displayValue(newStatus)}?`,

            showCancelButton: true,

            confirmButtonText: "Yes, Change",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#351255",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {

            const response =
                await changeInsuranceApplicationStatus(
                    application.id,
                    {
                        status: newStatus,
                    }
                );

            if (response.data?.status) {

                setApplications(
                    (previous) =>
                        previous.map(
                            (item) =>
                                item.id === application.id
                                    ? {
                                        ...item,
                                        ...(response.data?.data || {}),
                                    }
                                    : item
                        )
                );

                setApplicationDetail((previous) =>
                    previous &&
                    previous.id === application.id
                        ? {
                            ...previous,
                            ...(response.data?.data || {}),
                            status:
                                response.data?.data?.status ||
                                newStatus,
                        }
                        : previous
                );

                Swal.fire({
                    icon: "success",
                    title: "Status Updated",
                    text:
                        response.data?.message ||
                        "Insurance application status updated successfully.",
                    confirmButtonColor: "#351255",
                });
            }

        } catch (error) {

            console.error(
                "Insurance status update error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text:
                    error.response?.data?.message ||
                    "Unable to update insurance application status.",
                confirmButtonColor: "#351255",
            });
        }
    };

    /* =========================================================
       VOUCHER
    ========================================================= */

    const openVoucherModal = (application) => {

        setOpenMenuId(null);

        setSelectedApplication(application);
        setVoucherFile(null);
        setVoucherModalOpen(true);
    };

    const closeVoucherModal = () => {

        if (voucherSubmitting) {
            return;
        }

        setVoucherModalOpen(false);
        setSelectedApplication(null);
        setVoucherFile(null);
    };

    const handleVoucherFileChange = (e) => {

        const file =
            e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {

            Swal.fire({
                icon: "warning",
                title: "Invalid File",
                text:
                    "Only JPG, JPEG, PNG, WEBP and PDF files are allowed.",
                confirmButtonColor: "#351255",
            });

            e.target.value = "";

            return;
        }

        /*
         * Insurance backend max:
         * 5120 KB = 5 MB
         */

        if (file.size > 5 * 1024 * 1024) {

            Swal.fire({
                icon: "warning",
                title: "File Too Large",
                text:
                    "Voucher must not exceed 5 MB.",
                confirmButtonColor: "#351255",
            });

            e.target.value = "";

            return;
        }

        setVoucherFile(file);
    };

    const handleVoucherSubmit = async (e) => {

        e.preventDefault();

        if (!selectedApplication) {
            return;
        }

        if (!voucherFile) {

            Swal.fire({
                icon: "warning",
                title: "Voucher Required",
                text:
                    "Please select a voucher or receipt.",
                confirmButtonColor: "#351255",
            });

            return;
        }

        const formData =
            new FormData();

        formData.append(
            "voucher",
            voucherFile
        );

        try {

            setVoucherSubmitting(true);

            const response =
                await uploadInsuranceApplicationVoucher(
                    selectedApplication.id,
                    formData
                );

            if (response.data?.status) {

                await fetchApplications();

                setVoucherModalOpen(false);
                setSelectedApplication(null);
                setVoucherFile(null);

                Swal.fire({
                    icon: "success",
                    title: "Voucher Uploaded",
                    text:
                        response.data?.message ||
                        "Insurance voucher uploaded successfully.",
                    confirmButtonColor: "#351255",
                });
            }

        } catch (error) {

            console.error(
                "Insurance voucher upload error:",
                error
            );

            let errorMessage =
                error.response?.data?.message ||
                "Unable to upload voucher.";

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
                title: "Upload Failed",
                text: errorMessage,
                confirmButtonColor: "#351255",
            });

        } finally {

            setVoucherSubmitting(false);
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

                        {/* ================= HEADER ================= */}

                        <div className="work-permit-header">

                            <div>

                                <h1>
                                    Insurance Applications
                                </h1>

                                <p>
                                    Manage insurance applications submitted by users.
                                </p>

                            </div>

                        </div>

                        {/* ================= TABLE ================= */}

                        <div className="work-permit-table-card">

                            <div className="work-permit-table-header">

                                <div>

                                    <h2>
                                        Insurance Applications
                                    </h2>

                                    <p>
                                        {totalApplications}{" "}
                                        {totalApplications === 1
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

                                            <th>
                                                Application No.
                                            </th>

                                            <th>
                                                Insurance Plan
                                            </th>

                                            <th>
                                                Pricing Tier
                                            </th>

                                            <th>
                                                Coverage
                                            </th>

                                            <th>
                                                Applicants
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Payment Status
                                            </th>

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

                                                    <div className="work-permit-loader"></div>

                                                    Loading insurance applications...

                                                </td>

                                            </tr>

                                        ) : applications.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="10"
                                                    className="table-message"
                                                >
                                                    No insurance applications found.
                                                </td>

                                            </tr>

                                        ) : (

                                            applications.map(
                                                (
                                                    application,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            application.id
                                                        }
                                                    >

                                                        <td>

                                                            {(page - 1) * 10 +
                                                                index +
                                                                1}

                                                        </td>

                                                        <td>

                                                            <span className="application-number">

                                                                {application.application_number ||
                                                                    "-"}

                                                            </span>

                                                        </td>

                                                        <td>

                                                            {application
                                                                ?.insurance_plan
                                                                ?.name ||
                                                                "-"}

                                                        </td>

                                                        <td>

                                                            {application
                                                                ?.pricing_tier
                                                                ?.title ||
                                                                "-"}

                                                        </td>

                                                        <td>

                                                            <div className="applicant-info">

                                                                <span className="applicant-name">

                                                                    {formatDate(
                                                                        application.start_date
                                                                    )}

                                                                </span>

                                                                <span className="applicant-email">

                                                                    to{" "}
                                                                    {formatDate(
                                                                        application.end_date
                                                                    )}

                                                                </span>

                                                            </div>

                                                        </td>

                                                        <td>

                                                            {application.applicant_count ??
                                                                0}

                                                        </td>

                                                        <td>

                                                            {formatAmount(
                                                                application.total_amount
                                                            )}

                                                        </td>

                                                        <td>

                                                            <span
                                                                className={`work-permit-status ${getStatusClass(
                                                                    application.status
                                                                )}`}
                                                            >

                                                                {displayValue(
                                                                    application.status
                                                                )}

                                                            </span>

                                                        </td>

                                                        <td>

                                                            <span
                                                                className={`payment-status ${getPaymentStatusClass(
                                                                    application.payment_status
                                                                )}`}
                                                            >

                                                                {displayValue(
                                                                    application.payment_status ||
                                                                    "PENDING"
                                                                )}

                                                            </span>

                                                        </td>

                                                        <td className="action-column">

                                                            <div
                                                                className="kebab-wrapper"
                                                                ref={
                                                                    openMenuId ===
                                                                    application.id
                                                                        ? menuRef
                                                                        : null
                                                                }
                                                            >

                                                                <button
                                                                    type="button"
                                                                    className="kebab-button"
                                                                    onClick={() =>
                                                                        toggleMenu(
                                                                            application.id
                                                                        )
                                                                    }
                                                                >
                                                                    <FaEllipsisV />
                                                                </button>

                                                                {openMenuId ===
                                                                    application.id && (

                                                                    <div className="kebab-menu">

                                                                        <button
                                                                            type="button"
                                                                            className="kebab-menu-item"
                                                                            onClick={() =>
                                                                                openApplicationDetailModal(
                                                                                    application
                                                                                )
                                                                            }
                                                                        >

                                                                            <FaEye />

                                                                            <span>
                                                                                View Application
                                                                            </span>

                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="kebab-menu-item"
                                                                            onClick={() =>
                                                                                openViewApplicantsModal(
                                                                                    application
                                                                                )
                                                                            }
                                                                        >

                                                                            <FaUsers />

                                                                            <span>
                                                                                View Applicants
                                                                            </span>

                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="kebab-menu-item"
                                                                            onClick={() =>
                                                                                openVoucherModal(
                                                                                    application
                                                                                )
                                                                            }
                                                                        >

                                                                            <FaUpload />

                                                                            <span>
                                                                                Upload Voucher/Receipt
                                                                            </span>

                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="kebab-menu-item"
                                                                            onClick={() =>
                                                                                openViewDocumentsModal(
                                                                                    application
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

                        {/* =================================================
                            APPLICATION DETAIL
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
                                                Insurance Application Details
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

                                                {/* APPLICATION */}

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
                                                                Insurance Plan
                                                            </span>

                                                            <strong>
                                                                {applicationDetail
                                                                    ?.insurance_plan
                                                                    ?.name ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Pricing Tier
                                                            </span>

                                                            <strong>
                                                                {applicationDetail
                                                                    ?.pricing_tier
                                                                    ?.title ||
                                                                    "-"}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Tier Duration
                                                            </span>

                                                            <strong>
                                                                {applicationDetail
                                                                    ?.pricing_tier
                                                                    ?.duration_days
                                                                    ? `${applicationDetail.pricing_tier.duration_days} Days`
                                                                    : "-"}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Start Date
                                                            </span>

                                                            <strong>
                                                                {formatDate(
                                                                    applicationDetail.start_date
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                End Date
                                                            </span>

                                                            <strong>
                                                                {formatDate(
                                                                    applicationDetail.end_date
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Applicants
                                                            </span>

                                                            <strong>
                                                                {applicationDetail.applicant_count ??
                                                                    0}
                                                            </strong>
                                                        </div>

                                                        <div className="detail-item">
                                                            <span>
                                                                Total Amount
                                                            </span>

                                                            <strong>
                                                                {formatAmount(
                                                                    applicationDetail.total_amount
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
                                                                Payment Status
                                                            </span>

                                                            <strong>
                                                                <span
                                                                    className={`payment-status ${getPaymentStatusClass(
                                                                        applicationDetail.payment_status
                                                                    )}`}
                                                                >
                                                                    {displayValue(
                                                                        applicationDetail.payment_status
                                                                    )}
                                                                </span>
                                                            </strong>
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* USER */}

                                                {applicationDetail.user && (

                                                    <div className="detail-section">

                                                        <h3>
                                                            User Information
                                                        </h3>

                                                        <div className="detail-grid">

                                                            <div className="detail-item">
                                                                <span>Name</span>
                                                                <strong>
                                                                    {applicationDetail
                                                                        ?.user
                                                                        ?.name ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                            <div className="detail-item">
                                                                <span>Email</span>
                                                                <strong>
                                                                    {applicationDetail
                                                                        ?.user
                                                                        ?.email ||
                                                                        "-"}
                                                                </strong>
                                                            </div>

                                                        </div>

                                                    </div>
                                                )}

                                                {/* VOUCHER */}

                                                <div className="detail-section">

                                                    <h3>
                                                        Voucher / Receipt
                                                    </h3>

                                                    <div className="detail-grid">

                                                        <div className="detail-item">

                                                            <span>
                                                                Uploaded At
                                                            </span>

                                                            <strong>
                                                                {formatDateTime(
                                                                    applicationDetail.voucher_uploaded_at
                                                                )}
                                                            </strong>

                                                        </div>

                                                        <div className="detail-item">

                                                            <span>
                                                                Uploaded By
                                                            </span>

                                                            <strong>

                                                                {applicationDetail
                                                                    ?.voucher_uploaded_by
                                                                    ?.name ||
                                                                    applicationDetail
                                                                        ?.voucher_uploaded_by
                                                                        ?.email ||
                                                                    "-"}

                                                            </strong>

                                                        </div>

                                                    </div>

                                                    {applicationDetail.voucher_url && (

                                                        <div className="payment-receipt-section">

                                                            <span className="payment-receipt-title">
                                                                Voucher
                                                            </span>

                                                            {/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
                                                                applicationDetail.voucher_url
                                                            ) && (

                                                                <a
                                                                    href={
                                                                        applicationDetail.voucher_url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="payment-receipt-preview"
                                                                >

                                                                    <img
                                                                        src={
                                                                            applicationDetail.voucher_url
                                                                        }
                                                                        alt="Insurance voucher"
                                                                    />

                                                                </a>
                                                            )}

                                                            <a
                                                                href={
                                                                    applicationDetail.voucher_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="receipt-view-button"
                                                            >
                                                                <FaExternalLinkAlt />
                                                                View Voucher
                                                            </a>

                                                        </div>
                                                    )}

                                                </div>

                                                {/* STATUS */}

                                                <div className="detail-section">

                                                    <h3>
                                                        Application Status
                                                    </h3>

                                                    <div className="payment-status-buttons">

                                                        {[
                                                            "DRAFT",
                                                            "SUBMITTED",
                                                            "PROCESSING",
                                                            "APPROVED",
                                                            "REJECTED",
                                                            "COMPLETED",
                                                        ].map(
                                                            (status) => (

                                                                <button
                                                                    key={
                                                                        status
                                                                    }
                                                                    type="button"
                                                                    className={`payment-status-action-btn ${
                                                                        applicationDetail.status ===
                                                                        status
                                                                            ? "active"
                                                                            : ""
                                                                    }`}
                                                                    disabled={
                                                                        applicationDetail.status ===
                                                                        status
                                                                    }
                                                                    onClick={() =>
                                                                        handleChangeApplicationStatus(
                                                                            applicationDetail,
                                                                            status
                                                                        )
                                                                    }
                                                                >

                                                                    {displayValue(
                                                                        status
                                                                    )}

                                                                </button>
                                                            )
                                                        )}

                                                    </div>

                                                </div>

                                                {/* RECORD */}

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
                            APPLICANTS
                        ================================================= */}

                        {viewApplicantsModalOpen && (

                            <div
                                className="payment-modal-overlay"
                                onMouseDown={(e) => {

                                    if (
                                        e.target ===
                                        e.currentTarget
                                    ) {
                                        closeViewApplicantsModal();
                                    }
                                }}
                            >

                                <div className="payment-modal view-payment-modal">

                                    <div className="payment-modal-header">

                                        <div>

                                            <h2>
                                                Insurance Applicants
                                            </h2>

                                            <p>
                                                {viewApplicantsApplication
                                                    ?.application_number ||
                                                    ""}
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            className="payment-modal-close"
                                            onClick={
                                                closeViewApplicantsModal
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <div className="payment-modal-body">

                                        {viewApplicantsLoading ? (

                                            <div className="modal-loading-state">

                                                <div className="work-permit-loader"></div>

                                                Loading insurance applicants...

                                            </div>

                                        ) : viewApplicants.length === 0 ? (

                                            <div className="modal-empty-state">

                                                <FaUsers />

                                                <h3>
                                                    No Applicants Found
                                                </h3>

                                                <p>
                                                    No applicants were found for this insurance application.
                                                </p>

                                            </div>

                                        ) : (

                                            <div className="payment-records">

                                                {viewApplicants.map(
                                                    (
                                                        applicant,
                                                        index
                                                    ) => (

                                                        <div
                                                            className="payment-record-card"
                                                            key={
                                                                applicant.id ||
                                                                index
                                                            }
                                                        >

                                                            <div className="payment-record-header">

                                                                <div>

                                                                    <span className="payment-record-label">

                                                                        Applicant{" "}
                                                                        {index + 1}

                                                                    </span>

                                                                    <h3>
                                                                        {applicant.applicant_full_name ||
                                                                            "-"}
                                                                    </h3>

                                                                </div>

                                                            </div>

                                                            <div className="detail-grid">

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Nationality
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            applicant.nationality
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Date of Birth
                                                                    </span>

                                                                    <strong>
                                                                        {formatDate(
                                                                            applicant.date_of_birth
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Email
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            applicant.email
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Phone
                                                                    </span>

                                                                    <strong>

                                                                        {applicant.country_code
                                                                            ? `${applicant.country_code} `
                                                                            : ""}

                                                                        {applicant.phone_number ||
                                                                            "-"}

                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Passport Number
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            applicant.passport_number
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Emergency Contact
                                                                    </span>

                                                                    <strong>
                                                                        {applicant.emergency_contact_phone ||
                                                                            applicant.emergency_contact_number ||
                                                                            "-"}
                                                                    </strong>

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
                                                closeViewApplicantsModal
                                            }
                                        >
                                            Close
                                        </button>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            DOCUMENTS
                        ================================================= */}

                        {viewDocumentModalOpen && (

                            <div
                                className="payment-modal-overlay"
                                onMouseDown={(e) => {

                                    if (
                                        e.target ===
                                            e.currentTarget &&
                                        !verifyingDocumentId
                                    ) {
                                        closeViewDocumentsModal();
                                    }
                                }}
                            >

                                <div className="payment-modal view-payment-modal">

                                    <div className="payment-modal-header">

                                        <div>

                                            <h2>
                                                Insurance Documents
                                            </h2>

                                            <p>
                                                {viewDocumentApplication
                                                    ?.application_number ||
                                                    ""}
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            className="payment-modal-close"
                                            onClick={
                                                closeViewDocumentsModal
                                            }
                                            disabled={
                                                Boolean(
                                                    verifyingDocumentId
                                                )
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <div className="payment-modal-body">

                                        {viewDocumentLoading ? (

                                            <div className="modal-loading-state">

                                                <div className="work-permit-loader"></div>

                                                Loading insurance documents...

                                            </div>

                                        ) : viewDocuments.length === 0 ? (

                                            <div className="modal-empty-state">

                                                <FaFileAlt />

                                                <h3>
                                                    No Documents Found
                                                </h3>

                                                <p>
                                                    No documents have been uploaded for this insurance application.
                                                </p>

                                            </div>

                                        ) : (

                                            <div className="payment-records">

                                                {viewDocuments.map(
                                                    (
                                                        document,
                                                        index
                                                    ) => (

                                                        <div
                                                            className="payment-record-card"
                                                            key={
                                                                document.id ||
                                                                index
                                                            }
                                                        >

                                                            <div className="payment-record-header">

                                                                <div>

                                                                    <span className="payment-record-label">

                                                                        Document{" "}
                                                                        {index + 1}

                                                                    </span>

                                                                    <h3>

                                                                        {document
                                                                            ?.requirement
                                                                            ?.title ||
                                                                            document
                                                                                ?.requirement
                                                                                ?.document_type ||
                                                                            "Document"}

                                                                    </h3>

                                                                </div>

                                                                <span
                                                                    className={`payment-status ${
                                                                        document.is_verified
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

                                                                    <span>
                                                                        Requirement
                                                                    </span>

                                                                    <strong>
                                                                        {document
                                                                            ?.requirement
                                                                            ?.title ||
                                                                            "-"}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Document Type
                                                                    </span>

                                                                    <strong>
                                                                        {displayValue(
                                                                            document
                                                                                ?.requirement
                                                                                ?.document_type
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Applicant
                                                                    </span>

                                                                    <strong>
                                                                        {document.applicant_full_name ||
                                                                            "-"}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        File Name
                                                                    </span>

                                                                    <strong>
                                                                        {document.file_name ||
                                                                            "-"}
                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Verified By
                                                                    </span>

                                                                    <strong>

                                                                        {document
                                                                            ?.verified_by
                                                                            ?.name ||
                                                                            document
                                                                                ?.verified_by
                                                                                ?.email ||
                                                                            "-"}

                                                                    </strong>

                                                                </div>

                                                                <div className="detail-item">

                                                                    <span>
                                                                        Verified At
                                                                    </span>

                                                                    <strong>
                                                                        {formatDateTime(
                                                                            document.verified_at
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                            </div>

                                                            {document.remarks && (

                                                                <div className="payment-remarks">

                                                                    <span>
                                                                        Remarks
                                                                    </span>

                                                                    <p>
                                                                        {document.remarks}
                                                                    </p>

                                                                </div>
                                                            )}

                                                            {document.file_url && (

                                                                <div className="payment-receipt-section">

                                                                    <span className="payment-receipt-title">
                                                                        Document
                                                                    </span>

                                                                    {/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
                                                                        document.file_url
                                                                    ) && (

                                                                        <a
                                                                            href={
                                                                                document.file_url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="payment-receipt-preview"
                                                                        >

                                                                            <img
                                                                                src={
                                                                                    document.file_url
                                                                                }
                                                                                alt="Insurance document"
                                                                            />

                                                                        </a>
                                                                    )}

                                                                    <div className="document-action-buttons">

                                                                        <a
                                                                            href={
                                                                                document.file_url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="receipt-view-button"
                                                                        >

                                                                            <FaExternalLinkAlt />

                                                                            View Document

                                                                        </a>

                                                                        <button
                                                                            type="button"
                                                                            className={`payment-status-action-btn ${
                                                                                document.is_verified
                                                                                    ? "reject"
                                                                                    : "verify"
                                                                            }`}
                                                                            disabled={
                                                                                verifyingDocumentId ===
                                                                                document.id
                                                                            }
                                                                            onClick={() =>
                                                                                handleVerifyDocument(
                                                                                    document
                                                                                )
                                                                            }
                                                                        >

                                                                            {verifyingDocumentId ===
                                                                            document.id
                                                                                ? "Updating..."
                                                                                : document.is_verified
                                                                                  ? "Unverify"
                                                                                  : "Verify"}

                                                                        </button>

                                                                    </div>

                                                                </div>
                                                            )}

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
                                                closeViewDocumentsModal
                                            }
                                            disabled={
                                                Boolean(
                                                    verifyingDocumentId
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
                            VOUCHER
                        ================================================= */}

                        {voucherModalOpen && (

                            <div
                                className="payment-modal-overlay"
                                onMouseDown={(e) => {

                                    if (
                                        e.target ===
                                            e.currentTarget &&
                                        !voucherSubmitting
                                    ) {
                                        closeVoucherModal();
                                    }
                                }}
                            >

                                <div className="payment-modal">

                                    <div className="payment-modal-header">

                                        <div>

                                            <h2>
                                                Upload Voucher / Receipt
                                            </h2>

                                            <p>
                                                {selectedApplication
                                                    ?.application_number ||
                                                    ""}
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            className="payment-modal-close"
                                            onClick={
                                                closeVoucherModal
                                            }
                                            disabled={
                                                voucherSubmitting
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                    <form
                                        onSubmit={
                                            handleVoucherSubmit
                                        }
                                    >

                                        <div className="payment-modal-body">

                                            <div className="payment-applicant">

                                                <span>
                                                    Insurance Plan
                                                </span>

                                                <strong>
                                                    {selectedApplication
                                                        ?.insurance_plan
                                                        ?.name ||
                                                        "-"}
                                                </strong>

                                            </div>

                                            <div className="payment-applicant">

                                                <span>
                                                    Application
                                                </span>

                                                <strong>
                                                    {selectedApplication
                                                        ?.application_number ||
                                                        "-"}
                                                </strong>

                                            </div>

                                            <div className="payment-applicant">

                                                <span>
                                                    Total Amount
                                                </span>

                                                <strong>
                                                    {formatAmount(
                                                        selectedApplication
                                                            ?.total_amount
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="payment-form-group">

                                                <label>
                                                    Voucher / Receipt
                                                </label>

                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                    onChange={
                                                        handleVoucherFileChange
                                                    }
                                                    disabled={
                                                        voucherSubmitting
                                                    }
                                                    required
                                                />

                                                <span className="payment-file-help">

                                                    JPG, JPEG, PNG, WEBP or PDF.
                                                    Maximum 5 MB.

                                                </span>

                                                {voucherFile && (

                                                    <span className="payment-selected-file">

                                                        Selected:{" "}
                                                        {voucherFile.name}

                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                        <div className="payment-modal-footer">

                                            <button
                                                type="button"
                                                className="payment-cancel-button"
                                                onClick={
                                                    closeVoucherModal
                                                }
                                                disabled={
                                                    voucherSubmitting
                                                }
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="payment-submit-button"
                                                disabled={
                                                    voucherSubmitting
                                                }
                                            >

                                                {voucherSubmitting
                                                    ? "Uploading..."
                                                    : "Upload Voucher"}

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

export default InsuranceApplication;