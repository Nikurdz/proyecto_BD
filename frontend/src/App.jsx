import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Carrito from './pages/Carrito';
import MisPedidos from './pages/MisPedidos';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import NuestraHistoria from './pages/NuestraHistoria';
import Envios from './pages/Envios';
import Terminos from './pages/Terminos';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import Devoluciones from './pages/Devoluciones';
import Privacidad from './pages/Privacidad';
import Cookies from './pages/Cookies';
import Favoritos from './pages/Favoritos';
import Verificar from './pages/Verificar';
import Footer from './components/Footer';
import { AppProvider, useNotification } from './context/AppContext';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import './App.css';

function NotificationToast() {
  const { notification } = useNotification();

  if (!notification) return null;

  const config = {
    success: {
      bg: 'bg-emerald-600 border-emerald-500 shadow-emerald-100',
      icon: <CheckCircle className="w-5 h-5 text-white stroke-[2.5]" />
    },
    error: {
      bg: 'bg-red-600 border-red-500 shadow-red-100',
      icon: <AlertCircle className="w-5 h-5 text-white stroke-[2.5]" />
    },
    info: {
      bg: 'bg-blue-600 border-blue-500 shadow-blue-100',
      icon: <Info className="w-5 h-5 text-white stroke-[2.5]" />
    }
  };

  const style = config[notification.type] || config.info;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-fade-in-up">
      <div className={`flex items-center space-x-3.5 p-4 rounded-2xl border text-white shadow-xl backdrop-blur-sm transition-all duration-300 ${style.bg}`}>
        {style.icon}
        <div className="text-xs font-bold tracking-wide">{notification.message}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-800">
          <NotificationToast />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/mis-pedidos" element={<MisPedidos />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/nuestra-historia" element={<NuestraHistoria />} />
              <Route path="/envios" element={<Envios />} />
              <Route path="/terminos-y-condiciones" element={<Terminos />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/devoluciones" element={<Devoluciones />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/verificar/:token" element={<Verificar />} />
            </Routes>
          </main>
          
          {/* Footer Oscuro Estilo Amazon - Reemplazado por Footer Corporativo */}
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}
