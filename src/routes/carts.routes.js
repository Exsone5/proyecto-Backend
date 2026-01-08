import { Router } from 'express';
import Cart from '../models/cart.model.js';  // 👈 Importar el modelo

const router = Router();

// POST / - Crea un nuevo carrito vacío
router.post('/', async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });

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

// GET /:cid - Obtiene un carrito con productos completos (populate)
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    const cart = await Cart.findById(cid)
      .populate('products.product')
      .lean();

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
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    
    const cart = await Cart.findById(cid);
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }
    
    // Buscar si el producto ya existe
    const productIndex = cart.products.findIndex(
      p => p.product.toString() === pid
    );
    
    if (productIndex !== -1) {
      // Incrementar cantidad
      cart.products[productIndex].quantity += 1;
    } else {
      // Agregar nuevo producto
      cart.products.push({ product: pid, quantity: 1 });
    }
    
    await cart.save();

    res.json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: cart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al agregar el producto al carrito',
      error: error.message
    });
  }
});

// DELETE /:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    
    const cart = await Cart.findById(cid);
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }
    
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    
    res.json({ 
      status: 'success', 
      message: 'Producto eliminado del carrito',
      payload: cart
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /:cid - Actualizar TODO el carrito con un array nuevo
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // Array: [{product: id, quantity: num}, ...]
    
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    );
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }
    
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /:cid/products/:pid - Actualizar solo la cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findById(cid);
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }
    
    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    
    if (productIndex !== -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado en el carrito'
      });
    }
    
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /:cid - Vaciar carrito completamente
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con ID ${cid} no encontrado`
      });
    }
    
    res.json({ 
      status: 'success', 
      message: 'Carrito vaciado',
      payload: cart 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;