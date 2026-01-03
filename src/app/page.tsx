"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, verifyAuth } from "@/lib/api";
import { getStoredUser, isAuthenticated, StoredUser } from "@/lib/auth-helper";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Product Designer",
    company: "Spotify",
    avatar: "SM",
    color: "from-pink-400 to-rose-500",
    text: "Flowdos completely changed how I manage daily projects. Simple, fast, and exactly what I needed to stay focused.",
    rating: 5
  },
  {
    name: "James Rodriguez",
    role: "Software Engineer",
    company: "Google",
    avatar: "JR",
    color: "from-blue-400 to-indigo-500",
    text: "I've tried every app out there. This is the only one that stuck. simple yet powerful.",
    rating: 5
  },
  {
    name: "David Park",
    role: "Content Creator",
    company: "YouTube",
    avatar: "DP",
    color: "from-violet-400 to-purple-500",
    text: "As a creator, my mind is always racing. Flowdos is the bucket that catches all my ideas before they disappear.",
    rating: 5
  },
  {
    name: "Lisa Wong",
    role: "Project Manager",
    company: "Microsoft",
    avatar: "LW",
    color: "from-cyan-400 to-blue-500",
    text: "The interface is so clean it actually makes me want to organize my tasks. A rare achievement for a todo app.",
    rating: 5
  },
  {
    name: "Alex Rivera",
    role: "Freelance Developer",
    company: "Upwork",
    avatar: "AR",
    color: "from-lime-400 to-green-500",
    text: "I love how it doesn't force complex workflows on you. It's as simple as paper but with the power of digital sync.",
    rating: 5
  },
  {
    name: "Sophie Bennett",
    role: "Graduate Student",
    company: "Stanford",
    avatar: "SB",
    color: "from-fuchsia-400 to-pink-500",
    text: "Finally, a way to balance my research, classes, and personal life without losing my mind. Thank you, Flowdos!",
    rating: 5
  }
];

