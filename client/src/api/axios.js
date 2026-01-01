import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on auth failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Helper function for multipart/form-data requests (file uploads)
 * @param {string} url - API endpoint
 * @param {FormData} formData - FormData object containing files and data
 * @param {string} method - HTTP method ('post' or 'put')
 * @returns {Promise} - Axios response promise
 */
export const uploadFile = async (url, formData, method = "post") => {
  const token = localStorage.getItem("token");
  return axios({
    method,
    url: `${API_BASE_URL}${url}`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export default api;
