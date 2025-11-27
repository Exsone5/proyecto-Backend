import fs from 'fs';
import path from 'path';

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.init();
  }

  // Inicializa el archivo si no existe
  init() {
    try {
      if (!fs.existsSync(this.path)) {
        fs.writeFileSync(this.path, JSON.stringify([], null, 2));
      }
      this.products = this.loadProducts();
    } catch (error) {
      console.error('Error al inicializar ProductManager:', error);
      this.products = [];
    }
  }

  // Carga los productos desde el archivo JSON
  loadProducts() {
    try {
      const data = fs.readFileSync(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      return [];
    }
  }

  // Guarda los productos en el archivo JSON
  saveProducts() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
      return true;
    } catch (error) {
      console.error('Error al guardar productos:', error);
      return false;
    }
  }

  // Genera un ID único autoincremental
  generateId() {
    if (this.products.length === 0) {
      return 1;
    }
    const maxId = Math.max(...this.products.map(p => p.id));
    return maxId + 1;
  }

  // GET - Obtiene todos los productos
  getProducts() {
    this.products = this.loadProducts();
    return this.products;
  }

  // GET - Obtiene un producto por ID
  getProductById(id) {
    this.products = this.loadProducts();
    const product = this.products.find(p => p.id === parseInt(id));
    return product || null;
  }

  // POST - Agrega un nuevo producto
  addProduct(productData) {
    this.products = this.loadProducts();

    // Validación de campos obligatorios
    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    // Verifica que el código no esté duplicado
    const codeExists = this.products.some(p => p.code === productData.code);
    if (codeExists) {
      throw new Error(`Ya existe un producto con el código ${productData.code}`);
    }

    // Crea el nuevo producto con valores por defecto
    const newProduct = {
      id: this.generateId(),
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: parseFloat(productData.price),
      status: productData.status !== undefined ? productData.status : true,
      stock: parseInt(productData.stock),
      category: productData.category,
      thumbnails: productData.thumbnails || []
    };

    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  // PUT - Actualiza un producto existente
  updateProduct(id, updateData) {
    this.products = this.loadProducts();
    const index = this.products.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return null;
    }

    // No permite actualizar el ID
    if (updateData.id) {
      delete updateData.id;
    }

    // Verifica que el código no esté duplicado (si se está actualizando)
    if (updateData.code) {
      const codeExists = this.products.some(
        p => p.code === updateData.code && p.id !== parseInt(id)
      );
      if (codeExists) {
        throw new Error(`Ya existe otro producto con el código ${updateData.code}`);
      }
    }

    // Actualiza solo los campos proporcionados
    this.products[index] = {
      ...this.products[index],
      ...updateData,
      id: this.products[index].id // Asegura que el ID no cambie
    };

    this.saveProducts();
    return this.products[index];
  }

  // DELETE - Elimina un producto
  deleteProduct(id) {
    this.products = this.loadProducts();
    const index = this.products.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return false;
    }

    this.products.splice(index, 1);
    this.saveProducts();
    return true;
  }
}

export default ProductManager;