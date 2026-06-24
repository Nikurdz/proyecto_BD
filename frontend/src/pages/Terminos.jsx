import React from 'react';

export default function Terminos() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-stone-800">
      <h1 className="text-4xl font-extrabold text-emerald-800 mb-8 text-center">Términos y Condiciones</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">1. Aceptación de los Términos</h2>
          <p className="text-stone-600 leading-relaxed">
            Al acceder y utilizar el sitio web de Naturart Foods, aceptas estar sujeto a estos Términos y Condiciones de uso, todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, tienes prohibido usar o acceder a este sitio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">2. Calidad de los Productos</h2>
          <p className="text-stone-600 leading-relaxed">
            Hacemos nuestro mejor esfuerzo para mostrar con la mayor precisión posible las características de nuestros productos. Al tratarse de alimentos orgánicos y artesanales, pueden existir ligeras variaciones en color, tamaño y presentación, lo cual es prueba de su origen natural y no constituye un defecto.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">3. Política de Reembolsos y Devoluciones</h2>
          <p className="text-stone-600 leading-relaxed">
            Debido a la naturaleza perecedera de nuestros productos, las devoluciones solo son aceptadas si el producto llega en mal estado o si se ha enviado el ítem incorrecto. Tienes un plazo máximo de 24 horas tras la recepción del pedido para notificar cualquier incidencia con fotografías de respaldo a nuestro correo de soporte. Una vez verificado, procederemos con el reembolso o reemplazo inmediato.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-3">4. Propiedad Intelectual</h2>
          <p className="text-stone-600 leading-relaxed">
            Todo el contenido incluido en este sitio web (textos, gráficos, logotipos, imágenes, audios) es propiedad de Naturart Foods o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual e industrial.
          </p>
        </section>

      </div>
    </div>
  );
}
