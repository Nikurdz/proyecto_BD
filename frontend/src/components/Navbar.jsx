import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Leaf, User, LogOut, Search, Menu, ChevronDown, Heart } from 'lucide-react';
import { useAuth, useCart } from '../context/AppContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [catVal, setCatVal] = useState(searchParams.get('categoria') || '');
  const [categoriasList, setCategoriasList] = useState([]);
  
  // Estado para el menú desplegable del usuario
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    
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

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
    setCatVal(searchParams.get('categoria') || '');
  }, [searchParams]);

  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchVal.trim()) params.set('search', searchVal.trim());
    if (catVal) params.set('categoria', catVal);
    navigate(`/catalogo?${params.toString()}`);
  };

  const handleLogoutClick = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-stone-150 shadow-sm">
      {/* Primera fila: Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Logo (Naturart Foods Original) */}
        <Link to="/" className="flex items-center space-x-2 shrink-0 p-1">
          <Leaf className="w-7 h-7 text-emerald-600 stroke-[2.5]" />
          <div className="flex items-baseline">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Naturart
            </span>
            <span className="text-stone-700 font-normal text-lg ml-0.5">Foods</span>
          </div>
        </Link>

        {/* Barra de Búsqueda Integrada */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl hidden md:flex items-center bg-stone-50 rounded-xl border border-stone-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 text-stone-800 transition-all shadow-inner">
          <select 
            value={catVal}
            onChange={(e) => setCatVal(e.target.value)}
            className="bg-stone-100 hover:bg-stone-200 border-none outline-none px-3.5 py-2 text-xs font-semibold text-stone-600 h-10 cursor-pointer transition-colors"
          >
            <option value="">Todas las Categorías</option>
            {categoriasList.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </select>
          
          <input 
            type="text" 
            placeholder="Buscar productos saludables..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="flex-1 px-4 py-2 text-sm outline-none border-none text-stone-900 bg-transparent h-10 w-full"
          />
          
          <button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>
        </form>

        {/* Enlaces y Acciones */}
        <div className="flex items-center space-x-5 shrink-0">
          
          {/* Identificación de Usuario + Dropdown Interactivo */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 border border-stone-100 hover:border-stone-200 bg-stone-50/50 hover:bg-stone-50 py-1.5 px-3 rounded-xl transition-all cursor-pointer text-left"
              >
                <div className="hidden sm:block text-left mr-1">
                  <p className="text-[9px] text-stone-400 leading-none">Hola,</p>
                  <p className="text-xs font-extrabold text-stone-700 leading-tight mt-0.5">{user.nombre.split(' ')[0]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-500 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Caja del Dropdown */}
              {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-lg z-[100] text-stone-750">
                  <div className="px-4 py-2">
                    <p className="text-xs text-stone-400 font-medium">Cuenta activa</p>
                    <p className="text-sm font-bold text-stone-850 truncate mt-0.5">{user.nombre}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    {user.rol === 'admin' && (
                      <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md mt-1.5 uppercase tracking-wider">
                        Rol: Administrador
                      </span>
                    )}
                  </div>
                  
                  <hr className="border-stone-100 my-2" />
                  
                  <Link 
                    to="/perfil" 
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-stone-650 hover:bg-stone-50 hover:text-emerald-600 transition-colors"
                  >
                    Mi Perfil
                  </Link>

                  <Link 
                    to="/mis-pedidos" 
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-stone-650 hover:bg-stone-50 hover:text-emerald-600 transition-colors"
                  >
                    Mis Pedidos
                  </Link>

                  {user.rol === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      Panel Administrador
                    </Link>
                  )}

                  <hr className="border-stone-100 my-2" />
                  
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/registro" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Favoritos */}
          {user && (
            <Link 
              to="/favoritos" 
              className="flex items-center p-1.5 rounded relative text-stone-600 hover:text-rose-500 transition-all"
            >
              <Heart className="w-6 h-6 stroke-[1.8]" />
              <span className="hidden sm:block text-xs font-bold ml-1.5">Favoritos</span>
            </Link>
          )}

          {/* Carrito */}
          <Link 
            to="/carrito" 
            className="flex items-center p-1.5 rounded relative text-stone-600 hover:text-emerald-600 transition-all"
          >
            <div className="relative">
              <ShoppingCart className="w-7 h-7 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs font-bold ml-1.5 text-stone-650">Carrito</span>
          </Link>
          
        </div>
      </div>

      {/* Sub-navbar móvil de búsqueda */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-stone-50 rounded-xl border border-stone-200 overflow-hidden text-stone-850 shadow-inner">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="flex-1 px-4 py-2 text-sm outline-none border-none text-stone-900 bg-transparent h-10 w-full"
          />
          <button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-5 flex items-center justify-center transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Segunda fila: Sub-navbar de enlaces rápidos (Estilo Amazon) */}
      <div className="bg-emerald-50/50 border-t border-stone-100 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-bold text-emerald-805">
          <div className="flex items-center space-x-6 overflow-x-auto scrollbar-none py-0.5">
            <Link to="/" className="flex items-center space-x-1 hover:text-emerald-700 shrink-0 transition-colors">
              <Menu className="w-4 h-4" />
              <span>Inicio</span>
            </Link>
            <Link to="/catalogo" className="hover:text-emerald-700 shrink-0 transition-colors">
              Catálogo Completo
            </Link>
          </div>
          <div className="hidden sm:block text-[10px] text-emerald-700 uppercase tracking-widest font-extrabold animate-pulse">
            Envío Gratis en compras mayores a $30
          </div>
        </div>
      </div>

    </header>
  );
}