const TestimonialGrid = () => {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="break-inside-avoid"
          >
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-orange-100 shadow-[0_10px_30px_rgba(251,146,60,0.05)] hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-500 group relative overflow-hidden">
              {/* Decorative gradient corner */}
              <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-500`} />

              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-gray-700 leading-relaxed mb-6 font-medium">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-orange-50/50">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-tight">
                    {t.role} <span className="opacity-30 mx-0.5">|</span> {t.company}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = getStoredUser();
      if (!storedUser || !isAuthenticated()) {
        setUser(null);
        setIsPending(false);
        return;
      }

      const result = await verifyAuth();
      if (result.data?.authenticated) {
        setUser(storedUser);
      } else {
        logout();
        setUser(null);
      }
      setIsPending(false);
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      logout();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/60 backdrop-blur-xl border-b border-orange-100/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">Flowdos</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">Features</a>
            <a href="#workflow" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">Workflow</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            ) : user ? (
              <>
                <Link href="/tasks" className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-200/50 hover:shadow-xl transition-shadow">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} disabled={isSigningOut} className="text-sm text-gray-500 hover:text-gray-700">
                  {isSigningOut ? "..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">Login</Link>
                <Link href="/register" className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-200/50 hover:shadow-xl transition-shadow">
                  Try Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Unique Layout */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Centered Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-orange-100">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-gray-600">Version 2.0 — Now with smart suggestions</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-6">
              Your thoughts,
              <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                perfectly captured.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Stop forgetting important tasks. Flowdos turns your scattered ideas into organized action items that actually get done.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/register"
              className="px-8 py-4 text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-xl shadow-orange-200/50 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              Start Capturing Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#workflow" className="px-8 py-4 text-gray-600 font-semibold hover:text-gray-800 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </a>
          </div>

          {/* App Preview - Different Layout */}
          <div className="relative max-w-5xl mx-auto">
            {/* Main Window */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-orange-200/30 border border-orange-100/50 overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-gradient-to-r from-gray-50 to-orange-50/50 px-6 py-4 border-b border-orange-100/50 flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 bg-white rounded-lg text-xs text-gray-400 border border-gray-100">
                    app.flowdos.io
                  </div>
                </div>
              </div>

              {/* App Content */}
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Good morning, Sarah</p>
                    <h2 className="text-2xl font-bold text-gray-800">You have 4 tasks today</h2>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">75%</span>
                    </div>
                    <span className="text-sm font-medium text-orange-700">On track</span>
                  </div>
                </div>

                {/* Task Groups */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Morning Tasks */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Morning</h3>
                    {[
                      { text: "Review pull requests", done: true, time: "9:00 AM" },
                      { text: "Team standup meeting", done: true, time: "10:00 AM" },
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl opacity-60">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="flex-1 text-sm text-gray-500 line-through">{task.text}</span>
                        <span className="text-xs text-gray-400">{task.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Afternoon Tasks */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Afternoon</h3>
                    {[
                      { text: "Finalize design mockups", done: false, time: "2:00 PM", priority: true },
                      { text: "Send project update email", done: false, time: "4:00 PM" },
                    ].map((task, i) => (
                      <div key={i} className={`flex items-center gap-3 p-4 rounded-xl ${task.priority ? 'bg-orange-50 border-2 border-orange-200' : 'bg-white border border-gray-100'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 ${task.priority ? 'border-orange-400' : 'border-gray-300'}`} />
                        <span className="flex-1 text-sm text-gray-700 font-medium">{task.text}</span>
                        <span className="text-xs text-gray-400">{task.time}</span>
                        {task.priority && <span className="px-2 py-0.5 bg-orange-200 text-orange-700 text-xs font-medium rounded">Priority</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card - Left */}
            <div className="absolute -left-8 top-1/3 bg-white rounded-2xl shadow-xl p-4 border border-orange-100 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="text-lg font-bold text-gray-800">23 tasks</p>
                </div>
              </div>
            </div>

            {/* Floating Card - Right */}
            <div className="absolute -right-8 bottom-1/4 bg-white rounded-2xl shadow-xl p-4 border border-orange-100 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Productivity</p>
                  <p className="text-lg font-bold text-green-600">+34%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 rounded-full text-orange-600 font-semibold text-sm mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
              Everything you need,<br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">nothing you don&apos;t</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              We removed the clutter so you can focus on what matters most.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* Large Card - Quick Capture */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-8 md:p-10 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Lightning Fast Capture</h3>
                <p className="text-white/80 text-lg max-w-md leading-relaxed">
                  Add tasks in seconds with keyboard shortcuts. Your thoughts never escape — capture them before they vanish.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <kbd className="px-2 py-1 bg-white/30 rounded text-sm font-mono">⌘</kbd>
                    <span className="text-sm">+</span>
                    <kbd className="px-2 py-1 bg-white/30 rounded text-sm font-mono">K</kbd>
                  </div>
                  <span className="text-white/70 text-sm">Quick add shortcut</span>
                </div>
              </div>
            </div>

            {/* Small Card - Clean Lists */}
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-8 hover:shadow-2xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all duration-300">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Clean Lists</h3>
                <p className="text-gray-500 leading-relaxed">No folders, no tags overload. Just simple lists that make sense.</p>
              </div>
            </div>

            {/* Small Card - Daily Focus */}
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-8 hover:shadow-2xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all duration-300">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Daily Focus</h3>
                <p className="text-gray-500 leading-relaxed">See only today&apos;s tasks. Tomorrow can wait until tomorrow.</p>
              </div>
            </div>

            {/* Medium Card - Smart Reminders */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-10 text-white">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">Smart Reminders</h3>
                  <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                    We&apos;ll nudge you at the perfect time. No spam, no annoying pings — just gentle reminders when you need them.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Reminder</p>
                        <p className="text-gray-500 text-xs">2 min ago</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">Time to review your design mockups!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Card - Weekly Review */}
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-8 hover:shadow-2xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all duration-300">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Weekly Review</h3>
                <p className="text-gray-500 leading-relaxed">See your wins every week. Celebrate progress and adjust.</p>
              </div>
            </div>

            {/* Small Card - Private & Secure */}
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-8 hover:shadow-2xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all duration-300">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Private & Secure</h3>
                <p className="text-gray-500 leading-relaxed">Your tasks are yours. Encrypted, private, never sold.</p>
              </div>
            </div>

            {/* Small Card - Cross Platform */}
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-8 hover:shadow-2xl hover:shadow-orange-100/50 hover:border-orange-200 transition-all duration-300">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Works Everywhere</h3>
                <p className="text-gray-500 leading-relaxed">Web, mobile, desktop. Your tasks sync instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">Your Daily Flow</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-3 mb-4">
              Three steps to clarity
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A simple routine that transforms how you work.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Brain Dump", desc: "Every morning, write down everything on your mind. Don't filter, just capture.", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
              { num: "02", title: "Pick Three", desc: "Choose your top 3 tasks for today. The rest can wait. Focus is your superpower.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { num: "03", title: "Do & Done", desc: "Work through your list. Check them off. Feel the satisfaction of progress.", icon: "M5 13l4 4L19 7" },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange-200 to-transparent" />
                )}
                <div className="text-center">
                  <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-200/50">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-orange-400 mb-2 block">{step.num}</span>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/30 to-amber-50/50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-200/40 to-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-yellow-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-orange-100/20 to-transparent rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-100 shadow-lg shadow-orange-100/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse" />
              <span className="text-sm font-bold text-gray-700">Simple Pricing</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight"
            >
              Start free,{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  grow unlimited
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#f97316"/>
                      <stop offset="0.5" stopColor="#f59e0b"/>
                      <stop offset="1" stopColor="#eab308"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto"
            >
              No hidden fees. No credit card required. Just pure productivity.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200/50 to-gray-100/50 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/20 h-full flex flex-col overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full opacity-50" />

                {/* Plan badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full w-fit mb-6">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Starter</span>
                </div>

                <h3 className="text-3xl font-black text-gray-900 mb-2">Free Forever</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">Perfect for individuals getting started with mindful productivity.</p>

                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-6xl font-black text-gray-900">$0</span>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-medium text-sm">/month</span>
                    <span className="text-gray-300 text-xs">forever free</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    { text: "Unlimited basic tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                    { text: "Pick Three methodology", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                    { text: "Web dashboard access", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                    { text: "Daily focus reminders", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200/80 transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-center hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-300/30 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Get Started Free
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-[2.8rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

              <div className="relative bg-white rounded-[2.5rem] p-10 border-2 border-orange-200 shadow-2xl shadow-orange-200/30 h-full flex flex-col overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-amber-400/10 rounded-full" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-yellow-400/5 rounded-full" />

                {/* Popular badge */}
                <div className="absolute -top-px -right-px">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 blur-sm" />
                    <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-bl-2xl rounded-tr-[2.3rem] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Most Popular
                    </div>
                  </div>
                </div>

                {/* Plan badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full w-fit mb-6">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Premium</span>
                </div>

                <h3 className="text-3xl font-black text-gray-900 mb-2">Unlock Everything</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">Advanced AI-powered features for maximum productivity.</p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">$0</span>
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-medium text-sm line-through opacity-50">$9/mo</span>
                    <span className="text-orange-500 text-xs font-bold">BETA ACCESS</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full w-fit mb-8">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-700">Limited time offer</span>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    { text: "Everything in Starter", icon: "M5 13l4 4L19 7", highlight: false },
                    { text: "Smart AI task suggestions", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", highlight: true },
                    { text: "Weekly productivity insights", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", highlight: true },
                    { text: "Custom themes & colors", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", highlight: false },
                    { text: "Priority support 24/7", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", highlight: false },
                    { text: "Unlimited cross-device sync", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", highlight: false },
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${item.highlight ? 'bg-gradient-to-br from-orange-400 to-amber-400 shadow-lg shadow-orange-200/50' : 'bg-gradient-to-br from-orange-100 to-amber-100 group-hover:from-orange-200 group-hover:to-amber-200'}`}>
                        <svg className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-orange-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <span className={`font-medium ${item.highlight ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                        {item.text}
                        {item.highlight && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase">AI</span>}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[length:200%_100%] text-white rounded-2xl font-bold text-center shadow-xl shadow-orange-300/40 hover:shadow-2xl hover:shadow-orange-300/50 hover:bg-right transition-all duration-500 flex items-center justify-center gap-2 group/btn"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Unlock Premium — Free
                  <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Bottom trust section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 sm:gap-10 px-8 py-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-orange-100 shadow-lg shadow-orange-100/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Secure & Private</p>
                  <p className="text-xs text-gray-500">Your data is encrypted</p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-orange-100" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">No Credit Card</p>
                  <p className="text-xs text-gray-500">Start instantly</p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-orange-100" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">10,000+ Users</p>
                  <p className="text-xs text-gray-500">Join the community</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-white via-orange-50/20 to-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4"
            >
              Loved by <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">thousands</span>
            </motion.h2>
            <p className="text-gray-500 text-lg">Real stories from real producers</p>
          </div>

          <TestimonialGrid />
        </div>

        {/* Trust Badges - Mini */}
        <div className="max-w-4xl mx-auto px-6 mt-16 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-34 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {["Google", "Microsoft", "Spotify", "Airbnb", "Stripe", "Notion"].map((company, i) => (
              <span key={i} className="text-2xl font-black font-bold text-gray-700 tracking-tighter hover:text-orange-500 cursor-default transition-colors">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Stop planning. Start doing.
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of people who finally have their tasks under control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-10 py-5 text-orange-600 font-bold text-lg bg-white rounded-2xl shadow-xl shadow-orange-600/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Create Your Free Account
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <div className="flex -space-x-4 mb-4 sm:mb-0">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-orange-500 bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-orange-500 bg-white flex items-center justify-center text-[10px] font-bold text-orange-600">
                +10k
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-6">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          {/* Footer Top */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Flowdos</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The simple task manager that helps you focus on what matters most.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Features</a></li>
                <li><a href="#workflow" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Workflow</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Changelog</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2025 Flowdos. All rights reserved.</p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
