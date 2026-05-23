import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import {
  createUser,
  listProfilesAndPermissions,
  listUsers,
  setProfilePermissions,
  updateUser,
  userCreateSchema,
  userUpdateSchema
} from './users.service.js';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/', requirePermission('usuarios:listar'), async (_req, res, next) => {
  try {
    res.json(await listUsers());
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', requirePermission('usuarios:criar'), async (req, res, next) => {
  try {
    res.status(201).json(await createUser(userCreateSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/:id', requirePermission('usuarios:editar'), async (req, res, next) => {
  try {
    res.json(await updateUser(z.string().uuid().parse(req.params.id), userUpdateSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/profiles', requirePermission('usuarios:permissoes'), async (_req, res, next) => {
  try {
    res.json(await listProfilesAndPermissions());
  } catch (error) {
    next(error);
  }
});

usersRouter.put('/profiles/:id/permissions', requirePermission('usuarios:permissoes'), async (req, res, next) => {
  try {
    const body = z.object({ permissao_ids: z.array(z.string().uuid()) }).parse(req.body);
    res.json(await setProfilePermissions(z.string().uuid().parse(req.params.id), body.permissao_ids, req.user!.id));
  } catch (error) {
    next(error);
  }
});
