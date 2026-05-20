import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import {
  validateCatalogPayload,
  validateEventPayload,
  validateStatusPayload,
} from './validation.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN;

app.use(cors(corsOrigin ? { origin: corsOrigin.split(',').map(origin => origin.trim()) } : undefined));
app.use(express.json({ limit: '1mb' }));

function sendValidationError(res, errors) {
  return res.status(400).json({ error: errors.join('. ') });
}

function handlePrismaError(res, error, fallbackMessage) {
  console.error(error);
  if (error?.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }
  return res.status(500).json({ error: fallbackMessage });
}

app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { insumos: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(events);
  } catch (error) {
    handlePrismaError(res, error, 'Error al obtener eventos');
  }
});

app.post('/api/events', async (req, res) => {
  const { errors, data } = validateEventPayload(req.body);
  if (errors.length) return sendValidationError(res, errors);

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        client: data.client,
        date: data.date,
        time: data.time,
        location: data.location,
        guests: data.guests,
        status: data.status,
        extraCosts: data.extraCosts,
        profitMargin: data.profitMargin,
        totalPrice: data.totalPrice,
        insumos: {
          create: data.insumos,
        },
      },
      include: { insumos: true },
    });
    res.status(201).json(event);
  } catch (error) {
    handlePrismaError(res, error, 'Error al crear evento');
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { errors, data } = validateStatusPayload(req.body);
  if (errors.length) return sendValidationError(res, errors);

  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
      include: { insumos: true },
    });
    res.json(event);
  } catch (error) {
    handlePrismaError(res, error, 'Error al actualizar evento');
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(res, error, 'Error al eliminar evento');
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const items = await prisma.catalogItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    handlePrismaError(res, error, 'Error al obtener inventario');
  }
});

app.post('/api/inventory', async (req, res) => {
  const { errors, data } = validateCatalogPayload(req.body);
  if (errors.length) return sendValidationError(res, errors);

  try {
    const item = await prisma.catalogItem.create({ data });
    res.status(201).json(item);
  } catch (error) {
    handlePrismaError(res, error, 'Error al crear insumo');
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { errors, data } = validateCatalogPayload(req.body);
  if (errors.length) return sendValidationError(res, errors);

  try {
    const item = await prisma.catalogItem.update({
      where: { id: req.params.id },
      data,
    });
    res.json(item);
  } catch (error) {
    handlePrismaError(res, error, 'Error al actualizar insumo');
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await prisma.catalogItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    handlePrismaError(res, error, 'Error al eliminar insumo');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
