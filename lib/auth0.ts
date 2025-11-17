import { Auth0Client } from '@auth0/nextjs-auth0/server';

/**
 * Auth0 client instance for server-side authentication
 * This instance is used across the application for all Auth0 operations
 */
export const auth0 = new Auth0Client();
