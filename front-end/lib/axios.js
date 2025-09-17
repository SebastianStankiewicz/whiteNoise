// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000", 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Optional: intercept requests or responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
