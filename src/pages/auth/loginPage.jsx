import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../hook/useAuth";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/input";
import Button from "../../components/Button";
import loginBg from "../../assets/bg2.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ userName, password }); // throws if rejected, thanks to .unwrap()

      await Swal.fire({
        icon: "success",
        title: "Welcome back!",
        text: `Signed in as ${user?.name || userName}`,
        confirmButtonColor: "#993C1D",
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      console.log(user);

      navigate("/dashboard");
    } catch (err) {
      showToast(err || "Invalid username or password", "error");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F6F4] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBg})`, opacity: 0.3 }}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-10">
        <h1 className="text-2xl font-semibold text-brand-900 mb-2">
          Sign into your account
        </h1>
        <p className="text-sm text-brand-600 mb-8">
          New stock updates are waiting for you.
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your username"
            disabled={isLoading}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className="mt-4"
            required
          />

          <div className="text-right mt-2 mb-6">
            <button type="button" className="text-sm text-brand-700 hover:underline">
              Forgot Password?
            </button>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-brand-700">
          Don't have an account?{" "}
          <span className="font-semibold cursor-pointer hover:underline">Sign Up</span>
        </p>
      </div>
    </div>
  );
}