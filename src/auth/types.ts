import { UserRole } from '@prisma/client';

export interface JWTPayload {
  email: string;
  userId: number;
  role: UserRole;
}

export interface JWTPayloadWithRefreshToken extends JWTPayload {
  refreshToken: string;
}
