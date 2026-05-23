import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { listOutbox, processOutboxBatch } from './outbox.service.js';

export const outboxRouter = Router();

outboxRouter.use(authenticate);

outboxRouter.get('/', requirePermission('eventos:listar'), async (_req, res, next) => {
  try { res.json(await listOutbox()); } catch (error) { next(error); }
});

outboxRouter.post('/process', requirePermission('eventos:processar'), async (_req, res, next) => {
  try { res.json(await processOutboxBatch()); } catch (error) { next(error); }
});
