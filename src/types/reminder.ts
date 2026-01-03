/**
 * Reminder Types
 *
 * Type definitions for task reminders
 *
 * @see US1: Create Basic Task Reminder
 */

export interface ReminderRead {
  id: number;
  task_id: string;
  remind_at: string;
  repeat_interval_minutes?: number;
  repeat_count: number;
  triggered_count: number;
  is_active: boolean;
  task_title?: string;
  task_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ReminderCreate {
  task_id: string;
  remind_at: string;
  repeat_interval_minutes?: number;
  repeat_count?: number;
}
