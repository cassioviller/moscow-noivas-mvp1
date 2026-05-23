import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { getRuleHistory, listRuleModules, ruleUpdateSchema, updateRule } from './rules.service.js';

export const rulesRouter = Router();

rulesRouter.use(authenticate);

rulesRouter.get('/', requirePermission('regras:listar'), async (_req, res, next) => {
  try {
    res.json(await listRuleModules());
  } catch (error) {
    next(error);
  }
});

rulesRouter.patch('/:id', requirePermission('regras:editar'), async (req, res, next) => {
  try {
    res.json(await updateRule(z.string().uuid().parse(req.params.id), ruleUpdateSchema.parse(req.body), req.user!.id));
  } catch (error) {
    next(error);
  }
});

rulesRouter.get('/:id/history', requirePermission('regras:listar'), async (req, res, next) => {
  try {
    res.json(await getRuleHistory(z.string().uuid().parse(req.params.id)));
  } catch (error) {
    next(error);
  }
});
