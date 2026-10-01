import axiosInstance from "../service/axiosInstance";
import axios from "axios";

export const loginUser = (loginData) => {
    return axiosInstance.post("/auth/login", loginData);
};

export const googleLogin = (idToken) => {
    return axiosInstance.post("/auth/google", {
        id_token: idToken,
    });
};


// BOOKING
export const getAllBookingsCms = (page = 1) => {
    return axiosInstance.get(`/getAllbookings?page=${page}`);
};

export const getHeliBookingDocuments = (bookingId, packageId) => {
    return axiosInstance.get(
        `/${bookingId}/heli-documents/${packageId}`
    );
};


export const deleteBooking = (id) => {
    return axiosInstance.delete(`/bookings/${id}`);
};

// ROLES

export const getAllRoles = (page = 1) => {
    return axiosInstance.get(`/roles/active-role?page=${page}`);
};

export const getAllRolesCms = (page = 1) => {
    return axiosInstance.get(`/roles/cms?page=${page}`);
};

// Get single role
export const getRoleById = (id) => {
    return axiosInstance.get(`/roles/${id}`);
};

// Create role
export const createRole = (data) => {
    return axiosInstance.post(`/roles/store`, data);
};

// Update role
export const updateRole = (id, data) => {
    return axiosInstance.put(`/roles/${id}`, data);
};

// Change role status
export const changeRoleStatus = (id) => {
    return axiosInstance.put(`/roles/${id}/status`);
};

// Delete role
export const deleteRole = (id) => {
    return axiosInstance.delete(`/roles/${id}`);
};


// USERS

export const getAllUsersCms = (page = 1) => {
    return axiosInstance.get(`/users/cms?page=${page}`);
};

// Get single user
export const getUserById = (id) => {
    return axiosInstance.get(`/users/${id}`);
};

// Create user
export const createUser = (data) => {
    return axiosInstance.post(`/users/store`, data);
};

// Update user
export const updateUser = (id, data) => {
    return axiosInstance.put(`/users/${id}`, data);
};

// Change status
export const changeUserStatus = (id) => {
    return axiosInstance.put(`/users/${id}/status`);
};

// Delete user
export const deleteUser = (id) => {
    return axiosInstance.delete(`/users/${id}`);
};

// CATEGORIES
export const getAllCategoriesCms = (page = 1) => {
    return axiosInstance.get(`/categories/cms?page=${page}`);
};

export const createCategory = (data) => {
    return axiosInstance.post("/categories", data);
};

export const updateCategory = (id, data) => {
    return axiosInstance.put(`/categories/${id}`, data);
};

export const changeCategoryStatus = (id) => {
    return axiosInstance.put(`/categories/${id}/status`);
};

export const deleteCategory = (id) => {
    return axiosInstance.delete(`/categories/${id}`);
};

export const getCategoryById = (id) => {
    return axiosInstance.get(`/categories/${id}`);
};


// PACKAGES
export const getAllPackagesCms = (page = 1) => {
    return axiosInstance.get(`/packages/cms?page=${page}`);
};

