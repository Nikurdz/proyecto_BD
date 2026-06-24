import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AppContext';
import { Package, RefreshCw, ChevronRight, CheckCircle, Clock } from 'lucide-react';

export default function Pedidos() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchPedidos = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5000/api/pedidos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const responseData = await res.json();
        
        if (responseData.success) {
          setPedidos(responseData.data);
        } else {
          throw new Error(responseData.error || 'Error al obtener tus pedidos');
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="mt-4 text-stone-500 font-semibold">Cargando tu historial de compras...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center space-x-3 mb-8">
        <Package className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-extrabold text-stone-850">Mis Pedidos</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-650 p-4 rounded-2xl text-center text-sm mb-6">
          {error}
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center py-16 shadow-sm">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-700 font-bold text-lg mb-2">Aún no tienes pedidos registrados</p>
          <p className="text-stone-450 text-sm max-w-sm mx-auto mb-6">
            Realiza tu primera compra para ver el historial y el estado de tus despachos aquí.
          </p>
          <Link to="/catalogo" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer text-xs">
            Comenzar a Comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div 
              key={pedido.id} 
              className="bg-white border border-stone-150 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cabecera del pedido */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-stone-100 gap-3">
                <div>
                  <p className="text-xs text-stone-400 font-bold">NÚMERO DE PEDIDO</p>
                  <p className="text-sm font-extrabold text-stone-850">#{pedido.id}</p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-xs text-stone-400 font-bold">TOTAL FACTURADO</p>
                    <p className="text-sm font-extrabold text-emerald-700">${pedido.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 font-bold mb-0.5">ESTADO</p>
                    <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pedido.estado}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="mt-4 space-y-4">
                <p className="text-xs font-black uppercase tracking-wider text-stone-400">Artículos Comprados</p>
                {pedido.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-stone-750">{item.titulo}</span>
                      <span className="text-stone-450 text-xs">x{item.cantidad}</span>
                    </div>
                    <span className="font-extrabold text-stone-800">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
