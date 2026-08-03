import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsersThunk,
  addUserThunk,
  updateUserThunk,
  deleteUserThunk,
  resetPasswordThunk,
} from "../features/users/userSlice";

export const useUsers = () => {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.users);

  const fetchUsers = () => dispatch(fetchUsersThunk());
  const addUser = (userData) => dispatch(addUserThunk(userData)).unwrap();
  const updateUser = (id, userData) => dispatch(updateUserThunk({ id, userData })).unwrap();
  const deleteUser = (id) => dispatch(deleteUserThunk(id)).unwrap();
  const resetPassword = ({ username, password }) =>
  dispatch(resetPasswordThunk({ username, password })).unwrap();

  return {
    staff: list,
    isLoading: status === "loading",
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
  };
};