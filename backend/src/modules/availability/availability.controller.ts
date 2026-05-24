import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { availabilitySchema, listAvailabilityOptions, validateAvailability } from './availability.service.js';

export const availabilityRouter = Router();

availabilityRouter.use(authenticate);

availabilityRouter.post('/validar', requirePermission('disponibilidade:validar'), async (req, res, next) => {
  try {
    res.json(await validateAvailability(availabilitySchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

availabilityRouter.post('/opcoes', requirePermission('disponibilidade:validar'), async (req, res, next) => {
  try {
    res.json(await listAvailabilityOptions(availabilitySchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});
