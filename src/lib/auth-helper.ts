/**
 * Auth Helper for localStorage-based JWT token management
 *
 * Provides functions for:
 * - Token storage in localStorage
 * - Token retrieval
 * - Authentication state checking
 * - Logout (token clearing)
 *
 * @see specs/003-backend-auth-refactor
 */

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

/**
 * User type stored in localStorage
 */
export interface StoredUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Store JWT token and user info in localStorage
 */
export function storeAuth(token: string, user: StoredUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) {
    return null;
  }
  try {
    return JSON.parse(userJson) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Clear auth data from localStorage (logout)
 */
export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Check if user is authenticated (has token)
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Alias for getStoredUser for convenience
 */
export const getUser = getStoredUser;
