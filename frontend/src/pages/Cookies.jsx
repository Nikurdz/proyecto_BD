import React from 'react';

export default function Cookies() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10 text-stone-800">
      <h1 className="text-4xl font-extrabold text-emerald-800 mb-8 text-center">Política de Cookies</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">¿Qué son las Cookies?</h2>
          <p className="text-stone-600 leading-relaxed">
            Las cookies son pequeños archivos de texto que los sitios web que visitas colocan en tu ordenador o dispositivo móvil. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Cómo utilizamos las Cookies</h2>
          <p className="text-stone-600 leading-relaxed mb-3">En Naturart Foods, utilizamos cookies estrictamente necesarias y funcionales para:</p>
          <ul className="list-disc pl-5 text-stone-600 space-y-2">
            <li><strong>Autenticación:</strong> Mantener tu sesión activa para que no tengas que iniciar sesión cada vez que cambias de página.</li>
            <li><strong>Carrito de Compras:</strong> Recordar los productos orgánicos que has agregado a tu carrito mientras sigues explorando nuestro catálogo.</li>
            <li><strong>Preferencias:</strong> Guardar tus filtros de búsqueda (ej. categorías seleccionadas) para brindarte una navegación fluida.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Gestión de Cookies</h2>
          <p className="text-stone-600 leading-relaxed">
            Ten en cuenta que al usar Naturart Foods, asumes la aceptación de estas cookies funcionales básicas requeridas para que la tienda opere. Puedes configurar tu navegador para bloquear o alertarte sobre estas cookies, pero algunas partes del sitio (como el proceso de pago o el carrito) no funcionarán correctamente.
          </p>
        </section>

      </div>
    </div>
  );
}
