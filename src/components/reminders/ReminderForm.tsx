"use client";

/**
 * ReminderForm Component
 *
 * Form for creating task reminders with:
 * - Date/time picker for remind_at
 * - Optional repeat interval (minutes)
 * - Optional repeat count
 * - Client-side validation
 * - Loading state during submission
 * - Error display
 *
 * @see US1: Create Basic Task Reminder
 * @see FR-001: Users can create one-time reminders
 */

import { useState, FormEvent } from "react";
import { reminderClient } from "@/lib/api/reminder_client";
import { getUser } from "@/lib/auth-helper";

interface FormErrors {
  remind_at?: string;
  repeat_interval_minutes?: string;
  repeat_count?: string;
  general?: string;
}

interface ReminderFormProps {
  taskId?: string; // Optional for edit mode
  reminder?: any; // For edit mode - can be ReminderRead or ReminderWithTask
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReminderForm({
  taskId,
  reminder,
  onSuccess,
  onCancel,
}: ReminderFormProps) {
  // Form state - initialize with reminder data if in edit mode
  const [remindAt, setRemindAt] = useState(reminder ? reminder.remind_at.split('.')[0].slice(0, 16) : "");
  const [repeatIntervalMinutes, setRepeatIntervalMinutes] = useState(reminder ? (reminder.repeat_interval_minutes || "").toString() : "");
  const [repeatCount, setRepeatCount] = useState(reminder ? (reminder.repeat_count || "").toString() : "");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate form fields
   * @returns true if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // remind_at validation (required, must be future date)
    if (!remindAt) {
      newErrors.remind_at = "Reminder date/time is required";
    } else {
      const reminderDate = new Date(remindAt);
      const now = new Date();
      if (reminderDate <= now) {
        newErrors.remind_at = "Reminder must be in the future";
      }
    }

    // Repeat interval validation (optional, must be positive)
    if (repeatIntervalMinutes && parseInt(repeatIntervalMinutes) <= 0) {
      newErrors.repeat_interval_minutes = "Repeat interval must be positive";
    }
    if (repeatIntervalMinutes && parseInt(repeatIntervalMinutes) > 1440) {
      newErrors.repeat_interval_minutes = "Repeat interval cannot exceed 24 hours (1440 minutes)";
    }

    // Repeat count validation (optional, must be positive)
    if (repeatCount && parseInt(repeatCount) <= 0) {
      newErrors.repeat_count = "Repeat count must be positive";
    }
    if (repeatCount && parseInt(repeatCount) > 100) {
      newErrors.repeat_count = "Repeat count cannot exceed 100";
    }

    // Both repeat fields must be provided together
    if ((repeatIntervalMinutes && !repeatCount) || (!repeatIntervalMinutes && repeatCount)) {
      newErrors.general = "Both repeat interval and repeat count must be provided together";
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
      setErrors({ general: "You must be logged in to create reminders" });
      return;
    }

    setIsLoading(true);

    try {
      if (reminder) {
        // Update existing reminder
        await reminderClient.updateReminder(reminder.id.toString(), user.id, {
          user_id: user.id,
          task_id: taskId || reminder.task_id,
          remind_at: new Date(remindAt).toISOString(),
          repeat_interval_minutes: repeatIntervalMinutes ? parseInt(repeatIntervalMinutes) : undefined,
          repeat_count: repeatCount ? parseInt(repeatCount) : undefined,
        });
      } else {
        // Create new reminder
        if (!taskId) {
          setErrors({ general: "Task ID is required for creating a new reminder" });
          return;
        }

        await reminderClient.createReminder({
          user_id: user.id,
          task_id: taskId,
          remind_at: new Date(remindAt).toISOString(),
          repeat_interval_minutes: repeatIntervalMinutes ? parseInt(repeatIntervalMinutes) : undefined,
          repeat_count: repeatCount ? parseInt(repeatCount) : undefined,
        });
      }

      // Success - call callback
      if (onSuccess) {
        onSuccess();
      }

      // Reset form if creating new reminder
      if (!reminder) {
        setRemindAt("");
        setRepeatIntervalMinutes("");
        setRepeatCount("");
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Failed to save reminder",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Remind At Field */}
      <div>
        <label htmlFor="remind_at" className="block text-sm font-medium text-gray-700 mb-1">
          Remind me at *
        </label>
        <input
          type="datetime-local"
          id="remind_at"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.remind_at ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.remind_at && (
          <p className="mt-1 text-sm text-red-600">{errors.remind_at}</p>
        )}
      </div>

      {/* Repeat Interval Field */}
      <div>
        <label htmlFor="repeat_interval" className="block text-sm font-medium text-gray-700 mb-1">
          Repeat every (minutes)
        </label>
        <input
          type="number"
          id="repeat_interval"
          value={repeatIntervalMinutes}
          onChange={(e) => setRepeatIntervalMinutes(e.target.value)}
          placeholder="e.g., 15, 30, 60"
          min="1"
          max="1440"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.repeat_interval_minutes ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.repeat_interval_minutes && (
          <p className="mt-1 text-sm text-red-600">{errors.repeat_interval_minutes}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Optional: Leave empty for one-time reminder</p>
      </div>

      {/* Repeat Count Field */}
      <div>
        <label htmlFor="repeat_count" className="block text-sm font-medium text-gray-700 mb-1">
          Number of times to repeat
        </label>
        <input
          type="number"
          id="repeat_count"
          value={repeatCount}
          onChange={(e) => setRepeatCount(e.target.value)}
          placeholder="e.g., 3, 5, 10"
          min="1"
          max="100"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.repeat_count ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.repeat_count && (
          <p className="mt-1 text-sm text-red-600">{errors.repeat_count}</p>
        )}
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? (reminder ? "Updating..." : "Creating...") : (reminder ? "Update Reminder" : "Create Reminder")}
        </button>
      </div>
    </form>
  );
}
