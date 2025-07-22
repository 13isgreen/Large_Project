import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import api from "../api/axios";

interface RegisterResponse {
  token?: string;
  id?: string;
  username?: string;
  error?: string;
}

// includes ! @ # $ % ^ & * ( )
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // compute all checks once per render
  const {
    isLengthValid,
    hasLowercase,
    hasUppercase,
    hasDigit,
    hasSpecial,
    isPasswordValid,
  } = useMemo(() => {
    return {
      isLengthValid: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()]/.test(password),
      isPasswordValid: passwordRegex.test(password),
    };
  }, [password]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError(
        "Password must be ≥8 chars, include uppercase, lowercase, number, and one of !@#$%^&*()."
      );
      return;
    }

    try {
      const { data } = await api.post<RegisterResponse>("/api/auth/register", {
        username,
        email,
        password,
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id!);
        localStorage.setItem("username", data.username!);
        navigate("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err: unknown) {
      console.error(err);
      let message: string | undefined;
      if (err && typeof err === "object" && "response" in err) {
        const e = err as { response?: { data?: { error?: string } } };
        message = e.response?.data?.error;
      }
      setError(message || "Unable to Register. Check your credentials.");
    }
  };

  const canSubmit = !!username && !!email && isPasswordValid;

  return (
    <div className="min-h-screen bg-[#2a2a2a] text-white flex items-center justify-center p-4 font-mono">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#3a3a3a] rounded-lg shadow-lg p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">
          Register
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Username */}
          <div className="flex items-center gap-3 bg-white/20 rounded-lg px-3 py-2">
            <User className="text-gray-300" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="flex-1 bg-transparent placeholder-gray-300 text-white focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 bg-white/20 rounded-lg px-3 py-2">
            <Mail className="text-gray-300" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-transparent placeholder-gray-300 text-white focus:outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="bg-white/20 rounded-lg px-3 py-2 flex items-center gap-3">
            <Lock className="text-gray-300" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 bg-transparent placeholder-gray-300 text-white focus:outline-none"
            />
          </div>

          {/* Live Feedback */}
          <div className="bg-white/10 rounded-lg p-3 mt-2">
            <ul className="text-sm space-y-1 pl-1">
              <li className={isLengthValid ? "text-green-300" : "text-red-600"}>
                {isLengthValid ? "✓" : "✗"} At least 8 characters
              </li>
              <li className={hasLowercase ? "text-green-300" : "text-red-600"}>
                {hasLowercase ? "✓" : "✗"} One lowercase letter
              </li>
              <li className={hasUppercase ? "text-green-300" : "text-red-600"}>
                {hasUppercase ? "✓" : "✗"} One uppercase letter
              </li>
              <li className={hasDigit ? "text-green-300" : "text-red-600"}>
                {hasDigit ? "✓" : "✗"} One number
              </li>
              <li className={hasSpecial ? "text-green-300" : "text-red-600"}>
                {hasSpecial ? "✓" : "✗"} One special char {"!@#$%^&*()"}
              </li>
            </ul>
          </div>

          {error && (
            <p className="text-red-400 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-2 rounded-full text-white font-semibold transition ${
              canSubmit
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Register
          </button>
        </form>

        <p className="text-gray-300 text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-200 hover:text-white transition"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
