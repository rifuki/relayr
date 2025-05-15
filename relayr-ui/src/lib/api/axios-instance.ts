import axios from "axios";
import { HTTP_API_URL } from "../constants";

const apiClient = axios.create({
  baseURL: HTTP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

//apiClient.interceptors.request.use(
//  (config) => {
//    const token = localStorage.getItem("token");
//    if (token) {
//      config.headers.Authorization = `Bearer ${token}`;
//    }
//    return config;
//  },
//
//  (error) => {
//    return Promise.reject(error);
//  },
//);

//apiClient.interceptors.response.use(
//  (response) => {
//    return response;
//  },
//  (error) => {
//    if (error.response?.status === 401) {
//    }
//    return Promise.reject(error);
//  },
//);

export default apiClient;
