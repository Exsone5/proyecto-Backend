// Conectar con Socket.io
const socket = io();

// Referencia al formulario y contenedor de productos
const addProductForm = document.getElementById('addProductForm');
const productsContainer = document.getElementById('productsContainer');

// Evento de conexión
socket.on('connect', () => {
  console.log('✅ Conectado al servidor WebSocket');
});

// Evento de desconexión
socket.on('disconnect', () => {
  console.log('❌ Desconectado del servidor WebSocket');
});

// Escuchar actualizaciones de productos desde el servidor
socket.on('updateProducts', (products) => {
  console.log('🔄 Productos actualizados:', products);
  renderProducts(products);
});

// Manejar el envío del formulario
addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(addProductForm);
  const productData = {
    title: formData.get('title'),
    description: formData.get('description'),
    code: formData.get('code'),
    price: parseFloat(formData.get('price')),
    stock: parseInt(formData.get('stock')),
    category: formData.get('category'),
    status: formData.get('status') === 'true'
  };

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const result = await response.json();

    if (result.status === 'success') {
      console.log('✅ Producto creado:', result.payload);
      addProductForm.reset();
      showNotification('Producto agregado exitosamente', 'success');
    } else {
      console.error('❌ Error:', result.message);
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    showNotification('Error al crear el producto', 'error');
  }
});

// Manejar la eliminación de productos
productsContainer.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const productId = e.target.dataset.id;
    
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.status === 'success') {
          console.log('✅ Producto eliminado');
          showNotification('Producto eliminado exitosamente', 'success');
        } else {
          console.error('❌ Error:', result.message);
          showNotification(result.message, 'error');
        }
      } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        showNotification('Error al eliminar el producto', 'error');
      }
    }
  }
});

// Función para renderizar los productos
function renderProducts(products) {
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty-state">
        <h2>📭 No hay productos</h2>
        <p>Agrega tu primer producto usando el formulario de arriba.</p>
      </div>
    `;
    return;
  }

  const productsHTML = products.map(product => {
    const stockClass = product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : '';
    
    return `
      <div class="product-card" data-id="${product.id}">
        <h3>${product.title}</h3>
        <p class="product-code">Código: ${product.code}</p>
        <p>${product.description}</p>
        <p class="product-price">$${product.price}</p>
        <p>
          <span class="product-stock ${stockClass}">
            Stock: ${product.stock} unidades
          </span>
        </p>
        <span class="product-category">${product.category}</span>
        ${product.status 
          ? '<p style="color: #28a745; margin-top: 10px;">✅ Disponible</p>' 
          : '<p style="color: #dc3545; margin-top: 10px;">❌ No disponible</p>'}
        <button class="delete-btn" data-id="${product.id}" 
                style="margin-top: 15px; width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
          🗑️ Eliminar
        </button>
      </div>
    `;
  }).join('');

  productsContainer.innerHTML = `<div class="products-grid">${productsHTML}</div>`;
}

// Función para mostrar notificaciones
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Agregar animaciones CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
