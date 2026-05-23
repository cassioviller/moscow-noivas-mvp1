import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import {
  attendantBlockSchema,
  attendantScheduleSchema,
  createAttendantBlock,
  createEmployee,
  createSchedule,
  createStoreBlock,
  employeeSchema,
  listAttendantBlocks,
  listEmployees,
  listSchedules,
  listStoreBlocks,
  storeBlockSchema
} from './employees.service.js';

export const employeesRouter = Router();

employeesRouter.use(authenticate);

employeesRouter.get('/', requirePermission('atendentes:listar'), async (_req, res, next) => {
  try {
    res.json(await listEmployees());
  } catch (error) {
    next(error);
  }
});

employeesRouter.post('/', requirePermission('atendentes:editar'), async (req, res, next) => {
  try {
    res.status(201).json(await createEmployee(employeeSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

employeesRouter.get('/schedules', requirePermission('atendentes:listar'), async (_req, res, next) => {
  try {
    res.json(await listSchedules());
  } catch (error) {
    next(error);
  }
});

employeesRouter.post('/schedules', requirePermission('atendentes:editar'), async (req, res, next) => {
  try {
    res.status(201).json(await createSchedule(attendantScheduleSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

employeesRouter.get('/attendant-blocks', requirePermission('atendentes:listar'), async (_req, res, next) => {
  try {
    res.json(await listAttendantBlocks());
  } catch (error) {
    next(error);
  }
});

employeesRouter.post('/attendant-blocks', requirePermission('atendentes:editar'), async (req, res, next) => {
  try {
    res.status(201).json(await createAttendantBlock(attendantBlockSchema.parse(req.body), req.user!.id));
  } catch (error) {
    next(error);
  }
});

employeesRouter.get('/store-blocks', requirePermission('atendentes:listar'), async (_req, res, next) => {
  try {
    res.json(await listStoreBlocks());
  } catch (error) {
    next(error);
  }
});

employeesRouter.post('/store-blocks', requirePermission('atendentes:editar'), async (req, res, next) => {
  try {
    res.status(201).json(await createStoreBlock(storeBlockSchema.parse(req.body), req.user!.id));
  } catch (error) {
    next(error);
  }
});
