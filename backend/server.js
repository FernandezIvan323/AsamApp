import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Obtener todos los eventos
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { insumos: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Crear un nuevo evento
app.post('/api/events', async (req, res) => {
  try {
    const { title, client, date, time, location, guests, extraCosts, profitMargin, totalPrice, insumos } = req.body;
    
    const event = await prisma.event.create({
      data: {
        title, client, date, time, location, guests, extraCosts, profitMargin, totalPrice,
        insumos: {
          create: insumos || []
        }
      },
      include: { insumos: true }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// Actualizar un evento (ej. cambiar estado)
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Por ahora, solo permitimos actualizar el estado de forma sencilla.
    // Si se necesitara actualizar todo el evento e insumos, habría que borrar y recrear insumos.
    const event = await prisma.event.update({
      where: { id },
      data: { status },
      include: { insumos: true }
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

// Eliminar un evento
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

// --- RUTAS DE INVENTARIO (CATÁLOGO) ---

// Obtener todo el catálogo
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await prisma.catalogItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// Crear nuevo insumo en el catálogo
app.post('/api/inventory', async (req, res) => {
  try {
    const { name, unit, price } = req.body;
    const item = await prisma.catalogItem.create({
      data: { name, unit, price }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear insumo' });
  }
});

// Actualizar un insumo
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, price } = req.body;
    const item = await prisma.catalogItem.update({
      where: { id },
      data: { name, unit, price }
    });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar insumo' });
  }
});

// Eliminar un insumo
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.catalogItem.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar insumo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
