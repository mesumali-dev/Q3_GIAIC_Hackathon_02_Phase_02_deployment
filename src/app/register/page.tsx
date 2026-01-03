/**
 * Registration Page
 *
 * Allows new users to create an account.
 * Uses RegisterForm component for form handling.
 *
 * @see US1: User Registration
 */

import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export const metadata = {
  title: "Create Account | Flowdos",
  description: "Create a new account to start managing your tasks",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl text-orange-200" />
        <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-amber-200/30 rounded-full blur-3xl text-amber-200" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-yellow-200/40 rounded-full blur-3xl text-yellow-200" />
      </div>

      {/* Logo */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2.5 group z-50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200/50 group-hover:scale-105 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-800">Flowdos</span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <RegisterForm />
      </div>
    </main>
  );
}
