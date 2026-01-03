/**
 * Time utility functions for handling timezone conversions
 */

/**
 * Converts a UTC datetime string to Pakistan local time by manually adding 5 hours and formats it in 12-hour format
 * @param utcDateTime - UTC datetime string (ISO format)
 * @returns Formatted time string in Pakistan local time (manually calculated as UTC + 5 hours)
 */
export function formatTimeForPakistan(utcDateTime: string): string {
  const date = new Date(utcDateTime);

  // Manually add 5 hours for Pakistan time (UTC+5)
  const pakistanTime = new Date(date.getTime() + (5 * 60 * 60 * 1000));

  return pakistanTime.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Converts a UTC datetime string to Pakistan local time for display in short format
 * @param utcDateTime - UTC datetime string (ISO format)
 * @returns Formatted time string in Pakistan local time (e.g., "1:32 PM")
 */
export function formatTimeOnlyForPakistan(utcDateTime: string): string {
  const date = new Date(utcDateTime);

  // Manually add 5 hours for Pakistan time (UTC+5)
  const pakistanTime = new Date(date.getTime() + (5 * 60 * 60 * 1000));

  return pakistanTime.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}