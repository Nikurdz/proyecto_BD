import React from 'react';

export default function Privacidad() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10 text-stone-800">
      <h1 className="text-4xl font-extrabold text-emerald-800 mb-8 text-center">Aviso de Privacidad</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">1. Recopilación de Datos</h2>
          <p className="text-stone-600 leading-relaxed">
            En Naturart Foods, la privacidad de nuestros clientes es de suma importancia. Recopilamos información personal (como nombre, correo electrónico, dirección de envío y teléfono) únicamente cuando nos la proporcionas voluntariamente al crear una cuenta o realizar una compra.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">2. Uso de la Información</h2>
          <p className="text-stone-600 leading-relaxed">
            Los datos que nos confías son utilizados exclusivamente para:
          </p>
          <ul className="list-disc pl-5 text-stone-600 space-y-2 mt-2">
            <li>Procesar, preparar y entregar tus pedidos de forma precisa.</li>
            <li>Enviarte actualizaciones sobre el estado de tus compras.</li>
            <li>Mejorar tu experiencia de usuario en nuestra plataforma web.</li>
            <li>Contactarte en caso de inconvenientes con la logística.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">3. Protección y Seguridad</h2>
          <p className="text-stone-600 leading-relaxed">
            Hemos implementado estrictas medidas de seguridad digitales (incluyendo encriptación de contraseñas mediante <em>bcrypt</em> y tokens seguros JWT) para proteger tu información contra acceso, alteración o destrucción no autorizados. <strong>Nunca</strong> venderemos ni alquilaremos tu información a terceros.
          </p>
        </section>

      </div>
    </div>
  );
}
