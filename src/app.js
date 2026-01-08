import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';  // 👈 AGREGAR
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;

// Configuración para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONEXIÓN A MONGODB
const MONGODB_URI = 'mongodb+srv://juanchylucero5_db_user:uTdvwOEzQKMHIvzV@cluster0.rl29wt9.mongodb.net?appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((error) => console.error('❌ Error al conectar a MongoDB:', error));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars con helpers personalizados
app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b,
    lt: (a, b) => a < b,
    multiply: (a, b) => a * b  // 👈 AGREGAR
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Verifica y crea la carpeta data si no existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Carpeta data creada');
}

// Middleware para hacer el objeto io accesible en las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas de API (PRIMERO)
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Rutas de vistas (DESPUÉS)
app.use('/', viewsRouter);

// Ruta raíz para verificar que el servidor funciona
app.get('/api', (req, res) => {
  res.json({
    message: 'API de E-commerce funcionando correctamente',
    endpoints: {
      products: '/api/products',
      carts: '/api/carts',
      home: '/',
      realTimeProducts: '/realtimeproducts'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});

// Configuración de WebSockets
io.on('connection', (socket) => {
  console.log('🔌 Nuevo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Inicia el servidor
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📦 Productos: http://localhost:${PORT}/api/products`);
  console.log(`🛒 Carritos: http://localhost:${PORT}/api/carts`);
  console.log(`🏠 Home: http://localhost:${PORT}`);
  console.log(`⚡ Real Time Products: http://localhost:${PORT}/realtimeproducts`);
});

export { io };