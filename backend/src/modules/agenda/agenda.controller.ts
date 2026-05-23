import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import { appointmentSchema, cancelAppointment, createAppointment, listAppointments, listReservations, listRooms, updateAppointmentStatus } from './agenda.service.js';

export const agendaRouter = Router();

agendaRouter.use(authenticate);

agendaRouter.get('/rooms', requirePermission('salas:listar'), async (_req, res, next) => {
  try {
    res.json(await listRooms());
  } catch (error) {
    next(error);
  }
});

agendaRouter.get('/appointments', requirePermission('agenda:listar'), async (_req, res, next) => {
  try {
    res.json(await listAppointments());
  } catch (error) {
    next(error);
  }
});

agendaRouter.post('/appointments', requirePermission('agenda:criar'), async (req, res, next) => {
  try {
    res.status(201).json(await createAppointment(appointmentSchema.parse(req.body), req.user!.id));
  } catch (error) {
    next(error);
  }
});

agendaRouter.post('/appointments/:id/cancel', requirePermission('agenda:editar'), async (req, res, next) => {
  try {
    res.json(await cancelAppointment(z.string().uuid().parse(req.params.id), req.user!.id));
  } catch (error) {
    next(error);
  }
});

agendaRouter.patch('/appointments/:id/status', requirePermission('agenda:editar'), async (req, res, next) => {
  try {
    const body = z.object({ status: z.string().min(2) }).parse(req.body);
    res.json(await updateAppointmentStatus(z.string().uuid().parse(req.params.id), body.status, req.user!.id));
  } catch (error) {
    next(error);
  }
});

agendaRouter.get('/reservations', requirePermission('reservas:listar'), async (_req, res, next) => {
  try {
    res.json(await listReservations());
  } catch (error) {
    next(error);
  }
});
