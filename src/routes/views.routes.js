import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productManager = new ProductManager(
  path.join(__dirname, '../data/products.json')
);

// GET / - Vista home con lista de productos
router.get('/', (req, res) => {
  try {
    const products = productManager.getProducts();
    res.render('home', {
      title: 'Lista de Productos',
      products: products,
      hasProducts: products.length > 0
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cargar los productos',
      error: error.message
    });
  }
});

// GET /realtimeproducts - Vista con actualización en tiempo real
router.get('/realtimeproducts', (req, res) => {
  try {
    const products = productManager.getProducts();
    res.render('realTimeProducts', {
      title: 'Productos en Tiempo Real',
      products: products,
      hasProducts: products.length > 0
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cargar los productos',
      error: error.message
    });
  }
});

export default router;
