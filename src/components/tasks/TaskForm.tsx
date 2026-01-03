"use client";

/**
 * TaskForm Component
 *
 * Form for creating and editing tasks with:
 * - Title field (required, max 200 chars)
 * - Description field (optional, max 1000 chars)
 * - Client-side validation
 * - Loading state during submission
 * - Error display
 *
 * @see US1: Create a Task
 * @see FR-013: Title validation
 * @see FR-014: Description validation
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTask, updateTask, Task } from "@/lib/api";
import { getUser } from "@/lib/auth-helper";
import { reminderClient } from "@/lib/api/reminder_client";

interface FormErrors {
  title?: string;
  description?: string;
  remind_at?: string;
  repeat_interval?: string;
  repeat_count?: string;
  general?: string;
}

interface TaskFormProps {
  mode?: "create" | "edit";
  task?: Task;
  onSuccess?: (task: Task) => void;
  isModal?: boolean;
  onCancel?: () => void;
}

export default function TaskForm({
  mode = "create",
  task,
  onSuccess,
  isModal = false,
  onCancel,
}: TaskFormProps) {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");

  // Reminder state
  const [showReminder, setShowReminder] = useState(false);
  const [remindAt, setRemindAt] = useState("");
  const [repeatInterval, setRepeatInterval] = useState("");
  const [repeatCount, setRepeatCount] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Character counters
  const titleCharsLeft = 200 - title.length;
  const descriptionCharsLeft = 1000 - description.length;

  /**
   * Validate form fields
   * @returns true if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation (required, 1-200 chars)
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 200) {
      newErrors.title = "Title must be 200 characters or less";
    }

    // Description validation (optional, max 1000 chars)
    if (description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }

    // Reminder validation (only if enabled)
    if (showReminder) {
      if (!remindAt) {
        newErrors.remind_at = "Reminder date/time is required";
      } else {
        const reminderDate = new Date(remindAt);
        if (reminderDate <= new Date()) {
          newErrors.remind_at = "Reminder must be in the future";
        }
      }

      // Repeat validation
      if (repeatInterval && parseInt(repeatInterval) <= 0) {
        newErrors.repeat_interval = "Interval must be positive";
      }
      if (repeatInterval && parseInt(repeatInterval) > 1440) {
        newErrors.repeat_interval = "Max 24 hours (1440 min)";
      }
      if (repeatCount && parseInt(repeatCount) <= 0) {
        newErrors.repeat_count = "Count must be positive";
      }
      if (repeatCount && parseInt(repeatCount) > 100) {
        newErrors.repeat_count = "Max 100 repeats";
      }
      if ((repeatInterval && !repeatCount) || (!repeatInterval && repeatCount)) {
        newErrors.general = "Both repeat interval and count must be provided together";
      }
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

    // Get current user
    const user = getUser();
    if (!user) {
      setErrors({ general: "You must be logged in to create tasks" });
      return;
    }

    setIsLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
      };

      let result;
      if (mode === "edit" && task) {
        result = await updateTask(user.id, task.id, taskData);
      } else {
        result = await createTask(user.id, taskData);
      }

      if (result.error) {
        setErrors({ general: result.error });
        return;
      }

      // Create reminder if enabled (only for new tasks)
      if (mode === "create" && showReminder && remindAt && result.data) {
        try {
          await reminderClient.createReminder({
            user_id: user.id,
            task_id: result.data.id,
            remind_at: new Date(remindAt).toISOString(),
            repeat_interval_minutes: repeatInterval ? parseInt(repeatInterval) : undefined,
            repeat_count: repeatCount ? parseInt(repeatCount) : undefined,
          });
        } catch (reminderError) {
          console.error("Failed to create reminder:", reminderError);
          // Task was created successfully, just log reminder error
        }
      }

      // Success callback or redirect
      if (onSuccess && result.data) {
        onSuccess(result.data);
      } else {
        router.push("/tasks");
        router.refresh();
      }
    } catch (error) {
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
    <div className={`relative ${isModal ? "" : "min-h-screen py-10"}`}>
      {!isModal && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-rose-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-32 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl" />
        </div>
      )}

      <div className={`w-full ${isModal ? "" : "max-w-2xl mx-auto"} relative`}>
        {/* Back Button - Desktop only */}
        {!isModal && (
          <Link
            href="/tasks"
            className="hidden lg:inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-8 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        )}

        {/* Card */}
        <div className={`${isModal ? "" : "bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-gray-200/50 p-5 sm:p-8 lg:p-10 border border-white/50"}`}>
          {/* Header - Show even in edit mode if not modal */}
          <div className="mb-4">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center mb-3">
              {mode === "edit" ? (
                <svg className="w-6 h-6 sm:w-6 sm:h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 sm:w-6 sm:h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-gray-900 mb-1">
              {mode === "edit" ? "Edit Task" : "Create New Task"}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === "edit"
                ? "Update your task details below"
                : "Add a new task to your list"}
            </p>
          </div>

          {/* General error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm text-rose-600 font-medium">{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Title field */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                maxLength={200}
                className={`w-full px-4 sm:px-5 py-3 bg-gray-50/50 border-2 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all text-base ${
                  errors.title
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-gray-100"
                }`}
                placeholder="What needs to be done?"
                autoComplete="off"
                autoFocus
              />
              <div className="mt-2 flex justify-between items-center">
                {errors.title ? (
                  <p className="text-sm text-rose-500 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.title}
                  </p>
                ) : (
                  <span />
                )}
                <p
                  className={`text-xs font-medium ${
                    titleCharsLeft < 20 ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {titleCharsLeft} left
                </p>
              </div>
            </div>

            {/* Description field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                maxLength={1000}
                rows={4}
                className={`w-full px-4 sm:px-5 py-3 bg-gray-50/50 border-2 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none text-base ${
                  errors.description
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-gray-100"
                }`}
                placeholder="Add more details about this task..."
              />
              <div className="mt-2 flex justify-between items-center">
                {errors.description ? (
                  <p className="text-sm text-rose-500 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <p
                  className={`text-xs font-medium ${
                    descriptionCharsLeft < 100 ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {descriptionCharsLeft} left
                </p>
              </div>
            </div>

            {/* Reminder Section - Only for create mode */}
            {mode === "create" && (
              <div className="border-t border-gray-100 pt-4 mt-2">
                {/* Reminder Toggle */}
                <button
                  type="button"
                  onClick={() => setShowReminder(!showReminder)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    showReminder
                      ? "bg-orange-50 border-2 border-orange-200"
                      : "bg-gray-50 border-2 border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      showReminder ? "bg-orange-100" : "bg-gray-100"
                    }`}>
                      <svg className={`w-5 h-5 ${showReminder ? "text-orange-600" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${showReminder ? "text-orange-700" : "text-gray-700"}`}>
                        Set Reminder
                      </p>
                      <p className="text-xs text-gray-500">Get notified about this task</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    showReminder ? "bg-orange-500" : "bg-gray-300"
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      showReminder ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </div>
                </button>

                {/* Reminder Fields */}
                {showReminder && (
                  <div className="mt-4 space-y-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    {/* Remind At */}
                    <div>
                      <label htmlFor="remind_at" className="block text-sm font-semibold text-gray-700 mb-2">
                        Remind me at <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="remind_at"
                        value={remindAt}
                        onChange={(e) => setRemindAt(e.target.value)}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all ${
                          errors.remind_at ? "border-rose-300" : "border-gray-100"
                        }`}
                      />
                      {errors.remind_at && (
                        <p className="mt-1 text-sm text-rose-500">{errors.remind_at}</p>
                      )}
                    </div>

                    {/* Repeat Options */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="repeat_interval" className="block text-sm font-semibold text-gray-700 mb-2">
                          Repeat every (min)
                        </label>
                        <input
                          type="number"
                          id="repeat_interval"
                          value={repeatInterval}
                          onChange={(e) => setRepeatInterval(e.target.value)}
                          placeholder="e.g., 30"
                          min="1"
                          max="1440"
                          disabled={isLoading}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all ${
                            errors.repeat_interval ? "border-rose-300" : "border-gray-100"
                          }`}
                        />
                        {errors.repeat_interval && (
                          <p className="mt-1 text-xs text-rose-500">{errors.repeat_interval}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="repeat_count" className="block text-sm font-semibold text-gray-700 mb-2">
                          Times to repeat
                        </label>
                        <input
                          type="number"
                          id="repeat_count"
                          value={repeatCount}
                          onChange={(e) => setRepeatCount(e.target.value)}
                          placeholder="e.g., 3"
                          min="1"
                          max="100"
                          disabled={isLoading}
                          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all ${
                            errors.repeat_count ? "border-rose-300" : "border-gray-100"
                          }`}
                        />
                        {errors.repeat_count && (
                          <p className="mt-1 text-xs text-rose-500">{errors.repeat_count}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Leave repeat fields empty for a one-time reminder
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
              {isModal ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-3 sm:py-4 px-6 sm:px-8 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all text-center"
                >
                  Cancel
                </button>
              ) : (
                <Link
                  href="/tasks"
                  className="py-3 sm:py-4 px-6 sm:px-8 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all text-center"
                >
                  Cancel
                </Link>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 sm:py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {mode === "edit" ? "Saving..." : "Creating..."}
                  </span>
                ) : mode === "edit" ? (
                  "Save Changes"
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
