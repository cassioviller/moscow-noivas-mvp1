import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { createOption, deleteOption, listOptions, optionSchema, updateOption } from './settings.service.js';

export const settingsRouter = Router();

settingsRouter.use(authenticate);

settingsRouter.get('/options', requirePermission('regras:listar'), async (req, res, next) => {
  try {
    res.json(await listOptions(String(req.query.modulo ?? ''), String(req.query.campo ?? '')));
  } catch (error) {
    next(error);
  }
});

settingsRouter.post('/options', requirePermission('regras:editar'), async (req, res, next) => {
  try {
    res.status(201).json(await createOption(optionSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

settingsRouter.put('/options/:id', requirePermission('regras:editar'), async (req, res, next) => {
  try {
    res.json(await updateOption(z.string().uuid().parse(req.params.id), optionSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

settingsRouter.delete('/options/:id', requirePermission('regras:editar'), async (req, res, next) => {
  try {
    res.json(await deleteOption(z.string().uuid().parse(req.params.id)));
  } catch (error) {
    next(error);
  }
});
