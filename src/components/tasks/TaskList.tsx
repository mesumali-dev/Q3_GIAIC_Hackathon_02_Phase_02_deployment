"use client";

/**
 * TaskList Component
 *
 * Displays a list of tasks with:
 * - Empty state when no tasks
 * - Loading state while fetching
 * - Error state for API errors
 * - Task cards with update/delete handlers
 *
 * @see US2: View Task List
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Task, getTasks } from "@/lib/api";
import { getUser } from "@/lib/auth-helper";
import TaskCard from "./TaskCard";

interface TaskListProps {
  onEdit?: (task: Task) => void;
}

export default function TaskList({ onEdit }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch tasks on mount
   */
  useEffect(() => {
    const fetchTasks = async () => {
      const user = getUser();
      if (!user) {
        setError("You must be logged in to view tasks");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getTasks(user.id);
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setTasks(result.data.tasks);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load tasks"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  /**
   * Handle task update
   */
  const handleUpdate = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  /**
   * Handle task delete
   */
  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 blur-xl opacity-30" />
          </div>
          <p className="text-gray-500 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-rose-700">Something went wrong</h3>
            <p className="text-rose-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No tasks yet</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Create your first task and start being productive today!
        </p>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Your First Task
        </Link>
      </div>
    );
  }

  // Task list
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <div>
      {/* Progress Stats */}
      <div className="mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-bold text-gray-900">
                {completedCount} of {tasks.length} completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              {progressPercentage}%
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Task cards */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
