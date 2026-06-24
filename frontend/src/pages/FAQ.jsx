import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      pregunta: "¿Cómo rastreo mi pedido?",
      respuesta: "Una vez que tu pago es confirmado y el pedido ha sido despachado, recibirás un correo electrónico con un enlace de seguimiento. También puedes ver el estado actual en la sección 'Mis Pedidos' dentro de tu perfil de Naturart Foods."
    },
    {
      pregunta: "¿Qué métodos de pago aceptan?",
      respuesta: "Aceptamos múltiples métodos de pago seguros. Puedes pagar utilizando tarjetas de crédito o débito, transferencias bancarias directas, o a través de billeteras móviles como DeUna."
    },
    {
      pregunta: "¿Sus productos son 100% orgánicos?",
      respuesta: "¡Sí! Trabajamos directamente con agricultores certificados y productores locales artesanales que no utilizan pesticidas ni químicos sintéticos en sus procesos de cultivo y elaboración."
    },
    {
      pregunta: "¿Hacen envíos internacionales?",
      respuesta: "Por el momento, y para garantizar la frescura absoluta de nuestros productos naturales, solo realizamos envíos a nivel nacional dentro de Ecuador."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-stone-800">
      <div className="flex flex-col items-center mb-10">
        <HelpCircle className="w-12 h-12 text-emerald-600 mb-4" />
        <h1 className="text-4xl font-extrabold text-emerald-800 text-center">Preguntas Frecuentes</h1>
      </div>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-stone-900 mb-2">{faq.pregunta}</h3>
            <p className="text-stone-600 leading-relaxed">{faq.respuesta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
