'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logout } from '@/lib/auth-client';

/**
 * User profile component that displays user information from Auth0
 * Example usage in a protected page
 */
export function UserProfile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">Error loading user: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Not logged in</p>
        </CardContent>
      </Card>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0].toUpperCase() || '?';

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.picture} alt={user.name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.name || 'Anonymous'}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-xs">{user.sub}</span>
          </div>
          {user.email_verified && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email Verified:</span>
              <span className="text-green-600">✓ Verified</span>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button variant="outline" onClick={logout} className="w-full">
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
