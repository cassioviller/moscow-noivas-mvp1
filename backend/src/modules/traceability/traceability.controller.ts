import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { listAuditLogs, listGlossary, listHistory } from './audit.service.js';

export const traceabilityRouter = Router();

traceabilityRouter.use(authenticate);

traceabilityRouter.get('/history', requirePermission('historico:listar'), async (_req, res, next) => {
  try { res.json(await listHistory()); } catch (error) { next(error); }
});

traceabilityRouter.get('/audit', requirePermission('auditoria:listar'), async (_req, res, next) => {
  try { res.json(await listAuditLogs()); } catch (error) { next(error); }
});

traceabilityRouter.get('/glossary', requirePermission('historico:listar'), async (_req, res, next) => {
  try { res.json(await listGlossary()); } catch (error) { next(error); }
});
