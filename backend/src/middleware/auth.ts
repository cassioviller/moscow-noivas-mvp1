import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../modules/auth/token.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        permissions: string[];
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Acesso não autenticado.' });
  }

  try {
    const payload = await verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, permissions: payload.permissions };
    return next();
  } catch {
    return res.status(401).json({ message: 'Sessão expirada ou inválida.' });
  }
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Você não tem permissão para esta ação.' });
    }
    return next();
  };
}
