import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Blog() {
  const articulos = [
    {
      id: 1,
      titulo: 'Los beneficios del Té Matcha en tu rutina diaria',
      fecha: '15 de Junio, 2026',
      resumen: 'Descubre por qué esta bebida milenaria está revolucionando el mundo del bienestar y cómo prepararla correctamente.'
    },
    {
      id: 2,
      titulo: '¿Por qué elegir productos orgánicos?',
      fecha: '2 de Junio, 2026',
      resumen: 'Más allá de la moda, los alimentos orgánicos ofrecen beneficios reales para tu cuerpo y el medio ambiente. Te explicamos los motivos.'
    },
    {
      id: 3,
      titulo: 'Receta: Desayuno energético con Avena Integral',
      fecha: '20 de Mayo, 2026',
      resumen: 'Aprende a preparar un tazón de avena lleno de nutrientes que te mantendrá activo durante toda la mañana.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 text-stone-800">
      <div className="flex flex-col items-center mb-10">
        <BookOpen className="w-12 h-12 text-emerald-600 mb-4" />
        <h1 className="text-4xl font-extrabold text-emerald-800 text-center">Blog de Salud</h1>
        <p className="text-stone-500 mt-4 text-center max-w-xl">Artículos, consejos y recetas para llevar una vida más consciente y saludable con Naturart Foods.</p>
      </div>
      
      <div className="space-y-6">
        {articulos.map((art) => (
          <div key={art.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">{art.fecha}</p>
            <h3 className="text-xl font-bold text-stone-900 mb-2 hover:text-emerald-700 transition-colors">{art.titulo}</h3>
            <p className="text-stone-600 leading-relaxed">{art.resumen}</p>
            <div className="mt-4">
              <span className="text-sm font-semibold text-emerald-600 hover:underline">Leer más &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
