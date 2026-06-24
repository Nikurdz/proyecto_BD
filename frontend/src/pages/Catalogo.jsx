import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/AppContext';
import { Filter, ChevronLeft, ChevronRight, RefreshCw, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const [categoriasList, setCategoriasList] = useState([]);

  // Cargar categorías dinámicamente desde el backend
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5000/api/productos/categorias`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCategoriasList(data.data);
          }
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };
    fetchCategorias();
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extraemos filtros directamente de la URL
  const categoria = searchParams.get('categoria') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const descuento = searchParams.get('descuento') || '';
  
  // Estados para los inputs de rango de precio manuales
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);
  
  // Estado local para controlar la página
  const [page, setPage] = useState(1);
  const limit = 8; // Mostraremos 8 productos por página

  const { addToCart } = useCart();

  // Resetear a página 1 si cambia cualquier filtro
  useEffect(() => {
    setPage(1);
  }, [categoria, search, minPrice, maxPrice, descuento]);

  // Sincronizar inputs si cambian los parámetros de la URL externamente
  useEffect(() => {
    setMinInput(minPrice);
    setMaxInput(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `http://${window.location.hostname}:5000/api/productos?page=${page}&limit=${limit}`;
        if (categoria) url += `&categoria=${encodeURIComponent(categoria)}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (minPrice) url += `&minPrice=${encodeURIComponent(minPrice)}`;
        if (maxPrice) url += `&maxPrice=${encodeURIComponent(maxPrice)}`;
        if (descuento) url += `&descuento=${encodeURIComponent(descuento)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        
        const responseData = await res.json();
        
        if (responseData.success) {
          setProductos(responseData.data);
          setPaginationInfo(responseData.pagination);
        } else {
          throw new Error(responseData.error || 'Error desconocido del servidor');
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
        setError(`No se pudo obtener el catálogo: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [page, categoria, search, minPrice, maxPrice, descuento]);

  const handleCategorySelect = (selectedCat) => {
    const params = new URLSearchParams(searchParams);
    if (selectedCat) {
      params.set('categoria', selectedCat);
    } else {
      params.delete('categoria');
    }
    setSearchParams(params);
  };

  const handlePriceRangeSelect = (min, max) => {
    const params = new URLSearchParams(searchParams);
    if (min) {
      params.set('minPrice', min);
    } else {
      params.delete('minPrice');
    }
    
    if (max) {
      params.set('maxPrice', max);
    } else {
      params.delete('maxPrice');
    }
    setSearchParams(params);
  };

  const handleManualPriceApply = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (minInput) {
      params.set('minPrice', minInput);
    } else {
      params.delete('minPrice');
    }
    if (maxInput) {
      params.set('maxPrice', maxInput);
    } else {
      params.delete('maxPrice');
    }
    setSearchParams(params);
  };

  const handleDiscountToggle = (e) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.checked) {
      params.set('descuento', 'true');
    } else {
      params.delete('descuento');
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Contenedor Principal en Dos Columnas (Sidebar + Grid) */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Barra Lateral de Filtros */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm self-start space-y-6">
          <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
            <Filter className="w-5 h-5 text-stone-700" />
            <h2 className="text-base font-bold text-stone-850">Filtrar Productos</h2>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">Categoría</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`text-sm text-left block w-full hover:text-emerald-600 transition-colors ${
                    categoria === '' ? 'text-emerald-600 font-bold' : 'text-stone-600 font-medium'
                  }`}
                >
                  Todas las Categorías
                </button>
              </li>
              {categoriasList.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategorySelect(cat.nombre)}
                    className={`text-sm text-left block w-full hover:text-emerald-600 transition-colors ${
                      categoria === cat.nombre ? 'text-emerald-600 font-bold' : 'text-stone-600 font-medium'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Filtro por Precio (Rangos y Custom) */}
          <div className="border-t border-stone-100 pt-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">Filtrar por Precio</h3>
            <ul className="space-y-2 mb-4">
              <li>
                <button
                  onClick={() => handlePriceRangeSelect('', '')}
                  className={`text-sm text-left block w-full hover:text-emerald-600 transition-colors ${
                    !minPrice && !maxPrice ? 'text-emerald-600 font-bold' : 'text-stone-600 font-medium'
                  }`}
                >
                  Cualquier Precio
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePriceRangeSelect('', '10')}
                  className={`text-sm text-left block w-full hover:text-emerald-600 transition-colors ${
                    !minPrice && maxPrice === '10' ? 'text-emerald-600 font-bold' : 'text-stone-600 font-medium'
                  }`}
                >
                  Hasta $10
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePriceRangeSelect('10', '20')}
                  className={`text-sm text-left block w-full hover:text-emerald-600 transition-colors ${
                    minPrice === '10' && maxPrice === '20' ? 'text-emerald-600 font-bold' : 'text-stone-600 font-medium'
                  }`}
                >
                  $10 a $20
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePriceRangeSelect('20', '')}
                  className={`text-sm text-left block w-full hover:text-emerald-600 transition-colors ${
                    minPrice === '20' && !maxPrice ? 'text-emerald-600 font-bold' : 'text-stone-600 font-medium'
                  }`}
                >
                  $20 a más
                </button>
              </li>
            </ul>

            {/* Inputs manuales de Min y Max */}
            <form onSubmit={handleManualPriceApply} className="space-y-2.5">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-stone-400 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Mín."
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 rounded-xl text-xs border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-stone-400 text-xs">a</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-stone-400 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Máx."
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    className="w-full pl-6 pr-2 py-2 rounded-xl text-xs border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-750 text-xs font-bold py-2 rounded-xl border border-stone-200 transition-colors cursor-pointer text-center"
              >
                Aplicar Rango
              </button>
            </form>
          </div>

          {/* Filtro por Descuentos */}
          <div className="border-t border-stone-100 pt-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">Promociones</h3>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={descuento === 'true'}
                onChange={handleDiscountToggle}
                className="rounded text-emerald-600 focus:ring-emerald-555 h-4.5 w-4.5 cursor-pointer accent-emerald-600"
              />
              <span className="text-sm text-stone-700 font-semibold hover:text-stone-900">
                Solo en Descuento
              </span>
            </label>
          </div>

          {/* Filtros activos (Limpiar) */}
          {(categoria || search || minPrice || maxPrice || descuento) && (
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  setSearchParams({});
                  setMinInput('');
                  setMaxInput('');
                }}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-2 px-3 rounded-xl transition-colors text-center cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </aside>

        {/* Sección de Catálogo / Resultados */}
        <div className="flex-1">
          {/* Cabecera de resultados */}
          <div className="bg-white border border-stone-200 rounded-3xl p-4 mb-6 flex items-center justify-between shadow-sm">
            <div className="text-sm text-stone-600">
              {search && (
                <span>
                  Resultados para <strong className="text-stone-850">"{search}"</strong>
                </span>
              )}
              {categoria && (
                <span> en <strong className="text-stone-850">"{categoria}"</strong></span>
              )}
              {(minPrice || maxPrice) && (
                <span> (Rango: ${minPrice || '0'} - ${maxPrice || '∞'})</span>
              )}
              {descuento === 'true' && (
                <span className="text-red-600 font-bold"> [Con Descuento]</span>
              )}
              {!search && !categoria && !minPrice && !maxPrice && descuento !== 'true' && (
                <span>Mostrando todos los productos disponibles</span>
              )}
            </div>
            
            <div className="text-xs text-stone-500 font-semibold">
              {paginationInfo.total} resultados
            </div>
          </div>

          {/* Estado de carga */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-500 font-medium">Buscando productos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
              <p className="font-bold">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer border-none">
                Reintentar
              </button>
            </div>
          ) : productos.length === 0 ? (
            <div className="bg-stone-50 py-16 px-4 text-center rounded-2xl border border-stone-200">
              <p className="text-stone-600 font-medium text-lg">No encontramos productos con estos filtros.</p>
              <button onClick={() => { setSearchParams(new URLSearchParams()); }} className="mt-4 text-emerald-600 font-bold hover:underline bg-transparent border-none cursor-pointer">
                Limpiar todos los filtros
              </button>
            </div>
          ) : (
            <>
              {/* Grid de Productos modulares */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {productos.map((producto) => (
                  <ProductCard 
                    key={producto.id}
                    producto={producto}
                    onAddToCart={addToCart}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </motion.div>

              {/* Botones de Paginación Sutiles y Profesionales */}
              <div className="mt-12 flex items-center justify-center space-x-2 border-t border-stone-150 pt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${
                    page === 1
                      ? 'bg-stone-50 border-stone-200 text-stone-350 cursor-not-allowed'
                      : 'bg-white border-stone-250 hover:bg-stone-50 text-emerald-655 cursor-pointer'
                  }`}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Páginas individuales numeradas */}
                {[...Array(paginationInfo.totalPages)].map((_, index) => {
                  const pNum = index + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors cursor-pointer ${
                        page === pNum
                          ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold shadow-sm'
                          : 'bg-white border-stone-250 hover:bg-stone-50 text-stone-750'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === paginationInfo.totalPages}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${
                    page === paginationInfo.totalPages
                      ? 'bg-stone-50 border-stone-200 text-stone-350 cursor-not-allowed'
                      : 'bg-white border-stone-250 hover:bg-stone-50 text-emerald-655 cursor-pointer'
                  }`}
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

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
