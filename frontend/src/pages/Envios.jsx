import React from 'react';
import { Truck, MapPin, Clock } from 'lucide-react';

export default function Envios() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-stone-800">
      <h1 className="text-4xl font-extrabold text-emerald-800 mb-8 text-center">Política de Envíos</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8">
        
        <div className="flex items-start space-x-4">
          <Clock className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Tiempos de Entrega</h2>
            <p className="text-stone-600 leading-relaxed">
              Sabemos que la frescura es primordial. Todos los pedidos confirmados antes de las 2:00 PM son procesados el mismo día. Nuestro tiempo de entrega estándar es de <strong>24 a 48 horas laborables</strong> para zonas urbanas, asegurando que tus productos naturales lleguen en óptimas condiciones.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <MapPin className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Zonas de Cobertura</h2>
            <p className="text-stone-600 leading-relaxed">
              Actualmente contamos con cobertura directa en las principales ciudades del país y sus valles aledaños. Para zonas rurales o provincias lejanas, el tiempo de tránsito puede extenderse hasta 72 horas utilizando nuestros curriers aliados con cadena de frío.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <Truck className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Costos de Envío</h2>
            <p className="text-stone-600 leading-relaxed">
              Disfruta de <strong>Envío Gratis</strong> en todas tus compras superiores a $30. Para pedidos menores a este valor, aplicamos una tarifa plana de $3.50 para cubrir los gastos de logística especializada que requieren nuestros alimentos orgánicos.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
