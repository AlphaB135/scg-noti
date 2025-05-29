// Moved from backend/tests/helpers.ts
export * from '../../tests/helpers';

/**
 * Mock loginHelper for tests. Returns a dummy cookie string for authentication.
 */
export async function loginHelper(email: string, password: string): Promise<string> {
  // In real tests, you would POST to /api/auth/login and extract the cookie
  // For now, return a dummy cookie string for jwtGuard to pass
  return 'jwt=dummy.jwt.token; Path=/; HttpOnly';
}
