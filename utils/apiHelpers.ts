/**
 * API helper utilities for backend communication
 */

/**
 * Constructs the full backend API URL by combining the base URL with the endpoint path
 * @param endpoint The API endpoint path (should start with a slash)
 * @returns The complete backend API URL
 */
export function getBackendApiUrl(endpoint: string): string {
  // Get the backend API base URL from environment variable or use a default
  const baseUrl = process.env.AUTH_API_URL || 'http://localhost:3001/api';
  
  // Ensure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Combine base URL with endpoint
  return `${baseUrl}${formattedEndpoint}`;
}
