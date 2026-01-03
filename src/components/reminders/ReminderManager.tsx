"use client";

/**
 * ReminderManager Component
 *
 * Comprehensive reminder management interface with:
 * - List of all user's reminders
 * - Ability to edit existing reminders
 * - Delete reminders
 * - Mark as read/unread functionality
 * - Status indicators
 *
 * @see US3: Manage Task Reminders
 */

import { useState, useEffect } from "react";
import { reminderClient } from "@/lib/api/reminder_client";
import { ReminderRead } from "@/types/reminder";
import { getUser } from "@/lib/auth-helper";
import ReminderForm from "./ReminderForm";

interface ReminderManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderManager({ isOpen, onClose }: ReminderManagerProps) {
  const [reminders, setReminders] = useState<any[]>([]); // Using any to accommodate both ReminderRead and ReminderWithTask
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState<any | null>(null); // Using any to accommodate both ReminderRead and ReminderWithTask
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (isOpen && user) {
      fetchReminders();
    }
  }, [isOpen]);

  const fetchReminders = async () => {
    const user = getUser();
    if (!user) return;

    try {
      setLoading(true);
      // Note: We'll need to create an endpoint to fetch all user's reminders, not just due ones
      // For now, we'll use the due reminders endpoint which will return all active ones
      const allReminders = await reminderClient.getAllUserReminders(user.id);
      setReminders(allReminders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reminders");
      console.error("Failed to fetch reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reminderId: number) => {
    const user = getUser();
    if (!user) return;

    try {
      await reminderClient.deleteReminder(user.id, reminderId.toString());
      setReminders(reminders.filter(r => r.id !== reminderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete reminder");
      console.error("Failed to delete reminder:", err);
    }
  };

  const handleEdit = (reminder: ReminderRead) => {
    setEditingReminder(reminder);
    setShowEditForm(true);
  };

  const handleFormSuccess = () => {
    setShowEditForm(false);
    setEditingReminder(null);
    fetchReminders(); // Refresh the list
  };

  if (!isOpen) return null;

  if (showEditForm && editingReminder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setShowEditForm(false)}
        />
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto z-50">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Reminder</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ReminderForm
              taskId={editingReminder.task_id}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden z-50">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Reminders</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reminders</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any reminders set yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border ${
                    new Date(reminder.remind_at) < new Date()
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {reminder.task_title || "Untitled Task"}
                      </h4>
                      {reminder.task_description && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {reminder.task_description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center text-xs text-gray-500">
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
                      <div className="mt-2 flex items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${
                          reminder.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {reminder.is_active ? 'Active' : 'Completed'}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit reminder"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.id!)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete reminder"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}