import { useDispatch, useSelector } from "react-redux";
import { loginThunk, logoutThunk } from "../features/auth/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, status, error } = useSelector((state) => state.auth);

 
  const login = (credentials) => dispatch(loginThunk(credentials)).unwrap();
  const signOut = () => dispatch(logoutThunk());

  return {
    user,
    token,
    isAuthenticated: !!token,
    isLoading: status === "loading",
    error,
    login,
    signOut,
  };
};