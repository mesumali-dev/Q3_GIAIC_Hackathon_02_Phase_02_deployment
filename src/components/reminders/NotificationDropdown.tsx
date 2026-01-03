"use client";

/**
 * NotificationDropdown Component
 *
 * Dropdown menu for viewing and managing reminders:
 * - Lists all due reminders with task details
 * - Click reminder to view details in modal
 * - Delete button for each reminder
 * - Updates count after deletion
 *
 * @see US2: View and Manage Notifications
 * @see FR-007: Clicking notification icon shows dropdown
 */

import { ReminderRead } from "@/types/reminder";
import { reminderClient } from "@/lib/api/reminder_client";
import { getUser } from "@/lib/auth-helper";

interface NotificationDropdownProps {
  reminders: ReminderRead[];
  isOpen: boolean;
  onClose: () => void;
  onReminderClick: (reminder: ReminderRead) => void;
  onDelete: (reminderId: number) => void;
}

export default function NotificationDropdown({
  reminders,
  isOpen,
  onClose,
  onReminderClick,
  onDelete,
}: NotificationDropdownProps) {
  if (!isOpen) {
    return null;
  }

  const handleDelete = async (e: React.MouseEvent, reminderId: number) => {
    e.stopPropagation(); // Prevent triggering click on reminder

    const user = getUser();
    if (!user) return;

    try {
      await reminderClient.deleteReminder(user.id, reminderId.toString());
      onDelete(reminderId);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      // Show user-friendly error message
      alert("Failed to delete reminder. Please try again.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900">Reminders</h3>
            <p className="text-[10px] text-gray-500 font-medium">
              {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"} due
            </p>
          </div>
        </div>

        {/* Reminders List */}
        <div className="max-h-96 overflow-y-auto">
          {reminders.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-3"
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
              <p className="text-sm text-gray-500 font-medium">No reminders yet</p>
              <p className="text-xs text-gray-400 mt-1">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  onClick={() => onReminderClick(reminder)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {(reminder as any).task_title || "Untitled Task"}
                      </h4>
                      {(reminder as any).task_description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {(reminder as any).task_description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <svg
                          className="w-3 h-3 mr-1"
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
                            className="w-3 h-3 mr-1"
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
                          Repeats {reminder.triggered_count}/{reminder.repeat_count}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, reminder.id!)}
                      className="ml-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete reminder"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
