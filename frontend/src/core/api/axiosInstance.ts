import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,  // Replace with your API base URL
    headers: {
        "Content-Type": "application/json",
    },
});

// 
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // No response — network/server unreachable
        if (!error.response) {
            toast.error("Network error. Please check your connection.");
        }

        // Server errors (5xx)
        else if (error.response.status >= 500) {
            toast.error("Server issue. Please try again later.");
        }

        // Unauthorized (401)
        else if (error.response.status === 401) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/auth/login"; // optional redirect
        }

        // Forbidden (403)
        else if (error.response.status === 403) {
            toast.error("You do not have permission to perform this action.");
        }

        //  Bad Request or Validation Error (400)
        else if (error.response.status === 400) {
            const msg = error.response.data?.message || "Invalid request.";
            toast.error(msg);
        }

        // Not Found (404)
        else if (error.response.status === 404) {
            toast.error("Requested resource not found.");
        }

        // You can log errors for dev/debugging
        console.error("API Error:", error.response?.data || error.message);

        return Promise.reject(error);
    }
);

export default axiosInstance;
