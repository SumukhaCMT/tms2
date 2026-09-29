
import axios, { type InternalAxiosRequestConfig } from "axios";
import { secureStorage } from "@/utils/secureStorage";

// ✅ get from env
export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const API_URL = import.meta.env.VITE_API_URL;

// ✅ image paths
export const IMAGE_URLS = {
  temple: `${BASE_URL}/public/temple/`,
  deities: `${BASE_URL}/public/deities/`,
};

// ✅ axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ attach token automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = secureStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;
