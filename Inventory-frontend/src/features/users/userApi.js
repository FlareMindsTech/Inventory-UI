import axiosInstance from "../../app/axiosInstance";

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/api/users");
  console.log(res);
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/api/users/${id}`);
  return res.data;
};

export const createUser = async (userData) => {
  const res = await axiosInstance.post("/api/users", userData); // fixed: was /api/auth/register
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

  const res = await axiosInstance.put("/api/users/change-password", requestBody);
  return res.data;
};