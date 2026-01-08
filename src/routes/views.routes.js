import { Router } from 'express';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';

const router = Router();

// GET / - Vista home (puedes mantenerla o redirigir a /products)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('home', {
      title: 'Chivi-Market',
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
router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await Product.find().lean();
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

// GET /products - Nueva vista con paginación (REQUERIDA POR LA CONSIGNA)
router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    
    // Construir filtro
    let filter = {};
    if (query) {
      const [field, value] = query.split(':');
      if (field === 'category') filter.category = value;
      if (field === 'status') filter.status = value === 'true';
    }
    
    // Opciones de paginación
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true
    };
    
    // Agregar ordenamiento
    if (sort === 'asc') options.sort = { price: 1 };
    if (sort === 'desc') options.sort = { price: -1 };
    
    // Ejecutar consulta
    const result = await Product.paginate(filter, options);
    
    // Construir links de navegación
    const buildLink = (pageNum) => {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', limit);
      if (sort) params.append('sort', sort);
      if (query) params.append('query', query);
      return `/products?${params.toString()}`;
    };
    
    res.render('products', {
      title: 'Productos - Chivi-Market',
      products: result.docs,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
        nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cargar los productos',
      error: error.message
    });
  }
});

// GET /products/:pid - Detalle de un producto individual (OPCIONAL pero útil)
router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid).lean();
    
    if (!product) {
      return res.status(404).render('error', {
        message: 'Producto no encontrado'
      });
    }
    
    res.render('productDetail', {
      title: product.title,
      product: product
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cargar el producto',
      error: error.message
    });
  }
});

// GET /carts/:cid - Vista de carrito específico (REQUERIDA POR LA CONSIGNA)
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    // Traer carrito con productos completos usando populate
    const cart = await Cart.findById(cid)
      .populate('products.product')
      .lean();
    
    if (!cart) {
      return res.status(404).render('error', {
        message: 'Carrito no encontrado'
      });
    }
    
    // Calcular total
    let total = 0;
    cart.products.forEach(item => {
      if (item.product) {
        total += item.product.price * item.quantity;
      }
    });
    
    res.render('cart', {
      title: 'Mi Carrito - Chivi-Market',
      cartId: cid,
      products: cart.products,
      total: total.toFixed(2),
      hasProducts: cart.products.length > 0
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cargar el carrito',
      error: error.message
    });
  }
});

export default router;