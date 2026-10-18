import axios from "axios";

const prodUrl = "https://trinit-bugbiters-dev.onrender.com";
const devUrl = "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? devUrl : prodUrl),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
