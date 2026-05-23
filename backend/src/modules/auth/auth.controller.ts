import { Router } from 'express';
import { z } from 'zod';
import { login } from './auth.service.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login({
      email: input.email,
      password: input.password,
      ip: req.ip,
      userAgent: req.header('user-agent') ?? undefined
    });
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'LOGIN_FAILED') {
      return res.status(401).json({
        message: 'Não conseguimos entrar com esses dados. Verifique e tente novamente.'
      });
    }
    return next(error);
  }
});
