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