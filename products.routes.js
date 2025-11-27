import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Configuración para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializa el ProductManager con la ruta al archivo products.json
const productManager = new ProductManager(
  path.join(__dirname, '../data/products.json')
);

// GET / - Lista todos los productos
router.get('/', (req, res) => {
  try {
    const products = productManager.getProducts();
    res.json({
      status: 'success',
      payload: products
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los productos',
      error: error.message
    });
  }
});

// GET /:pid - Obtiene un producto específico por ID
router.get('/:pid', (req, res) => {
  try {
    const { pid } = req.params;
    const product = productManager.getProductById(pid);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con ID ${pid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      payload: product
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
});

// POST / - Crea un nuevo producto
router.post('/', (req, res) => {
  try {
    const productData = req.body;
    const newProduct = productManager.addProduct(productData);

    res.status(201).json({
      status: 'success',
      message: 'Producto creado exitosamente',
      payload: newProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Error al crear el producto',
      error: error.message
    });
  }
});

// PUT /:pid - Actualiza un producto existente
router.put('/:pid', (req, res) => {
  try {
    const { pid } = req.params;
    const updateData = req.body;

    const updatedProduct = productManager.updateProduct(pid, updateData);

    if (!updatedProduct) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con ID ${pid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      payload: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
});

// DELETE /:pid - Elimina un producto
router.delete('/:pid', (req, res) => {
  try {
    const { pid } = req.params;
    const deleted = productManager.deleteProduct(pid);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con ID ${pid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      message: `Producto con ID ${pid} eliminado exitosamente`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el producto',
      error: error.message
    });
  }
});

export default router;