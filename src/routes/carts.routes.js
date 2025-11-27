import { Router } from 'express';
import CartManager from '../managers/CartManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Configuración para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa el CartManager con la ruta al archivo carts.json
const cartManager = new CartManager(
  path.join(__dirname, '../data/carts.json')
);

// POST / - Crea un nuevo carrito vacío
router.post('/', (req, res) => {
  try {
    const newCart = cartManager.createCart();

    res.status(201).json({
      status: 'success',
      message: 'Carrito creado exitosamente',
      payload: newCart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al crear el carrito',
      error: error.message
    });
  }
});

// GET /:cid - Obtiene los productos de un carrito específico
router.get('/:cid', (req, res) => {
  try {
    const { cid } = req.params;
    const cart = cartManager.getCartById(cid);

    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      payload: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el carrito',
      error: error.message
    });
  }
});

// POST /:cid/product/:pid - Agrega un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = cartManager.addProductToCart(cid, pid);

    if (!updatedCart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar el producto al carrito',
      error: error.message
    });
  }
});

export default router;