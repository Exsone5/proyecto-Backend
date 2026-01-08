import { Router } from 'express';
import Product from '../models/product.model.js'; 
const router = Router();

// GET / - Lista todos los productos con paginación, filtros y ordenamiento
router.get('/', async (req, res) => {
  try {
    // Obtener parámetros de la query
    const { limit = 10, page = 1, sort, query } = req.query;
    
    // Construir el filtro de búsqueda
    let filter = {};
    if (query) {
      // Permite buscar por categoría o disponibilidad
      // Ejemplo: ?query=category:electronica o ?query=status:true
      const [field, value] = query.split(':');
      if (field === 'category') {
        filter.category = value;
      }
      if (field === 'status') {
        filter.status = value === 'true';
      }
    }
    
    // Opciones de paginación
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true // Para obtener objetos JS planos
    };
    
    // Agregar ordenamiento si existe
    if (sort === 'asc') {
      options.sort = { price: 1 };
    } else if (sort === 'desc') {
      options.sort = { price: -1 };
    }
    
    // Ejecutar la consulta con paginación
    const result = await Product.paginate(filter, options);
    
    // Construir los links de navegación
    const baseUrl = '/api/products';
    const buildQueryString = (pageNum) => {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', limit);
      if (sort) params.append('sort', sort);
      if (query) params.append('query', query);
      return `${baseUrl}?${params.toString()}`;
    };
    
    // Respuesta en el formato solicitado
    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildQueryString(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildQueryString(result.nextPage) : null
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
router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findById(pid);

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
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await Product.create(productData);

    // Emite evento de Socket.io para actualizar la vista en tiempo real
    const products = await Product.find().lean();
    req.io.emit('updateProducts', products);

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
router.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      pid,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con ID ${pid} no encontrado`
      });
    }

    // Emite evento de Socket.io para actualizar la vista en tiempo real
    const products = await Product.find().lean();
    req.io.emit('updateProducts', products);

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
router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(pid);

    if (!deletedProduct) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con ID ${pid} no encontrado`
      });
    }

    // Emite evento de Socket.io para actualizar la vista en tiempo real
    const products = await Product.find().lean();
    req.io.emit('updateProducts', products);

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