import { randomBytes, createHash } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '../../config/env.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export type AuthTokenPayload = {
  sub: string;
  email: string;
  permissions: string[];
};

export async function signAccessToken(payload: AuthTokenPayload) {
  return new SignJWT({ email: payload.email, permissions: payload.permissions })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_EXPIRES_IN_MINUTES}m`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    permissions: Array.isArray(payload.permissions) ? payload.permissions.map(String) : []
  };
}

export function createRefreshToken() {
  return randomBytes(48).toString('base64url');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
