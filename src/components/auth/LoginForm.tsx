"use client";

/**
 * LoginForm Component
 *
 * Handles user login with:
 * - Email and password form fields
 * - Client-side validation (email format, password required)
 * - Loading state during submission
 * - Error display for validation and API errors
 * - User-friendly error messages for incorrect credentials
 * - Redirect to home page on success
 *
 * @see US2: User Login
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate form fields
   * @returns true if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API to login
      const result = await login(email, password);

      if (result.error) {
        // Handle API errors with user-friendly messages
        let errorMessage = result.error;

        // Check for common error types and provide friendly messages
        if (
          result.error.toLowerCase().includes("invalid") ||
          result.error.toLowerCase().includes("credentials")
        ) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        }

        setErrors({ general: errorMessage });
        return;
      }

      // Success - redirect to home page
      router.push("/");
      router.refresh();
    } catch (error) {
      // Handle unexpected errors
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(251,146,60,0.1)] p-10 border border-orange-100"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Welcome <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">back</span>
        </h1>
        <p className="text-gray-500 font-medium text-sm">Sign in to continue to your flow</p>
      </div>

      {/* General error message */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 font-bold">{errors.general}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Email address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={`w-full px-6 py-4 bg-orange-50/30 border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all ${
                errors.email ? "border-red-200 focus:border-red-400 focus:ring-red-50" : "border-transparent"
              }`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{errors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className={`w-full px-6 py-4 bg-orange-50/30 border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all ${
                errors.password ? "border-red-200 focus:border-red-400 focus:ring-red-50" : "border-transparent"
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-200/50 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
        >
          {isLoading ? "Synchronizing..." : "Sign In"}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-orange-100 text-center">
        <p className="text-gray-500 text-sm font-medium">
          New to Flowdos?{" "}
          <Link href="/register" className="text-orange-600 font-black hover:text-orange-700 transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
