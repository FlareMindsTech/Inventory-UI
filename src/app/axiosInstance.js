// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default axiosInstance;
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Cache-bust GET requests with a timestamp param, forcing a fresh network hit every time
  if (config.method === "get") {
    config.params = { ...config.params, _t: Date.now() };
  }

  return config;
});

export default axiosInstance;