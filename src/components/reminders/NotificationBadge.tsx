"use client";

/**
 * NotificationBadge Component
 *
 * Badge icon showing notification count for due reminders:
 * - Bell icon with count badge
 * - Only shows if count > 0
 * - Positioned in navbar
 * - Click to view notifications
 *
 * @see US1: Create Basic Task Reminder
 * @see FR-009: Navbar notification count badge shows correct number
 */

interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
}

export default function NotificationBadge({ count, onClick }: NotificationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200 rounded-xl transition-colors"
      aria-label={count > 0 ? `${count} reminder${count !== 1 ? 's' : ''} due` : 'No reminders'}
    >
      {/* Bell Icon */}
      <svg
        className="w-5 h-5"
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

      {/* Count Badge - Only show when count > 0 */}
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-orange-200/50">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
