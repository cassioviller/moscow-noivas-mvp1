import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { anonymizeLead, consentSchema, createLgpdRequest, lgpdRequestSchema, listLgpd, upsertConsent } from './lgpd.service.js';

export const lgpdRouter = Router();

lgpdRouter.use(authenticate);

lgpdRouter.get('/', requirePermission('lgpd:listar'), async (_req, res, next) => {
  try { res.json(await listLgpd()); } catch (error) { next(error); }
});

lgpdRouter.post('/consents', requirePermission('lgpd:editar'), async (req, res, next) => {
  try { res.status(201).json(await upsertConsent(consentSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});

lgpdRouter.post('/requests', requirePermission('lgpd:editar'), async (req, res, next) => {
  try { res.status(201).json(await createLgpdRequest(lgpdRequestSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});

lgpdRouter.post('/leads/:id/anonymize', requirePermission('lgpd:editar'), async (req, res, next) => {
  try {
    const body = z.object({ motivo: z.string().min(2) }).parse(req.body);
    res.json(await anonymizeLead(z.string().uuid().parse(req.params.id), body.motivo, req.user!.id));
  } catch (error) { next(error); }
});
