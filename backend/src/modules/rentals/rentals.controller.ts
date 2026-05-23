import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import {
  bailSchema,
  confirmDelivery,
  confirmReturn,
  contractSchema,
  createRental,
  getRental,
  listReceivables,
  listRentals,
  paymentSchema,
  registerBail,
  registerPayment,
  rentalCreateSchema,
  returnSchema,
  swapItem,
  swapItemSchema,
  updateContract,
  validateDelivery
} from './rentals.service.js';

export const rentalsRouter = Router();

rentalsRouter.use(authenticate);

rentalsRouter.get('/', requirePermission('locacao:listar'), async (_req, res, next) => {
  try { res.json(await listRentals()); } catch (error) { next(error); }
});

rentalsRouter.post('/', requirePermission('locacao:criar'), async (req, res, next) => {
  try { res.status(201).json(await createRental(rentalCreateSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});

rentalsRouter.get('/receivables', requirePermission('financeiro:listar'), async (_req, res, next) => {
  try { res.json(await listReceivables()); } catch (error) { next(error); }
});

rentalsRouter.post('/payments', requirePermission('financeiro:registrar_pagamento'), async (req, res, next) => {
  try { res.status(201).json(await registerPayment(paymentSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});

rentalsRouter.get('/:id', requirePermission('locacao:listar'), async (req, res, next) => {
  try { res.json(await getRental(z.string().uuid().parse(req.params.id))); } catch (error) { next(error); }
});

rentalsRouter.post('/:id/bail', requirePermission('caucao:movimentar'), async (req, res, next) => {
  try { res.status(201).json(await registerBail(z.string().uuid().parse(req.params.id), bailSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});

rentalsRouter.patch('/:id/contract', requirePermission('contratos:editar'), async (req, res, next) => {
  try { res.json(await updateContract(z.string().uuid().parse(req.params.id), contractSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});

rentalsRouter.get('/:id/delivery/validate', requirePermission('locacao:retirada'), async (req, res, next) => {
  try { res.json(await validateDelivery(z.string().uuid().parse(req.params.id))); } catch (error) { next(error); }
});

rentalsRouter.post('/:id/delivery', requirePermission('locacao:retirada'), async (req, res, next) => {
  try { res.json(await confirmDelivery(z.string().uuid().parse(req.params.id), req.user!.id)); } catch (error) { next(error); }
});

rentalsRouter.post('/:id/return', requirePermission('locacao:devolucao'), async (req, res, next) => {
  try { res.json(await confirmReturn(z.string().uuid().parse(req.params.id), returnSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});

rentalsRouter.post('/:id/swap-item', requirePermission('locacao:substituir_item'), async (req, res, next) => {
  try { res.json(await swapItem(z.string().uuid().parse(req.params.id), swapItemSchema.parse(req.body), req.user!.id)); } catch (error) { next(error); }
});
