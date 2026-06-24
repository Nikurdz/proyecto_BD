import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useAuth, useCart } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';

export default function Favoritos() {
  const { user, favorites } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Redirigir si no está logueado
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Heart className="w-16 h-16 text-stone-200 mb-6" />
        <h2 className="text-2xl font-black text-stone-850 mb-2">Inicia Sesión</h2>
        <p className="text-stone-500 mb-8 max-w-md">
          Para guardar y ver tus productos favoritos, necesitas iniciar sesión en tu cuenta.
        </p>
        <button 
          onClick={() => navigate('/perfil')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-none"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      
      <div className="flex items-center space-x-3 mb-10 border-b border-stone-150 pb-5">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-black text-stone-850 tracking-tight">Mis Favoritos</h1>
      </div>

      {favorites.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-stone-50 rounded-3xl p-12 text-center border border-stone-200 flex flex-col items-center justify-center max-w-3xl mx-auto mt-12"
        >
          <div className="bg-white p-6 rounded-full shadow-sm mb-6 inline-block">
            <Heart className="w-12 h-12 text-stone-300" />
          </div>
          <h2 className="text-2xl font-black text-stone-800 mb-3">Aún no tienes productos favoritos</h2>
          <p className="text-stone-500 mb-8 max-w-md">
            Explora nuestro catálogo y marca con un corazón los alimentos orgánicos que más te gusten para guardarlos aquí.
          </p>
          <Link 
            to="/catalogo"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-none"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {favorites.map((producto) => (
              <motion.div
                key={producto.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard 
                  producto={producto}
                  onAddToCart={addToCart}
                  onViewDetails={setSelectedProduct}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {selectedProduct && (
        <ProductDetailsModal 
          producto={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
