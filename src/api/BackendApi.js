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
    return axiosInstance.get(`/bookingspage=${page}`);
};


export const deleteBooking = (id) => {
  return axiosInstance.delete(`/bookings/${id}`);
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

// PUBLIC COUNTRY SHOW
export const getCountryById = (id) => {
    return axiosInstance.get(`/countries/${id}`);
};

// PUBLIC COUNTRY PERMIT FEE TIERS
export const getCountryPermitFeeTiers = (countryId) => {
    return axiosInstance.get(`/countries/${countryId}/permit-fee-tiers`);
};