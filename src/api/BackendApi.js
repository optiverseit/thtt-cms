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