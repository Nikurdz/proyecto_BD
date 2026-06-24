import React from 'react';
import { X, Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart, useAuth } from '../context/AppContext';

export default function ProductDetailsModal({ producto, onClose }) {
  if (!producto) return null;
  const { addToCart } = useCart();
  const { favorites = [], toggleFavorite } = useAuth();

  const parteEntera = Math.floor(producto.precio);
  const parteDecimal = ((producto.precio % 1) * 100).toFixed(0).padStart(2, '0');

  // Lógica de producto nuevo (fecha_creacion <= 2 días)
  const esNuevo = (() => {
    if (!producto.fecha_creacion) return false;
    const creacion = new Date(producto.fecha_creacion);
    const ahora = new Date();
    const diffInMs = ahora.getTime() - creacion.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays >= 0 && diffInDays <= 2;
  })();

  const isFavorite = favorites.some((fav) => fav.id === producto.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-backdrop-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh] text-stone-150 animate-modal-in">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white p-2.5 rounded-full transition-colors z-20 cursor-pointer border-none flex items-center justify-center"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagen del Producto (Fondo Oscuro Suave) */}
        <div className="md:w-1/2 bg-stone-950/30 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-stone-800 min-h-[300px] relative">
          
          {/* Botón de favorito en la esquina de la imagen */}
          <button
            onClick={() => toggleFavorite(producto)}
            className="absolute top-4 left-4 p-2.5 rounded-full bg-stone-850/80 hover:bg-stone-800 text-stone-300 hover:text-red-500 transition-all duration-200 cursor-pointer border-none flex items-center justify-center"
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-300'}`} />
          </button>

          <img 
            src={producto.imagen_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600'} 
            alt={producto.titulo}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-md"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Detalles del Producto (Fondo Oscuro Premium) */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto bg-stone-900">
          <div>
            {/* Categoría y Badges */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] uppercase font-black text-emerald-450 tracking-widest">
                {producto.categoria}
              </span>
              <div className="flex items-center gap-1.5">
                {esNuevo && (
                  <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                    Nuevo
                  </span>
                )}
                {producto.descuentoPorcentaje > 0 && (
                  <span className="bg-red-650 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                    {producto.descuentoPorcentaje}% DTO
                  </span>
                )}
              </div>
            </div>

            {/* Título */}
            <h2 className="text-xl md:text-2xl font-black text-white mt-3 mb-2 leading-tight tracking-tight">
              {producto.titulo}
            </h2>

            {/* Calificaciones */}
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              ))}
              <span className="text-xs text-stone-450 font-bold ml-2">(4.9 estrellas de 42 valoraciones)</span>
            </div>

            {/* Línea divisoria */}
            <hr className="border-stone-800 my-4" />

            {/* Precio con Descuento */}
            <div className="flex items-baseline gap-3.5 mb-4">
              <div className="flex items-baseline space-x-0.5">
                <span className="text-sm font-bold text-stone-400 align-super">$</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {parteEntera}
                </span>
                <span className="text-sm font-bold text-stone-400">
                  {parteDecimal}
                </span>
              </div>
              {producto.precioOriginal && (
                <span className="text-sm text-stone-500 line-through">
                  Reg. ${producto.precioOriginal.toFixed(2)}
                </span>
              )}
            </div>

            {/* Estado del Stock */}
            <p className="text-xs font-bold text-emerald-400 mb-5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-555 animate-ping"></span>
              ✓ Disponible en bodega ({producto.stock} unidades listas para envío)
            </p>

            {/* Descripción Detallada Completa */}
            <div className="mt-4">
              <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-2">Acerca de este artículo</h3>
              <p className="text-sm text-stone-400 leading-relaxed max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-800">
                {producto.descripcion}
              </p>
            </div>
          </div>

          {/* Botón de Agregar */}
          <div className="mt-8 pt-4 border-t border-stone-800">
            <button
              onClick={() => {
                addToCart({
                  id: producto.id,
                  nombre: producto.titulo,
                  precio: producto.precio,
                  stock: producto.stock
                });
                onClose();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-emerald-950/40 cursor-pointer border-none text-sm uppercase tracking-wider"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Agregar al carrito</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