export const createPackage = (data) => {
    return axiosInstance.post("/packages", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updatePackage = (id, data) => {
    data.append("_method", "PUT");

    return axiosInstance.post(`/packages/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const changePackageStatus = (id) => {
    return axiosInstance.put(`/packages/${id}/status`);
};

export const deletePackage = (id) => {
    return axiosInstance.delete(`/packages/${id}`);
};

// PUBLIC PACKAGE SHOW
export const getPackageById = (id) => {
    return axiosInstance.get(`/packages/${id}`);
};


// VEHICLES
export const getAllVehiclesCms = (page = 1) => {
    return axiosInstance.get(`/vehicles/cms?page=${page}`);
};

export const createVehicle = (data) => {
    return axiosInstance.post("/vehicles", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updateVehicle = (id, data) => {
    data.append("_method", "PUT");

    return axiosInstance.post(`/vehicles/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const changeVehicleStatus = (id) => {
    return axiosInstance.put(`/vehicles/${id}/status`);
};

export const deleteVehicle = (id) => {
    return axiosInstance.delete(`/vehicles/${id}`);
};

// PUBLIC VEHICLE SHOW
export const getVehicleById = (id) => {
    return axiosInstance.get(`/vehicles/${id}`);
};


// HELIS
export const getAllHelisCms = (page = 1) => {
    return axiosInstance.get(`/helis/cms?page=${page}`);
};

export const createHeli = (data) => {
    return axiosInstance.post("/helis", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updateHeli = (id, data) => {
    data.append("_method", "PUT");

    return axiosInstance.post(`/helis/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const changeHeliStatus = (id) => {
    return axiosInstance.put(`/helis/${id}/status`);
};

export const deleteHeli = (id) => {
    return axiosInstance.delete(`/helis/${id}`);
};

// PUBLIC HELI SHOW
export const getHeliById = (id) => {
    return axiosInstance.get(`/helis/${id}`);
};


// INCLUSIONS
export const getAllInclusionsCms = (page = 1) => {
    return axiosInstance.get(`/inclusions/cms?page=${page}`);
};

export const createInclusion = (packageId, data) => {
    return axiosInstance.post(`/inclusions/packages/${packageId}`, data);
};

export const updateInclusion = (id, data) => {
    return axiosInstance.put(`/inclusions/${id}`, data);
};

export const deleteInclusion = (id) => {
    return axiosInstance.delete(`/inclusions/${id}`);
};

// PUBLIC PACKAGE INCLUSIONS
export const getPackageInclusions = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/inclusions`);
};


// EXCLUSION
export const getAllExclusionsCms = (page = 1) => {
    return axiosInstance.get(`/exclusions/cms?page=${page}`);
};

export const createExclusion = (packageId, data) => {
    return axiosInstance.post(`/exclusions/packages/${packageId}`, data);
};

export const updateExclusion = (id, data) => {
    return axiosInstance.put(`/exclusions/${id}`, data);
};

export const deleteExclusion = (id) => {
    return axiosInstance.delete(`/exclusions/${id}`);
};

// PUBLIC PACKAGE EXCLUSIONS
export const getPackageExclusions = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/exclusions`);
};


// RESTRICTIONS
export const getAllRestrictionsCms = (page = 1) => {
    return axiosInstance.get(`/restrictions/cms?page=${page}`);
};

export const createRestriction = (packageId, data) => {
    return axiosInstance.post(`/restrictions/packages/${packageId}`, data);
};

export const updateRestriction = (id, data) => {
    return axiosInstance.put(`/restrictions/${id}`, data);
};

export const deleteRestriction = (id) => {
    return axiosInstance.delete(`/restrictions/${id}`);
};

// PUBLIC PACKAGE RESTRICTIONS
export const getPackageRestrictions = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/restrictions`);
};


// WHAT TO BRING
export const getAllWhatToBringCms = (page = 1) => {
    return axiosInstance.get(`/what-to-bring/cms?page=${page}`);
};

export const createWhatToBring = (packageId, data) => {
    return axiosInstance.post(`/what-to-bring/packages/${packageId}`, data);
};

export const updateWhatToBring = (id, data) => {
    return axiosInstance.put(`/what-to-bring/${id}`, data);
};

export const deleteWhatToBring = (id) => {
    return axiosInstance.delete(`/what-to-bring/${id}`);
};

// PUBLIC PACKAGE WHAT TO BRING
export const getPackageWhatToBring = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/what-to-bring`);
};


// FAQ
export const getAllFaqsCms = (page = 1) => {
    return axiosInstance.get(`/faqs/cms?page=${page}`);
};

export const createFaq = (packageId, data) => {
    return axiosInstance.post(
        `/faqs/packages/${packageId}`,
        data
    );
};

export const updateFaq = (id, data) => {
    return axiosInstance.put(
        `/faqs/${id}`,
        data
    );
};

export const deleteFaq = (id) => {
    return axiosInstance.delete(`/faqs/${id}`);
};

// PUBLIC PACKAGE FAQS
export const getPackageFaqs = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/faqs`);
};


// PRICING TIERS
export const getAllPricingTiersCms = (page = 1) => {
    return axiosInstance.get(`/pricing-tiers/cms?page=${page}`);
};

export const createPricingTier = (packageId, data) => {
    return axiosInstance.post(
        `/pricing-tiers/packages/${packageId}`,
        data
    );
};

export const updatePricingTier = (id, data) => {
    return axiosInstance.put(
        `/pricing-tiers/${id}`,
        data
    );
};

export const deletePricingTier = (id) => {
    return axiosInstance.delete(`/pricing-tiers/${id}`);
};

// PUBLIC PACKAGE PRICING TIERS
export const getPackagePricingTiers = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/pricing-tiers`);
};


// ITINERAIES
export const getAllItinerariesCms = (page = 1) => {
    return axiosInstance.get(`/itineraries/cms?page=${page}`);
};

export const createItineraries = (packageId, data) => {
    return axiosInstance.post(
        `/itineraries/packages/${packageId}`,
        data
    );
};

export const updateItinerary = (id, data) => {
    return axiosInstance.put(`/itineraries/${id}`, data);
};

export const deleteItinerary = (id) => {
    return axiosInstance.delete(`/itineraries/${id}`);
};

// PUBLIC PACKAGE ITINERARIES
export const getPackageItineraries = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/itineraries`);
};


