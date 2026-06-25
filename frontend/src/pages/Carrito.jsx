import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../context/AppContext';
import { Trash2, Plus, Minus, CheckCircle } from 'lucide-react';

export default function Carrito() {
  const { cart, isCartLoading, removeFromCart, updateQuantity, getCartTotal, checkout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pedidoIdCreated, setPedidoIdCreated] = useState(null);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const getProductImage = (nombre) => {
    if (!nombre) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400';
    const n = String(nombre).toLowerCase();
    if (n.includes('miel')) return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400';
    if (n.includes('granola')) return 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&q=80&w=400';
    if (n.includes('café') || n.includes('cafe')) return 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=400';
    if (n.includes('té') || n.includes('matcha')) return 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=400';
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400';
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-lg flex flex-col items-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mb-6 animate-bounce" />
          <h2 className="text-2xl font-extrabold text-stone-850 mb-2">¡Pedido Realizado!</h2>
          <p className="text-stone-500 mb-6 text-sm leading-relaxed">
            Tu pedido <strong className="text-emerald-700 font-bold">#{pedidoIdCreated}</strong> ha sido registrado exitosamente en la base de datos Oracle. ¡Gracias por comprar en Naturart Foods!
          </p>
          <Link to="/catalogo" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 w-full text-center">
            Seguir Comprando
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-stone-850 mb-8">Tu Carrito de Compras</h1>
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm text-center py-16">
          {isCartLoading ? (
             <div className="flex flex-col items-center justify-center">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
               <p className="text-stone-500 text-sm">Cargando carrito desde Oracle...</p>
             </div>
          ) : (
            <>
              <p className="text-stone-500 text-lg mb-6">Tu carrito está vacío en este momento.</p>
              <Link to="/catalogo" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200">
                Explorar Productos
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-stone-850 mb-8">Tu Carrito de Compras</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={item.imagen_url || getProductImage(item.nombre)} 
                  alt={item.nombre || 'Producto'}
                  className="w-16 h-16 object-cover rounded-xl"
                />
                <div>
                  <h3 className="font-bold text-stone-850">{item.nombre || 'Producto sin nombre'}</h3>
                  <p className="text-sm text-stone-500">${(item.precio || 0).toFixed(2)} c/u</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 border border-stone-200 rounded-xl p-1 bg-stone-50">
                  <button 
                    onClick={() => updateQuantity(item.id, item.cantidad - 1, item.stock)}
                    className="p-1 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-stone-800 px-2 text-sm">{item.cantidad}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.cantidad + 1, item.stock)}
                    className="p-1 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen de compra */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-stone-850 mb-4">Resumen del Pedido</h2>
          
          <div className="space-y-3 border-b border-stone-100 pb-4 mb-4">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Productos ({cart.reduce((t, i) => t + i.cantidad, 0)})</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>Envío</span>
              <span className="text-emerald-600 font-medium">Gratis</span>
            </div>
          </div>

          <div className="flex justify-between font-extrabold text-stone-850 text-lg mb-6">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer text-center text-sm"
          >
            {!user 
              ? 'Iniciar Sesión para Pagar' 
              : 'Proceder al Pago'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
