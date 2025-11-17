import jwt from 'jsonwebtoken';

/**
 * User data structure from Auth0
 */
export interface User {
  userId: string;
  email: string;
  name: string;
  roles: string[];
}

/**
 * Verify and decode an internal JWT token
 * @param token - The JWT token to verify
 * @returns Decoded user data or null if invalid
 */
export function verifyInternalToken(token: string): User | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.INTERNAL_JWT_SECRET!
    ) as User;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate an internal JWT token
 * @param user - User data to encode in the token
 * @param expiresIn - Token expiration time (default: 1 hour)
 * @returns Signed JWT token
 */
export function generateInternalToken(
  user: Omit<User, 'roles'> & { roles?: string[] },
  expiresIn: string = '1h'
): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name,
      roles: user.roles || ['user'],
    },
    process.env.INTERNAL_JWT_SECRET!,
    { expiresIn }
  );
}

/**
 * Check if a user has a specific role
 * @param user - User data
 * @param role - Role to check
 * @returns true if user has the role
 */
export function hasRole(user: User, role: string): boolean {
  return user.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 * @param user - User data
 * @param roles - Array of roles to check
 * @returns true if user has at least one of the roles
 */
export function hasAnyRole(user: User, roles: string[]): boolean {
  return roles.some(role => user.roles.includes(role));
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  return authHeader.replace('Bearer ', '');
}
