import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../../middleware/auth.js';
import {
  addProductPhoto,
  createFile,
  createProduct,
  fileSchema,
  getProduct,
  listCategories,
  listProducts,
  logFileAccess,
  productSchema
} from './products.service.js';

export const productsRouter = Router();

productsRouter.use(authenticate);

productsRouter.get('/categories', requirePermission('produtos:listar'), async (_req, res, next) => {
  try {
    res.json(await listCategories());
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/', requirePermission('produtos:listar'), async (_req, res, next) => {
  try {
    res.json(await listProducts());
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/', requirePermission('produtos:criar'), async (req, res, next) => {
  try {
    res.status(201).json(await createProduct(productSchema.parse(req.body)));
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id', requirePermission('produtos:listar'), async (req, res, next) => {
  try {
    res.json(await getProduct(z.string().uuid().parse(req.params.id)));
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/:id/photos', requirePermission('produtos:editar'), async (req, res, next) => {
  try {
    const body = z.object({ arquivo_id: z.string().uuid(), is_principal: z.boolean().default(false) }).parse(req.body);
    res.status(201).json(await addProductPhoto(z.string().uuid().parse(req.params.id), body.arquivo_id, body.is_principal));
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/files', requirePermission('arquivos:criar'), async (req, res, next) => {
  try {
    res.status(201).json(await createFile(fileSchema.parse(req.body), req.user!.id));
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/files/:id/access-log', requirePermission('arquivos:baixar'), async (req, res, next) => {
  try {
    await logFileAccess(z.string().uuid().parse(req.params.id), req.user!.id, 'baixar', req.ip, req.header('user-agent') ?? undefined);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
