import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { availabilitySchema, validateAvailability } from './availability.service.js';

export const availabilityRouter = Router();

availabilityRouter.use(authenticate);

availabilityRouter.post('/validar', requirePermission('disponibilidade:validar'), async (req, res, next) => {
  try {
    res.json(await validateAvailability(availabilitySchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});
