"use client";

/**
 * NotificationModal Component
 *
 * Modal dialog for displaying due reminder notifications with:
 * - Task title and description
 * - Reminder timestamp
 * - Option to dismiss/acknowledge
 * - Auto-close functionality
 *
 * @see US1: Create Basic Task Reminder
 * @see FR-005: Notification popup appears when reminder time arrives
 */

import { ReminderRead } from "@/types/reminder";

interface NotificationModalProps {
  reminders: ReminderRead[];
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  reminders,
  isOpen,
  onClose,
}: NotificationModalProps) {
  if (!isOpen || reminders.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-white">
          <h2 className="text-lg font-semibold flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {reminders.length === 1
              ? "Reminder Due"
              : `${reminders.length} Reminders Due`}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {reminders.map((reminder, index) => (
              <div
                key={reminder.id || index}
                className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {(reminder as any).task_title || "Untitled Task"}
                </h3>
                {(reminder as any).task_description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {(reminder as any).task_description}
                  </p>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {new Date(reminder.remind_at).toLocaleString()}
                </div>
                {reminder.repeat_interval_minutes && reminder.repeat_count && (
                  <div className="mt-1 flex items-center text-xs text-blue-600">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Repeats every {reminder.repeat_interval_minutes} min (
                    {reminder.triggered_count}/{reminder.repeat_count})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
