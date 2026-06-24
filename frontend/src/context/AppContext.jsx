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
  const [cart, setCart] = useState(() => {
    const localCart = localStorage.getItem('cart');
    return localCart ? JSON.parse(localCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    let success = false;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        const newQty = existingItem.cantidad + qty;
        if (newQty > product.stock) {
          showNotification(`No puedes agregar más de ${product.stock} unidades de este producto.`, 'error');
          return prevCart;
        }
        success = true;
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, cantidad: newQty } : item
        );
      }
      success = true;
      return [...prevCart, { ...product, cantidad: qty }];
    });
    if (success) {
      showNotification(`¡${product.titulo || product.nombre} agregado al carrito!`, 'success');
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, qty, maxStock) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    if (qty > maxStock) {
      showNotification(`Lo sentimos, el stock disponible es de ${maxStock} unidades.`, 'error');
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, cantidad: qty } : item
      )
    );
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

    const items = cart.map((item) => ({
      id: item.id,
      cantidad: item.cantidad
    }));

    const res = await fetch(`${API_URL}/pedidos/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items, direccionEnvio, cedula, nombreFacturacion, telefono })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.detalle || data.error || 'Error al procesar el pedido.');
    
    clearCart();
    return data;
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      <AuthContext.Provider value={{ user, token, authLoading, login, register, logout, favorites, toggleFavorite }}>
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, checkout }}>
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
