import { ReminderRead } from '@/types/reminder';

interface CreateReminderRequest {
  user_id: string;
  task_id: string;
  remind_at: string; // ISO date string
  repeat_interval_minutes?: number;
  repeat_count?: number; // Optional - null for one-time reminders
}

interface CreateReminderResponse {
  id: string;
  user_id: string;
  task_id: string;
  remind_at: string; // ISO date string
  repeat_interval_minutes?: number;
  repeat_count: number;
  triggered_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ReminderClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Only add Authorization header if token exists
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async createReminder(reminderData: CreateReminderRequest): Promise<CreateReminderResponse> {
    // Build request body - only include repeat fields if both are provided
    const body: any = {
      task_id: reminderData.task_id,
      remind_at: reminderData.remind_at,
    };

    // Only add repeat fields if both are provided and valid
    if (reminderData.repeat_interval_minutes && reminderData.repeat_count) {
      body.repeat_interval_minutes = reminderData.repeat_interval_minutes;
      body.repeat_count = reminderData.repeat_count;
    }

    return this.request(`/api/${reminderData.user_id}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async getDueReminders(userId: string): Promise<ReminderRead[]> {
    return this.request(`/api/${userId}/reminders/due`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async updateReminder(reminderId: string, userId: string, reminderData: CreateReminderRequest): Promise<CreateReminderResponse> {
    return this.request(`/api/${userId}/reminders/${reminderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: reminderData.task_id,
        remind_at: reminderData.remind_at,
        repeat_interval_minutes: reminderData.repeat_interval_minutes,
        repeat_count: reminderData.repeat_count,
      }),
    });
  }

  async getAllUserReminders(userId: string) {
    // This method returns ReminderWithTask[] which has the same base fields as ReminderRead
    // but with additional task_title and task_description fields
    const response = await this.request(`/api/${userId}/reminders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response; // Return as-is since backend returns ReminderWithTask compatible format
  }

  async deleteReminder(userId: string, reminderId: string): Promise<void> {
    const url = `${this.baseUrl}/api/${userId}/reminders/${reminderId}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    // DELETE returns 204 No Content - no JSON to parse
  }

  async getActiveReminders(userId: string) {
    return this.request(`/api/${userId}/reminders/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async markAsRead(userId: string, reminderId: string): Promise<ReminderRead> {
    return this.request(`/api/${userId}/reminders/${reminderId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Acknowledge a reminder - processes it and marks as read if complete
   * For one-time reminders: marks as read and deactivates
   * For repeating reminders: schedules next occurrence or completes if done
   */
  async acknowledgeReminder(userId: string, reminderId: string): Promise<ReminderRead> {
    return this.request(`/api/${userId}/reminders/${reminderId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export const reminderClient = new ReminderClient();

export type { CreateReminderRequest, CreateReminderResponse };