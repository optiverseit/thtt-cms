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

//CATEGORIES
export const getAllCategoriesCms = () => {
    return axiosInstance.get("/categories/cms");
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
export const getAllPackagesCms = () => {
    return axiosInstance.get("/packages/cms");
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
export const getAllVehiclesCms = () => {
    return axiosInstance.get("/vehicles/cms");
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
export const getAllHelisCms = () => {
    return axiosInstance.get("/helis/cms");
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