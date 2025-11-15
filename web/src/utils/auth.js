// Auth token utilities for localStorage management
// Uses 'token' key in localStorage as specified

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The token if it exists, null otherwise
 */
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

/**
 * Clear the authentication token from localStorage
 */
export const clearAuthToken = () => {
  localStorage.removeItem("token");
};
