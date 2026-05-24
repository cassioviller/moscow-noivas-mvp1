import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { agendaRouter } from './modules/agenda/agenda.controller.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { availabilityRouter } from './modules/availability/availability.controller.js';
import { crmRouter } from './modules/crm/crm.controller.js';
import { dashboardRouter } from './modules/dashboard/dashboard.controller.js';
import { employeesRouter } from './modules/employees/employees.controller.js';
import { lgpdRouter } from './modules/lgpd/lgpd.controller.js';
import { outboxRouter } from './modules/outbox/outbox.controller.js';
import { productsRouter } from './modules/products/products.controller.js';
import { rentalsRouter } from './modules/rentals/rentals.controller.js';
import { rulesRouter } from './modules/rules/rules.controller.js';
import { settingsRouter } from './modules/settings/settings.controller.js';
import { traceabilityRouter } from './modules/traceability/traceability.controller.js';
import { usersRouter } from './modules/users/users.controller.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'moscow-noivas', block: 'prompt-01' });
});

app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/users', usersRouter);
app.use('/rules', rulesRouter);
app.use('/settings', settingsRouter);
app.use('/employees', employeesRouter);
app.use('/crm', crmRouter);
app.use('/products', productsRouter);
app.use('/agenda', agendaRouter);
app.use('/disponibilidade', availabilityRouter);
app.use('/api/disponibilidade', availabilityRouter);
app.use('/rentals', rentalsRouter);
app.use('/traceability', traceabilityRouter);
app.use('/lgpd', lgpdRouter);
app.use('/outbox', outboxRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof Error) {
    if (error.message.startsWith('RULE_')) {
      return res.status(422).json({ message: 'Valor de regra inválido.', code: error.message });
    }
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Erro inesperado.' });
});
