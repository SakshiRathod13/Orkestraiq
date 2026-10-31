export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  headers: Record<string, string | string[] | undefined>;
}