// ==============================
// PACKAGE HIGHLIGHTS
// ==============================

export const getAllHighlightsCms = (page = 1) => {
    return axiosInstance.get(`/highlights/cms?page=${page}`);
};

export const createHighlight = (packageId, data) => {
    return axiosInstance.post(`/highlights/packages/${packageId}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const updateHighlight = (id, data) => {
    data.append("_method", "PUT");

    return axiosInstance.post(`/highlights/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteHighlight = (id) => {
    return axiosInstance.delete(`/highlights/${id}`);
};

// PUBLIC PACKAGE HIGHLIGHTS
export const getPackageHighlights = (packageId) => {
    return axiosInstance.get(`/packages/${packageId}/highlights`);
};


// ==============================
// COUNTRIES
// ==============================

export const getCountriesCms = (page = 1) => {
    return axiosInstance.get(`/countries/cms?page=${page}`);
};


export const getAllCountries = () => {
    return axiosInstance.get("/countries/cms");
};

export const createCountry = (data) => {
    return axiosInstance.post("/countries/store", data);
};

export const updateCountry = (id, data) => {
    return axiosInstance.put(`/countries/${id}`, data);
};

export const deleteCountry = (id) => {
    return axiosInstance.delete(`/countries/${id}`);
};

export const changeCountryStatus = (id) => {
    return axiosInstance.put(`/countries/${id}/status`);
};


// PERMIT TIER
export const getAllPermitFeeTiersCms = (page = 1) => {
    return axiosInstance.get(
        `/permit-fee-tiers/cms?page=${page}`
    );
};

export const createPermitFeeTiers = (data) => {
    return axiosInstance.post(
        "/permit-fee-tiers/store",
        data
    );
};

export const updatePermitFeeTier = (id, data) => {
    return axiosInstance.put(
        `/permit-fee-tiers/${id}`,
        data
    );
};

export const changePermitFeeTierStatus = (id) => {
    return axiosInstance.put(
        `/permit-fee-tiers/${id}/status`
    );
};

export const deletePermitFeeTier = (id) => {
    return axiosInstance.delete(
        `/permit-fee-tiers/${id}`
    );
};


// ================= WORK PERMITS =================

// Get all work permit applications for CMS
export const getAllWorkPermitsCms = (page = 1) => {
    return axiosInstance.get(`/work-permits/cms?page=${page}`);
};

// Get single work permit
export const getWorkPermitById = (id) => {
    return axiosInstance.get(`/work-permits/${id}`);
};

// Change work permit status
export const changeWorkPermitStatus = (id, data) => {
    return axiosInstance.put(`/work-permits/${id}/status`, data);
};


// ================= DOCUMENTS =================

// Get documents of a work permit
export const getWorkPermitDocuments = (workPermitId) => {
    return axiosInstance.get(
        `/work-permits/${workPermitId}/documents`
    );
};

// Verify document

export const verifyWorkPermitDocument = (documentId, isVerified) => {
    return axiosInstance.put(
        `/work-permits/documents/${documentId}/verify`,
        {
            is_verified: isVerified,
        }
    );
};


// ================= PAYMENTS =================

export const createWorkPermitPayment = (
    workPermitId,
    formData
) => {
    return axiosInstance.post(
        `/work-permits/${workPermitId}/payments/store`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const changeWorkPermitPaymentStatus = (
    workPermitId,
    paymentId,
    status
) => {
    return axiosInstance.put(
        `/work-permits/${workPermitId}/payments/${paymentId}/status`,
        {
            status: status,
        }
    );
};

// Get payments of a work permit
export const getWorkPermitPayments = (workPermitId) => {
    return axiosInstance.get(
        `/work-permits/${workPermitId}/payments`
    );
};

// Verify payment
export const verifyWorkPermitPayment = (id, data) => {
    return axiosInstance.put(
        `/work-permits/payments/${id}/verify`,
        data
    );
};


// ================= STATUS HISTORY =================

// Get status history
export const getWorkPermitStatusHistory = (workPermitId) => {
    return axiosInstance.get(
        `/work-permits/${workPermitId}/status-history`
    );
};

// PUBLIC COUNTRY SHOW
export const getCountryById = (id) => {
    return axiosInstance.get(`/countries/${id}`);
};

// PUBLIC COUNTRY PERMIT FEE TIERS
export const getCountryPermitFeeTiers = (countryId) => {
    return axiosInstance.get(`/countries/${countryId}/permit-fee-tiers`);
};

// WORKPERMIT DOCUMENT
export const getAllPermitDocumentRequirementsCms = (page = 1) => {
    return axiosInstance.get(
        `/permit-document-requirements/cms?page=${page}`
    );
};


// Create multiple requirements
export const createPermitDocumentRequirements = (data) => {
    return axiosInstance.post(
        `/permit-document-requirements/store`,
        data
    );
};


export const updatePermitDocumentRequirement = (id, data) => {
    return axiosInstance.put(
        `/permit-document-requirements/${id}`,
        data
    );
};


export const changePermitDocumentRequirementStatus = (id) => {
    return axiosInstance.patch(
        `/permit-document-requirements/${id}/status`
    );
};


export const deletePermitDocumentRequirement = (id) => {
    return axiosInstance.delete(
        `/permit-document-requirements/${id}`
    );
};

// WORKPERMIT INFORMATION
export const getAllWorkPermitInformationCms = (page = 1) => {
    return axiosInstance.get(
        `/work-permit-information/cms?page=${page}`
    );
};

export const createWorkPermitInformation = (data) => {
    return axiosInstance.post(
        `/work-permit-information/store`,
        data
    );
};

export const updateWorkPermitInformation = (id, data) => {
    return axiosInstance.put(
        `/work-permit-information/${id}`,
        data
    );
};

export const changeWorkPermitInformationStatus = (id) => {
    return axiosInstance.patch(
        `/work-permit-information/${id}/status`
    );
};

export const deleteWorkPermitInformation = (id) => {
    return axiosInstance.delete(
        `/work-permit-information/${id}`
    );
};

// VISA SERVICES
// ================= VISA APPLICATIONS =================


// Get all visa applications for CMS
export const getAllVisaApplicationsCms = (page = 1) => {
    return axiosInstance.get(
        `/visa-applications/cms?page=${page}`
    );
};


// Get single visa application
export const getVisaApplicationById = (id) => {
    return axiosInstance.get(
        `/visa-applications/show/${id}`
    );
};


// Change visa application status
export const changeVisaApplicationStatus = (id, data) => {
    return axiosInstance.patch(
        `/visa-applications/${id}/status`,
        data
    );
};


// ================= VISA VOUCHER =================


// Upload voucher / receipt
// FormData is created in VisaApplicationIndex.jsx
export const uploadVisaApplicationVoucher = (
    applicationId,
    formData
) => {
    return axiosInstance.post(
        `/visa-applications/${applicationId}/voucher`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};


// ================= VISA DOCUMENTS =================


// Verify / unverify visa document
export const verifyVisaDocument = (
    documentId,
    data
) => {
    return axiosInstance.patch(
        `/visa-documents/${documentId}/verify`,
        data
    );
};

// VISA CATEGORY
// ============================================
// VISA CATEGORIES
// ============================================

export const getVisaApplicantsByApplicationId = (applicationId) => {
    return axiosInstance.get(`/visa-applications/${applicationId}/applicants`);
};

export const getAllVisaCategoriesCms = (page = 1) => {
    return axiosInstance.get(
        `/visa-categories/cms?page=${page}`
    );
};

export const getVisaCategoriesByCountry = (countryId) => {
    return axiosInstance.get(
        `/visa-categories/country/${countryId}`
    );
};

export const getVisaCategoryById = (id) => {
    return axiosInstance.get(
        `/visa-categories/show/${id}`
    );
};

export const createVisaCategories = (formData) => {
    return axiosInstance.post(
        "/visa-categories/store",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const updateVisaCategory = (id, formData) => {
    return axiosInstance.post(
        `/visa-categories/update/${id}`,
        formData,
        {
            params: {
                _method: "PUT",
            },
        }
    );
};

export const changeVisaCategoryStatus = (id, status) => {
    return axiosInstance.patch(
        `/visa-categories/${id}/status`,
        {
            status,
        }
    );
};

export const deleteVisaCategory = (id) => {
    return axiosInstance.delete(
        `/visa-categories/delete/${id}`
    );
};

// ============================================
// VISA PRICING TIERS
// ============================================

export const getAllVisaPricingTiersCms = (page = 1) => {
    return axiosInstance.get(
        `/visa-pricing-tiers/cms?page=${page}`
    );
};

export const getVisaPricingTierById = (id) => {
    return axiosInstance.get(
        `/visa-pricing-tiers/show/${id}`
    );
};

export const createVisaPricingTiers = (data) => {
    return axiosInstance.post(
        "/visa-pricing-tiers/store",
        data
    );
};

export const updateVisaPricingTier = (id, data) => {
    return axiosInstance.put(
        `/visa-pricing-tiers/update/${id}`,
        data
    );
};

export const changeVisaPricingTierStatus = (
    id,
    status
) => {
    return axiosInstance.patch(
        `/visa-pricing-tiers/${id}/status`,
        {
            status,
        }
    );
};

export const deleteVisaPricingTier = (id) => {
    return axiosInstance.delete(
        `/visa-pricing-tiers/delete/${id}`
    );
};


// ================================
// VISA DOCUMENT REQUIREMENTS
// ================================

// CMS - paginated document requirements
export const getVisaDocumentRequirementsCms = (page = 1) => {
    return axiosInstance.get(
        `/visa-document-requirements/cms?page=${page}`
    );
};

// Get single document requirement
export const getVisaDocumentRequirementById = (id) => {
    return axiosInstance.get(
        `/visa-document-requirements/show/${id}`
    );
};

// Create multiple document requirements
export const createVisaDocumentRequirements = (data) => {
    return axiosInstance.post(
        `/visa-document-requirements/store`,
        data
    );
};

// Update document requirement
export const updateVisaDocumentRequirement = (id, data) => {
    return axiosInstance.put(
        `/visa-document-requirements/update/${id}`,
        data
    );
};

// Change ACTIVE / INACTIVE
export const changeVisaDocumentRequirementStatus = (
    id,
    status
) => {
    return axiosInstance.patch(
        `/visa-document-requirements/${id}/status`,
        { status }
    );
};

// Delete
export const deleteVisaDocumentRequirement = (id) => {
    return axiosInstance.delete(
        `/visa-document-requirements/delete/${id}`
    );
};


// ==========================================
// VISA INFORMATION
// ==========================================

// CMS - paginated visa information
export const getVisaInformationCms = (page = 1) => {
    return axiosInstance.get(
        `/visa-information/cms?page=${page}`
    );
};

// Get single visa information
export const getVisaInformationById = (id) => {
    return axiosInstance.get(
        `/visa-information/show/${id}`
    );
};

// Create multiple visa information items
export const createVisaInformation = (data) => {
    return axiosInstance.post(
        `/visa-information/store`,
        data
    );
};

// Update visa information
export const updateVisaInformation = (id, data) => {
    return axiosInstance.put(
        `/visa-information/update/${id}`,
        data
    );
};

// Change status
export const changeVisaInformationStatus = (
    id,
    status
) => {
    return axiosInstance.patch(
        `/visa-information/${id}/status`,
        { status }
    );
};

// Delete
export const deleteVisaInformation = (id) => {
    return axiosInstance.delete(
        `/visa-information/delete/${id}`
    );
};


// ============================================
// PUBLIC ACTIVE VISA CATEGORIES
// ============================================

export const getVisaCategories = () => {
    return axiosInstance.get(
        "/visa-categories"
    );
};


// ============================================
// COUNTRIES PUBLIC
// ============================================

export const getCountries = () => {
    return axiosInstance.get("/countries");
};



/* =========================================================
   INSURANCE APPLICATION CMS
========================================================= */

export const getAllInsuranceApplicationsCms = (page = 1) => {
    return axiosInstance.get(
        `/insurance-applications/cms?page=${page}`
    );
};

export const getInsuranceApplicationById = (id) => {
    return axiosInstance.get(
        `/insurance-applications/show/${id}`
    );
};

export const getInsuranceApplicantsByApplicationId = (id) => {
    return axiosInstance.get(
        `/insurance-applications/${id}/applicants`
    );
};

export const uploadInsuranceApplicationVoucher = (
    id,
    formData
) => {
    return axiosInstance.post(
        `/insurance-applications/${id}/voucher`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const changeInsuranceApplicationStatus = (
    id,
    data
) => {
    return axiosInstance.patch(
        `/insurance-applications/${id}/status`,
        data
    );
};


/* =========================================================
   INSURANCE DOCUMENT
========================================================= */

export const verifyInsuranceDocument = (
    id,
    data
) => {
    return axiosInstance.patch(
        `/insurance-documents/${id}/verify`,
        data
    );
};

// =========================================================
// INSURANCE PLAN CMS
// =========================================================

// GET ALL INSURANCE PLANS - CMS
export const getAllInsurancePlansCms = (page = 1) => {
    return axiosInstance.get(
        `/insurance-plans/cms?page=${page}`
    );
};


// CREATE INSURANCE PLAN
export const createInsurancePlan = (formData) => {
    return axiosInstance.post(
        "/insurance-plans/store",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};


// UPDATE INSURANCE PLAN
export const updateInsurancePlan = (id, formData) => {
    formData.append("_method", "PUT");

    return axiosInstance.post(
        `/insurance-plans/update/${id}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};


// CHANGE INSURANCE PLAN STATUS
export const changeInsurancePlanStatus = (id) => {
    return axiosInstance.patch(
        `/insurance-plans/${id}/status`
    );
};

// DELETE INSURANCE PLAN
export const deleteInsurancePlan = (id) => {
    return axiosInstance.delete(
        `/insurance-plans/delete/${id}`
    );
};

// =========================================================
// INSURANCE DOCUMENT REQUIREMENTS CMS
// =========================================================

export const getInsuranceDocumentRequirementsCms = (
    page = 1
) => {
    return axiosInstance.get(
        `/insurance-document-requirements/cms?page=${page}`
    );
};

export const getInsuranceDocumentRequirementById = (
    id
) => {
    return axiosInstance.get(
        `/insurance-document-requirements/show/${id}`
    );
};

export const createInsuranceDocumentRequirements = (
    data
) => {
    return axiosInstance.post(
        "/insurance-document-requirements/store",
        data
    );
};

export const updateInsuranceDocumentRequirement = (
    id,
    data
) => {
    return axiosInstance.put(
        `/insurance-document-requirements/update/${id}`,
        data
    );
};

export const changeInsuranceDocumentRequirementStatus = (
    id
) => {
    return axiosInstance.patch(
        `/insurance-document-requirements/${id}/status`
    );
};

export const deleteInsuranceDocumentRequirement = (
    id
) => {
    return axiosInstance.delete(
        `/insurance-document-requirements/delete/${id}`
    );
};


// =========================================================
// INSURANCE PLAN DROPDOWN
// =========================================================

export const getInsurancePlans = () => {
    return axiosInstance.get(
        "/insurance-plans"
    );
};

// =========================================================
// INSURANCE INFORMATION CMS
// =========================================================

export const getInsuranceInformationCms = (
    page = 1
) => {
    return axiosInstance.get(
        `/insurance-information/cms?page=${page}`
    );
};


export const getInsuranceInformationById = (
    id
) => {
    return axiosInstance.get(
        `/insurance-information/show/${id}`
    );
};


export const createInsuranceInformation = (
    data
) => {
    return axiosInstance.post(
        "/insurance-information/store",
        data
    );
};


export const updateInsuranceInformation = (
    id,
    data
) => {
    return axiosInstance.put(
        `/insurance-information/update/${id}`,
        data
    );
};


/*
 * STATUS:
 * backend only receives ID
 */
export const changeInsuranceInformationStatus = (
    id
) => {
    return axiosInstance.patch(
        `/insurance-information/${id}/status`
    );
};


export const deleteInsuranceInformation = (
    id
) => {
    return axiosInstance.delete(
        `/insurance-information/delete/${id}`
    );
};

// =========================================================
// INSURANCE DYNAMIC FIELDS CMS
// =========================================================

export const getInsuranceDynamicFieldsCms = (
    page = 1
) => {
    return axiosInstance.get(
        `/insurance-dynamic-fields/cms?page=${page}`
    );
};


export const getInsuranceDynamicFieldById = (
    id
) => {
    return axiosInstance.get(
        `/insurance-dynamic-fields/show/${id}`
    );
};


export const createInsuranceDynamicFields = (
    data
) => {
    return axiosInstance.post(
        "/insurance-dynamic-fields/store",
        data
    );
};


export const updateInsuranceDynamicField = (
    id,
    data
) => {
    return axiosInstance.put(
        `/insurance-dynamic-fields/update/${id}`,
        data
    );
};


/*
 * STATUS — ID ONLY
 */
export const changeInsuranceDynamicFieldStatus = (
    id
) => {
    return axiosInstance.patch(
        `/insurance-dynamic-fields/${id}/status`
    );
};


export const deleteInsuranceDynamicField = (
    id
) => {
    return axiosInstance.delete(
        `/insurance-dynamic-fields/delete/${id}`
    );
};

// =========================================================
// INSURANCE PRICING TIERS CMS
// =========================================================


// GET ALL CMS PRICING TIERS
export const getAllInsurancePricingTiersCms = (
    page = 1
) => {
    return axiosInstance.get(
        `/insurance-pricing-tiers/cms?page=${page}`
    );
};


// CREATE PRICING TIERS
export const createInsurancePricingTiers = (
    data
) => {
    return axiosInstance.post(
        "/insurance-pricing-tiers/store",
        data
    );
};


// UPDATE PRICING TIER
export const updateInsurancePricingTier = (
    id,
    data
) => {
    return axiosInstance.put(
        `/insurance-pricing-tiers/update/${id}`,
        data
    );
};


// CHANGE STATUS
// ID ONLY — NO DATA
export const changeInsurancePricingTierStatus = (
    id
) => {
    return axiosInstance.patch(
        `/insurance-pricing-tiers/${id}/status`
    );
};


// DELETE PRICING TIER
export const deleteInsurancePricingTier = (
    id
) => {
    return axiosInstance.delete(
        `/insurance-pricing-tiers/delete/${id}`
    );
};
