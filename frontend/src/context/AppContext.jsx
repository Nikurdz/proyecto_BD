import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const CartContext = createContext();
const NotificationContext = createContext();

const API_URL = `http://${window.location.hostname}:5000/api`;

export function AppProvider({ children }) {
  // --- NOTIFICATION STATE ---
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // auto-hide after 3.5 seconds
    setTimeout(() => {
      setNotification((prev) => (prev && prev.message === message ? null : prev));
    }, 3500);
  };

  // --- AUTHENTICATION STATE ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authLoading, setAuthLoading] = useState(true);

  // --- FAVORITES STATE ---
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/perfil`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.usuario);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Error al verificar sesión:', err);
          logout();
        }
      }
      setAuthLoading(false);
    };
    verifyUser();
  }, [token]);

  // Sincronizar favoritos reactivamente cuando cambia el token o el usuario
  useEffect(() => {
    const fetchFavorites = async () => {
      if (token && user) {
        try {
          const res = await fetch(`${API_URL}/productos/favoritos`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setFavorites(data.data);
            }
          }
        } catch (err) {
          console.error('Error al obtener favoritos:', err);
        }
      } else {
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [token, user]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.usuario);
      showNotification(`¡Bienvenido de vuelta, ${data.usuario.nombre}!`, 'success');
      return data;
    } catch (err) {
      showNotification(err.message || 'Error al iniciar sesión', 'error');
      throw err;
    }
  };

  const register = async (nombre, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar usuario');
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.usuario);
      showNotification(`¡Registro exitoso! Bienvenido, ${nombre}.`, 'success');
      return data;
    } catch (err) {
      showNotification(err.message || 'Error al registrar usuario', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setFavorites([]);
    showNotification('Has cerrado sesión correctamente.', 'info');
  };

  const toggleFavorite = async (product) => {
    if (!token || !user) {
      showNotification('Inicia sesión para agregar a favoritos.', 'info');
      return false;
    }

    const isFavorite = favorites.some((fav) => fav.id === product.id);

    // Actualización optimista de la UI
    if (isFavorite) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== product.id));
    } else {
      setFavorites((prev) => [...prev, product]);
    }

    try {
      const url = `${API_URL}/productos/favoritos/${product.id}`;
      const method = isFavorite ? 'DELETE' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detalle || data.error || 'Error al actualizar favoritos.');
      }
      showNotification(
        isFavorite ? 'Eliminado de tus favoritos.' : 'Agregado a tus favoritos.',
        'success'
      );
      return true;
    } catch (err) {
      console.error('Error al alternar favorito:', err);
      showNotification(err.message || 'No se pudo actualizar favoritos.', 'error');
      // Revertir cambio optimista en caso de error
      if (isFavorite) {
        setFavorites((prev) => [...prev, product]);
      } else {
        setFavorites((prev) => prev.filter((fav) => fav.id !== product.id));
      }
      return false;
    }
  };


  // --- CART STATE ---
  const [cart, setCart] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const fetchCarrito = async () => {
    if (!token) {
      setCart([]);
      return;
    }
    setIsCartLoading(true);
    try {
      const res = await fetch(`${API_URL}/carrito`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCart(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error al obtener carrito:', err);
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrito();
  }, [token, user]);

  const addToCart = async (product, qty = 1) => {
    if (!token) {
      showNotification('Debes iniciar sesión para agregar al carrito', 'error');
      return;
    }
    
    const parsedQty = parseInt(qty, 10);
    const maxStock = parseInt(product.stock, 10);

    // Validar localmente stock maximo antes de enviar
    const existingItem = cart.find((item) => item.id === product.id);
    const newQty = existingItem ? parseInt(existingItem.cantidad, 10) + parsedQty : parsedQty;
    
    if (newQty > maxStock) {
       showNotification(`No puedes agregar más de ${maxStock} unidades.`, 'error');
       return;
    }

    // Actualización optimista de UI
    const previousCart = [...cart];
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, cantidad: newQty } : item));
    } else {
      setCart([...cart, { ...product, cantidad: parsedQty }]);
    }

    try {
      const res = await fetch(`${API_URL}/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productoId: product.id, cantidad: newQty })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detalle || data.error || 'Error al agregar al carrito');
      }
      showNotification(`¡${product.titulo || product.nombre} agregado al carrito!`, 'success');
      // Recargar desde DB para sincronizar exactamente con Oracle
      fetchCarrito();
    } catch (err) {
      console.error('Error addToCart:', err);
      showNotification(err.message, 'error');
      setCart(previousCart); // Rollback
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return;
    const previousCart = [...cart];
    setCart(cart.filter((item) => item.id !== productId));
    
    try {
      const res = await fetch(`${API_URL}/carrito/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detalle || data.error || 'Error al eliminar');
      fetchCarrito();
    } catch (err) {
      showNotification(err.message, 'error');
      setCart(previousCart); // Rollback
    }
  };

  const updateQuantity = async (productId, qty, maxStock) => {
    const parsedQty = parseInt(qty, 10);
    const parsedMaxStock = parseInt(maxStock, 10);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      removeFromCart(productId);
      return;
    }
    if (parsedQty > parsedMaxStock) {
      showNotification(`El stock máximo es de ${parsedMaxStock} unidades.`, 'error');
      return;
    }
    
    // Guardar el estado anterior para posible rollback
    const previousCart = [...cart];
    // Actualización optimista
    setCart(cart.map(item => item.id === productId ? { ...item, cantidad: parsedQty } : item));

    try {
      const res = await fetch(`${API_URL}/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productoId: productId, cantidad: parsedQty })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detalle || data.error || 'Error al actualizar cantidad');
      fetchCarrito();
    } catch (err) {
      showNotification(err.message, 'error');
      setCart(previousCart); // Rollback
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const checkout = async ({ direccionEnvio = '', cedula = '', nombreFacturacion = '', telefono = '' } = {}) => {
    if (!token) throw new Error('Debes iniciar sesión para realizar el checkout.');
    if (cart.length === 0) throw new Error('Tu carrito está vacío.');

    // NO enviamos los productos (Thick Database)
    const res = await fetch(`${API_URL}/pedidos/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ direccionEnvio, cedula, nombreFacturacion, telefono })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.detalle || data.error || 'Error al procesar el pedido en Oracle.');
    
    clearCart();
    fetchCarrito();
    return data;
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      <AuthContext.Provider value={{ user, token, authLoading, login, register, logout, favorites, toggleFavorite }}>
        <CartContext.Provider value={{ cart, isCartLoading, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, checkout, fetchCarrito }}>
          {children}
        </CartContext.Provider>
      </AuthContext.Provider>
    </NotificationContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useCart() {
  return useContext(CartContext);
}

export function useNotification() {
  return useContext(NotificationContext);
}
