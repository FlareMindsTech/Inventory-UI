import axiosInstance from "../../app/axiosInstance";

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/api/users");

  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/api/users/${id}`);
  return res.data;
};

export const createUser = async (userData) => {
  const res = await axiosInstance.post("/api/users", userData); 
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await axiosInstance.put(`/api/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosInstance.delete(`/api/users/${id}`);
  return res.data;
};



export const changePassword = async ({ username, password }) => {
  const res = await axiosInstance.put("/api/users/change-password", { username, password });
  return res.data;
};