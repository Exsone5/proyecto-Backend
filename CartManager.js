import fs from 'fs';

class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.carts = [];
    this.init();
  }

  // Inicializa el archivo si no existe
  init() {
    try {
      if (!fs.existsSync(this.path)) {
        fs.writeFileSync(this.path, JSON.stringify([], null, 2));
      }
      this.carts = this.loadCarts();
    } catch (error) {
      console.error('Error al inicializar CartManager:', error);
      this.carts = [];
    }
  }

  // Carga los carritos desde el archivo JSON
  loadCarts() {
    try {
      const data = fs.readFileSync(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar carritos:', error);
      return [];
    }
  }

  // Guarda los carritos en el archivo JSON
  saveCarts() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
      return true;
    } catch (error) {
      console.error('Error al guardar carritos:', error);
      return false;
    }
  }

  // Genera un ID único autoincremental
  generateId() {
    if (this.carts.length === 0) {
      return 1;
    }
    const maxId = Math.max(...this.carts.map(c => c.id));
    return maxId + 1;
  }

  // POST - Crea un nuevo carrito vacío
  createCart() {
    this.carts = this.loadCarts();

    const newCart = {
      id: this.generateId(),
      products: []
    };

    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  // GET - Obtiene un carrito por ID con sus productos
  getCartById(id) {
    this.carts = this.loadCarts();
    const cart = this.carts.find(c => c.id === parseInt(id));
    return cart || null;
  }

  // POST - Agrega un producto al carrito
  addProductToCart(cartId, productId) {
    this.carts = this.loadCarts();
    const cartIndex = this.carts.findIndex(c => c.id === parseInt(cartId));

    if (cartIndex === -1) {
      return null;
    }

    // Busca si el producto ya existe en el carrito
    const productIndex = this.carts[cartIndex].products.findIndex(
      p => p.product === parseInt(productId)
    );

    if (productIndex !== -1) {
      // Si el producto ya existe, incrementa la cantidad
      this.carts[cartIndex].products[productIndex].quantity += 1;
    } else {
      // Si no existe, lo agrega con cantidad 1
      this.carts[cartIndex].products.push({
        product: parseInt(productId),
        quantity: 1
      });
    }

    this.saveCarts();
    return this.carts[cartIndex];
  }
}

export default CartManager;