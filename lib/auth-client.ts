'use client';

/**
 * Client-side authentication helpers for React components
 */

/**
 * Fetch internal JWT token from the server
 * This should be called after successful Auth0 login
 * @returns Internal JWT token or null if not authenticated
 */
export async function fetchInternalToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/internal-token');

    if (!response.ok) {
      console.error('Failed to fetch internal token:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.internalToken;
  } catch (error) {
    console.error('Error fetching internal token:', error);
    return null;
  }
}

/**
 * Fetch protected data using internal JWT token
 * @param endpoint - API endpoint to call
 * @param token - Internal JWT token (optional, will be fetched if not provided)
 * @returns Response data or null if error
 */
export async function fetchProtectedData<T = any>(
  endpoint: string,
  token?: string
): Promise<T | null> {
  try {
    // Fetch token if not provided
    const authToken = token || await fetchInternalToken();

    if (!authToken) {
      console.error('No authentication token available');
      return null;
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Protected API call failed:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling protected API:', error);
    return null;
  }
}

/**
 * Store internal token in session storage
 * @param token - JWT token to store
 */
export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('internal_token', token);
  }
}

/**
 * Get stored internal token from session storage
 * @returns Stored token or null
 */
export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('internal_token');
  }
  return null;
}

/**
 * Clear stored internal token
 */
export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('internal_token');
  }
}

/**
 * Logout user by clearing token and redirecting to Auth0 logout
 */
export function logout(): void {
  clearStoredToken();
  window.location.href = '/api/auth/logout';
}
