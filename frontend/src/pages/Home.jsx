import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useCart, useNotification } from '../context/AppContext';

export default function Home() {
  const [productosRecomendados, setProductosRecomendados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    showNotification(`¡Gracias, ${newsletterName}! Te has suscrito exitosamente a nuestro canal de noticias.`, 'success');
    setNewsletterName('');
    setNewsletterEmail('');
  };

  useEffect(() => {
    // Obtener los primeros 6 productos de la base de datos Oracle como recomendados
    const fetchRecomendados = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5000/api/productos?page=1&limit=6`);
        const responseData = await res.json();
        if (responseData.success) {
          setProductosRecomendados(responseData.data);
        }
      } catch (err) {
        console.error('Error al cargar productos recomendados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecomendados();
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen">
      
      {/* 1. SECCIÓN HERO IMPACTANTE CON GRADIENTE DIFUMINADO */}
      <section className="relative h-[80vh] md:h-[85vh] flex items-center overflow-hidden">
        {/* Imagen de fondo premium de Unsplash */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1600" 
            alt="Alimentación Saludable"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          {/* Overlay oscuro para legibilidad de texto */}
          <div className="absolute inset-0 bg-stone-950/40"></div>
          {/* Máscara de gradiente difuminado inferior para fundirse con bg-stone-50 */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-stone-50/35 to-transparent"></div>
        </div>

        {/* Contenido del Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center md:text-left"
        >
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-600/90 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full mb-6 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Productos 100% Sostenibles</span>
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-6">
              Alimentación Consciente <br />
              <span className="text-emerald-400">y Orgánica.</span>
            </h1>
            <p className="text-base sm:text-lg text-stone-200 mb-8 leading-relaxed font-medium">
              Llevamos los alimentos más puros, frescos y artesanales directamente desde el productor hasta tu mesa. Descubre una experiencia de nutrición honesta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/catalogo" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm border-none cursor-pointer"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. PRODUCTOS RECOMENDADOS (MÁXIMO 6 DESDE ORACLE DB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20 -mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-stone-100 rounded-3xl p-8 sm:p-10 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-stone-100 gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-850">Destacados de la Semana</h2>
              <p className="text-stone-500 text-sm mt-1">Una selección curada de nuestros mejores productos</p>
            </div>
            <Link 
              to="/catalogo" 
              className="text-emerald-600 hover:text-emerald-700 font-bold text-sm flex items-center space-x-1 transition-colors"
            >
              <span>Ver todos los productos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
              <p className="mt-3 text-stone-500 text-sm font-medium">Cargando destacados...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {productosRecomendados.map((producto) => (
                <ProductCard 
                  key={producto.id}
                  producto={producto}
                  onAddToCart={addToCart}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* 3. INFORMACIÓN DEL E-COMMERCE (MISIÓN Y VALORES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm flex flex-col items-center md:items-start"
          >
            <div className="bg-emerald-50 p-4 rounded-2xl mb-5">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-850 mb-2">Cultivo 100% Orgánico</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Trabajamos exclusivamente con agricultores locales que aplican métodos ecológicos libres de pesticidas químicos y aditivos artificiales.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm flex flex-col items-center md:items-start"
          >
            <div className="bg-emerald-50 p-4 rounded-2xl mb-5">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-850 mb-2">Calidad Garantizada</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Cada lote de producto es cuidadosamente inspeccionado para asegurar la frescura, pureza y el máximo valor nutricional en tu hogar.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm flex flex-col items-center md:items-start"
          >
            <div className="bg-emerald-50 p-4 rounded-2xl mb-5">
              <Heart className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-850 mb-2">Comercio Justo</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Apoyamos el bienestar de los pequeños productores asegurando precios justos y fomentando la economía sostenible comunitaria.
            </p>
          </motion.div>

        </div>

        {/* Declaración de Misión */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="bg-emerald-950 text-white rounded-3xl p-8 md:p-12 mt-12 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
        >
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
            <Leaf className="w-96 h-96" />
          </div>
          <div className="flex-1 relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black mb-4">Nuestra Misión</h2>
            <p className="text-emerald-100 leading-relaxed text-sm md:text-base font-medium">
              "En Naturart Foods, creemos que la alimentación es el pilar de una vida plena. Nos dedicamos a conectar a las personas con alimentos limpios, saludables e íntegros, respetando los ciclos de la naturaleza y promoviendo el consumo ético y transparente. Queremos inspirar un cambio hacia hábitos más saludables y amigables con el medio ambiente."
            </p>
          </div>
        </motion.div>
      </section>

      {/* 4. SECCIÓN DE SUSCRIPCIÓN AL CANAL DE NOTICIAS (NEWSLETTER) */}
      <section className="bg-emerald-50/20 border-t border-b border-stone-200/50 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-md border border-stone-200/30 max-w-xl mx-auto">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entérate de Todo</span>
            </span>
            <h2 className="text-2xl font-black text-stone-850 mb-2">Canal de Noticias y Novedades</h2>
            <p className="text-stone-500 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
              Únete a nuestra lista de correo para recibir recetas, consejos de sostenibilidad y descuentos exclusivos de Naturart Foods.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={newsletterName} 
                  onChange={(e) => setNewsletterName(e.target.value)} 
                  required
                  placeholder="Ej. Sofía Andrade"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={newsletterEmail} 
                  onChange={(e) => setNewsletterEmail(e.target.value)} 
                  required
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-xs cursor-pointer"
              >
                <span>Suscribirme al canal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* Modal flotante de Detalles del Producto */}
      {selectedProduct && (
        <ProductDetailsModal 
          producto={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

    </div>
  );
}
