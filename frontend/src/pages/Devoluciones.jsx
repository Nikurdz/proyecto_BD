import React from 'react';
import { RefreshCcw } from 'lucide-react';

export default function Devoluciones() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10 text-stone-800">
      <div className="flex flex-col items-center mb-8">
        <RefreshCcw className="w-12 h-12 text-emerald-600 mb-4" />
        <h1 className="text-4xl font-extrabold text-emerald-800 text-center">Centro de Devoluciones</h1>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Nuestra Garantía de Calidad</h2>
          <p className="text-stone-600 leading-relaxed">
            En Naturart Foods garantizamos la frescura y calidad de cada producto que sale de nuestras instalaciones. Sin embargo, sabemos que pueden ocurrir eventualidades en el transporte. Si tu producto llega en mal estado, nos hacemos responsables.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Condiciones para Solicitar Devolución</h2>
          <ul className="list-disc pl-5 text-stone-600 space-y-2">
            <li>El reclamo debe realizarse dentro de las <strong>24 horas</strong> posteriores a la recepción del pedido.</li>
            <li>El producto debe haber llegado dañado, caducado, o no corresponder a lo que pediste.</li>
            <li>Debido a que manejamos productos alimenticios perecederos, <strong>no aceptamos devoluciones por cambios de opinión</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">¿Cómo proceder?</h2>
          <p className="text-stone-600 leading-relaxed">
            Envía un correo electrónico a <strong>soporte@naturartfoods.com</strong> con tu número de pedido y fotografías claras del inconveniente. Nuestro equipo analizará tu caso en un lapso no mayor a 12 horas hábiles y, de aplicar, procederemos con un reembolso a tu método de pago original o enviaremos un producto de reemplazo en tu siguiente entrega, según prefieras.
          </p>
        </section>

      </div>
    </div>
  );
}
