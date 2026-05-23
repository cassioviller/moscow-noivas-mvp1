import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import {
  convertLeadToClient,
  createQuickLead,
  createTask,
  findLeadDuplicates,
  getLead,
  leadStatusSchema,
  listClients,
  listLeads,
  listTasks,
  quickLeadSchema,
  taskSchema,
  updateLeadStatus
} from './crm.service.js';

export const crmRouter = Router();

crmRouter.use(authenticate);

crmRouter.post('/quick-leads', requirePermission('leads:criar'), async (req, res, next) => {
  try {
    res.status(201).json(await createQuickLead(quickLeadSchema.parse(req.body), req.user!.id));
  } catch (error) {
    next(error);
  }
});

crmRouter.get('/leads/duplicates', requirePermission('leads:listar'), async (req, res, next) => {
  try {
    res.json(await findLeadDuplicates(String(req.query.telefone ?? ''), String(req.query.email ?? '')));
  } catch (error) {
    next(error);
  }
});

crmRouter.get('/leads', requirePermission('leads:listar'), async (_req, res, next) => {
  try {
    res.json(await listLeads());
  } catch (error) {
    next(error);
  }
});

crmRouter.get('/leads/:id', requirePermission('leads:listar'), async (req, res, next) => {
  try {
    res.json(await getLead(z.string().uuid().parse(req.params.id)));
  } catch (error) {
    next(error);
  }
});

crmRouter.patch('/leads/:id/status', requirePermission('leads:editar'), async (req, res, next) => {
  try {
    const body = leadStatusSchema.parse(req.body);
    res.json(await updateLeadStatus(z.string().uuid().parse(req.params.id), body.status, req.user!.id));
  } catch (error) {
    next(error);
  }
});

crmRouter.post('/leads/:id/convert', requirePermission('clientes:criar'), async (req, res, next) => {
  try {
    res.json(await convertLeadToClient(z.string().uuid().parse(req.params.id), req.user!.id));
  } catch (error) {
    next(error);
  }
});

crmRouter.get('/clients', requirePermission('clientes:listar'), async (_req, res, next) => {
  try {
    res.json(await listClients());
  } catch (error) {
    next(error);
  }
});

crmRouter.get('/tasks', requirePermission('tarefas:listar'), async (_req, res, next) => {
  try {
    res.json(await listTasks());
  } catch (error) {
    next(error);
  }
});

crmRouter.post('/tasks', requirePermission('tarefas:criar'), async (req, res, next) => {
  try {
    res.status(201).json(await createTask(taskSchema.parse(req.body), req.user!.id));
  } catch (error) {
    next(error);
  }
});
