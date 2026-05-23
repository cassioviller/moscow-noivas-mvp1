import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { getDashboard } from './dashboard.service.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/', requirePermission('dashboard:listar'), async (_req, res, next) => {
  try { res.json(await getDashboard()); } catch (error) { next(error); }
});
