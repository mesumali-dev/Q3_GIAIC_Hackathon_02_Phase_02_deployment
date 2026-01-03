"use client";

/**
 * Tasks List Page
 *
 * Displays all tasks for the authenticated user.
 * Requires authentication - redirects to login if not authenticated.
 *
 * @see US2: View Task List
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getStoredUser, StoredUser } from "@/lib/auth-helper";
import { verifyAuth, logout, Task, getTasks } from "@/lib/api";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import { motion, AnimatePresence } from "framer-motion";
import { reminderClient } from "@/lib/api/reminder_client";
import NotificationModal from "@/components/reminders/NotificationModal";
import NotificationBadge from "@/components/reminders/NotificationBadge";
import NotificationDropdown from "@/components/reminders/NotificationDropdown";
import ReminderManager from "@/components/reminders/ReminderManager";
import { ReminderRead } from "@/types/reminder";


export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [taskStats, setTaskStats] = useState({ completed: 0, pending: 0, total: 0 });
  const [dueReminders, setDueReminders] = useState<ReminderRead[]>([]);
  const [allReminders, setAllReminders] = useState<ReminderRead[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showReminderManager, setShowReminderManager] = useState(false);
  const [reminderDropdownOpen, setReminderDropdownOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderRead | null>(null);


  // Check authentication on mount and fetch reminders
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login?redirect=/tasks");
        return;
      }

      const result = await verifyAuth();
      if (!result.data?.authenticated) {
        logout();
        router.push("/login?redirect=/tasks");
        return;
      }

      setUser(getStoredUser());
      setIsLoading(false);

      // Fetch reminders after user is authenticated
      if (getStoredUser()) {
        fetchDueReminders();
      }
    };

    checkAuth();
  }, [router]);

  // Function to fetch due reminders
  const fetchDueReminders = async () => {
    if (!user) return;
    try {
      const reminders = await reminderClient.getDueReminders(user.id);
      setDueReminders(reminders);

      // Show modal if there are any due reminders
      if (reminders.length > 0) {
        setShowReminderModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch due reminders:", error);
    }
  };

  // Function to fetch all reminders for badge count
  const fetchAllReminders = async () => {
    if (!user) return;
    try {
      const reminders = await reminderClient.getAllUserReminders(user.id);
      // Filter to get only active reminders for the badge count
      const activeReminders = reminders.filter((r: any) => r.is_active);
      setAllReminders(activeReminders);
    } catch (error) {
      console.error("Failed to fetch all reminders:", error);
    }
  };

  // Fetch task stats for counts
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const result = await getTasks(user.id);
      if (result.data) {
        const tasks = result.data.tasks;
        const completed = tasks.filter(t => t.is_completed).length;
        setTaskStats({
          completed,
          pending: tasks.length - completed,
          total: tasks.length
        });
      }
    };
    fetchStats();
  }, [user, refreshTrigger]);


  // Periodically fetch all reminders to keep badge count updated and due reminders to show modal automatically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchAllReminders();
      fetchDueReminders(); // Also check for due reminders to show modal automatically
    }, 30000); // Fetch every 30 seconds

    // Initial fetch after component mounts
    fetchAllReminders();
    fetchDueReminders(); // Also fetch due reminders to show modal if any are due

    return () => clearInterval(interval);
  }, [user]);

  // Close sidebar on route change or escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setReminderDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);


  const handleReminderClick = (reminder: ReminderRead) => {
    setSelectedReminder(reminder);
    setShowReminderModal(true);
    setReminderDropdownOpen(false);
  };

  const handleReminderDelete = (reminderId: number) => {
    setDueReminders(dueReminders.filter(r => r.id !== reminderId));
  };

  const navItems = [
    { label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Entering Flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] lg:flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 lg:w-64 bg-white border-r border-orange-100/50 z-50 flex flex-col transform transition-transform duration-300 ease-out lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo & Close Button */}
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-100">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">Flowdos</span>
          </Link>

          {/* Close button - Mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => {
              setIsNewTaskModalOpen(true);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-200/50 hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest px-4 mb-3 mt-1">Menu</p>
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveNav(item.label);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeNav === item.label
                  ? "bg-linear-to-r from-orange-50 to-amber-50 text-orange-600 shadow-sm border border-orange-100"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
              {item.label === "Tasks" && (
                <span className="ml-auto px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full">
                  {taskStats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-orange-50">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-orange-200/50">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-orange-100/50">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Left: Hamburger & Search */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu - Mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-orange-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Search Bar */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-transparent focus-within:border-orange-200 focus-within:bg-white transition-all w-64 lg:w-80">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <kbd className="hidden lg:inline-flex px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-bold rounded">⌘K</kbd>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search */}
              <button className="sm:hidden p-2 rounded-xl hover:bg-orange-50 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Reminder Notifications */}
              <div className="relative">
                <NotificationBadge
                  count={allReminders.length}
                  onClick={() => {
                    setReminderDropdownOpen(!reminderDropdownOpen);
                  }}
                />
                <NotificationDropdown
                  reminders={dueReminders}
                  isOpen={reminderDropdownOpen}
                  onClose={() => setReminderDropdownOpen(false)}
                  onReminderClick={handleReminderClick}
                  onDelete={handleReminderDelete}
                />
              </div>

              {/* All Reminders Button */}
              <button
                onClick={() => setShowReminderManager(true)}
                className="relative p-2 rounded-xl hover:bg-orange-50 transition-colors"
                title="View all reminders"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* User Avatar - Mobile */}
              <div className="lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-200/50"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
              </div>

              {/* New Task Button - Desktop */}
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Dynamic Content Switching */}
            {activeNav === "Dashboard" && (
              <>
                {/* Welcome Header */}
                <header className="mb-8 sm:mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                  >
                    <div>
                      <p className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-2">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                        Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
                        <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                          {user?.name?.split(" ")[0]}
                        </span>
                      </h1>
                    </div>

                    {/* Stats Cards - Desktop */}
                    <div className="hidden lg:flex items-center gap-3">
                      <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                        <p className="text-2xl font-black text-green-600">{taskStats.completed}</p>
                      </div>
                      <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-black text-orange-500">{taskStats.pending}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Stats Cards - Mobile */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:hidden grid grid-cols-2 gap-3 mt-4"
                  >
                    <div className="px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                      <p className="text-xl font-black text-green-600">{taskStats.completed}</p>
                    </div>
                    <div className="px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending</p>
                      <p className="text-xl font-black text-orange-500">{taskStats.pending}</p>
                    </div>
                  </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  <div className="p-6 bg-white rounded-3xl border border-orange-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-black text-gray-900 mb-1">Finish Project</h3>
                    <p className="text-sm text-gray-500 mb-4">Complete the final touches on the Flowdos dashboard.</p>
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-wider">High Priority</span>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-blue-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-black text-gray-900 mb-1">Team Sync</h3>
                    <p className="text-sm text-gray-500 mb-4">Weekly catchup with the design and dev team at 2 PM.</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-wider">Internal</span>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-green-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-black text-gray-900 mb-1">Buy Coffee</h3>
                    <p className="text-sm text-gray-500 mb-4">Remember to grab some specialized beans for the office.</p>
                    <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase tracking-wider">Personal</span>
                  </div>
                </div>

                {/* Task list preview */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-gray-900">Recent Tasks</h2>
                  <button onClick={() => setActiveNav("Tasks")} className="text-sm font-bold text-orange-500 hover:text-orange-600">View All</button>
                </div>
                <motion.div
                  key={`tasks-${refreshTrigger}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TaskList onEdit={(task) => setEditingTask(task)} />
                </motion.div>
              </>
            )}

            {activeNav === "Tasks" && (
              <motion.div
                key={`tasks-all-${refreshTrigger}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-gray-900">All Tasks</h2>
                  <div className="flex gap-2">
                    <span className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600">Active</span>
                    <span className="px-4 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-400">Archived</span>
                  </div>
                </div>
                <TaskList onEdit={(task) => setEditingTask(task)} />
              </motion.div>
            )}

            {activeNav === "Calendar" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-gray-100 p-10 text-center shadow-sm"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Calendar View</h2>
                <p className="text-gray-500 max-w-sm mx-auto">Coming soon! You'll be able to schedule and view your tasks in a beautiful interactive calendar.</p>
              </motion.div>
            )}

            {activeNav === "Analytics" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-900 mb-8">Insights & Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Completion Rate</h3>
                    <div className="relative h-48 flex items-center justify-center">
                      <div
                        className="w-32 h-32 rounded-full border-12 border-orange-100"
                        style={{
                          borderTopColor: "rgb(249 115 22)",
                          transform: `rotate(${Math.min((taskStats.completed / (taskStats.total || 1)) * 360, 360)}deg)`
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-gray-900">
                          {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Growth</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">
                      {taskStats.completed} of {taskStats.total} tasks done
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Task Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500">Completed</span>
                        <span className="text-sm font-black text-green-600">{taskStats.completed}</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(taskStats.completed / (taskStats.total || 1)) * 100}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500">Pending</span>
                        <span className="text-sm font-black text-orange-500">{taskStats.pending}</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${(taskStats.pending / (taskStats.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeNav === "Settings" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl bg-white rounded-3xl border border-gray-100 p-8 shadow-sm"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-8">Account Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl transition-colors hover:bg-orange-50/50">
                    <div>
                      <p className="font-bold text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive daily reminders for your tasks</p>
                    </div>
                    <div className="w-12 h-6 bg-orange-500 rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl transition-colors hover:bg-orange-50/50">
                    <div>
                      <p className="font-bold text-gray-900">Dark Mode</p>
                      <p className="text-xs text-gray-500">Adjust the app appearance</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Mobile FAB - New Task */}
        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-linear-to-br from-orange-500 to-amber-500 text-white rounded-2xl shadow-2xl shadow-orange-300/50 flex items-center justify-center z-30 hover:scale-105 active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTaskModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              <div className="p-6 sm:p-8 overflow-x-auto">
                <TaskForm
                  isModal={true}
                  onSuccess={() => {
                    setIsNewTaskModalOpen(false);
                    setRefreshTrigger(prev => prev + 1);
                  }}
                  onCancel={() => setIsNewTaskModalOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              <div className="p-6 sm:p-8 overflow-x-auto">
                <TaskForm
                  mode="edit"
                  task={editingTask}
                  isModal={true}
                  onSuccess={() => {
                    setEditingTask(null);
                    setRefreshTrigger(prev => prev + 1);
                  }}
                  onCancel={() => setEditingTask(null)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reminder Notification Modal */}
      <NotificationModal
        reminders={selectedReminder ? [selectedReminder] : dueReminders}
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setSelectedReminder(null);
        }}
      />

      {/* Reminder Manager Modal */}
      <ReminderManager
        isOpen={showReminderManager}
        onClose={() => setShowReminderManager(false)}
      />
    </div>
  );
}
