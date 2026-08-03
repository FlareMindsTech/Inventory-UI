import axiosInstance from "../../app/axiosInstance";

export const loginUser = async ({ userName, password }) => {
  const res = await axiosInstance.post("/api/auth/login", {
    username: userName,
    password: password,
  });
  return res.data;
};

export const getProfile = async () => {
  const res = await axiosInstance.get("/api/users/profile"); 
  return res.data;
};

export const logoutUser = async () => {
  const res = await axiosInstance.post("/api/auth/logout");
  return res.data;
};

export const refreshToken = async (refreshTokenValue) => {
  const res = await axiosInstance.post("/api/auth/refresh-token", {
    refreshToken: refreshTokenValue,
  });
  return res.data;
};