/**
 * Shared frontend runtime config.
 * Use VITE_API_URL to point to the local backend during development or Docker use.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
