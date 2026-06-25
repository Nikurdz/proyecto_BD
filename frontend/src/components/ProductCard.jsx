import React from 'react';
import { Star, Heart } from 'lucide-react';
import { useAuth } from '../context/AppContext';

export default function ProductCard({ producto, onAddToCart, onViewDetails }) {
  const { favorites = [], toggleFavorite } = useAuth();

  const extractoDesc = producto.descripcion && producto.descripcion.length > 90
    ? producto.descripcion.substring(0, 90) + '...'
    : producto.descripcion;

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
    <div className="bg-white border border-stone-150 rounded-3xl hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-4.5 group relative">
      
      {/* Contenedor de Imagen 1:1 con Bordes Modernos y Zoom */}
      <div 
        onClick={() => onViewDetails(producto)}
        className="aspect-square w-full bg-stone-50 hover:bg-stone-100/50 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-100 p-4 cursor-pointer relative transition-colors"
      >
        <img 
          src={producto.imagen_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600'} 
          alt={producto.titulo}
          className="max-h-full max-w-full object-contain group-hover:scale-106 transition-transform duration-500 rounded-lg"
          loading="lazy"
          decoding="async"
        />
        
        {/* Badges apilados a la izquierda */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {esNuevo && (
            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
              Nuevo
            </span>
          )}
          {producto.descuentoPorcentaje > 0 && (
            <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
              {producto.descuentoPorcentaje}% DTO
            </span>
          )}
        </div>

        {/* Botón de favoritos con forma de corazón */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evitar abrir el modal de detalles
            toggleFavorite(producto);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 backdrop-blur-xs shadow-xs hover:bg-white text-stone-650 hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-200 z-10 cursor-pointer border-none flex items-center justify-center"
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-600'
            }`} 
          />
        </button>
      </div>

      {/* Info del Producto */}
      <div className="flex-1 flex flex-col justify-between pt-3">
        <div>
          {/* Categoría Tag */}
          <span className="text-[10px] uppercase font-bold text-emerald-650 tracking-wider">
            {producto.categoria}
          </span>
          
          {/* Título (Clic activa detalles) */}
          <h4 
            onClick={() => onViewDetails(producto)}
            className="text-sm font-bold text-stone-850 line-clamp-2 mt-1 hover:text-emerald-600 cursor-pointer transition-colors leading-tight"
          >
            {producto.titulo}
          </h4>

          {/* Calificación estética de estrellas */}
          <div className="flex items-center space-x-0.5 mt-1.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
            ))}
            <span className="text-[10px] text-stone-450 font-semibold ml-1.5">(42 opiniones)</span>
          </div>

          {/* Extracto descriptivo */}
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {extractoDesc}
          </p>
        </div>

        {/* Precio y Botón de Acción */}
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-3">
            {producto.precioOriginal && (
              <span className="text-xs text-stone-400 line-through">
                ${producto.precioOriginal.toFixed(2)}
              </span>
            )}
            <div className="flex items-baseline space-x-0.5">
              <span className="text-xs font-bold text-stone-850 align-super">$</span>
              <span className="text-2xl font-extrabold text-stone-850 tracking-tight">
                {parteEntera}
              </span>
              <span className="text-xs font-bold text-stone-850">
                {parteDecimal}
              </span>
            </div>
          </div>

          <button 
            onClick={() => onAddToCart({
              id: producto.id,
              nombre: producto.titulo,
              precio: producto.precio,
              stock: producto.stock
            })}
            disabled={producto.stock <= 0}
            className={`w-full font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all text-center border-none ${producto.stock > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow cursor-pointer' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
          >
            {producto.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
}
