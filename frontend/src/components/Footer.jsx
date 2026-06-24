import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, MessageCircle, Hash, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-emerald-500">
              <Leaf className="w-8 h-8" />
              <span className="text-xl font-extrabold text-white tracking-tight">Naturart Foods</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Alimentación Consciente y Sostenible. Llevamos lo mejor de la naturaleza a tu mesa, con productos 100% orgánicos y de origen ético.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-slate-500 hover:text-emerald-500 transition-colors" title="Redes Sociales">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-emerald-500 transition-colors" title="Contacto">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-emerald-500 transition-colors" title="Tendencias">
                <Hash className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-xs">Explorar</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/0 hover:bg-emerald-500 transition-colors"></span>
                  <span>Inicio</span>
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="hover:text-emerald-400 transition-colors flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/0 hover:bg-emerald-500 transition-colors"></span>
                  <span>Catálogo</span>
                </Link>
              </li>
              <li>
                <Link to="/nuestra-historia" className="hover:text-emerald-400 transition-colors flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/0 hover:bg-emerald-500 transition-colors"></span>
                  <span>Sobre Nosotros</span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-emerald-400 transition-colors flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/0 hover:bg-emerald-500 transition-colors"></span>
                  <span>Blog de Salud</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda y Soporte */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-xs">Soporte</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/faq" className="hover:text-emerald-400 transition-colors">Preguntas Frecuentes</Link>
              </li>
              <li>
                <Link to="/envios" className="hover:text-emerald-400 transition-colors">Política de Envíos</Link>
              </li>
              <li>
                <Link to="/devoluciones" className="hover:text-emerald-400 transition-colors">Devoluciones</Link>
              </li>
              <li>
                <Link to="/terminos-y-condiciones" className="hover:text-emerald-400 transition-colors">Términos y Condiciones</Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wider uppercase text-xs">Contáctanos</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Av. de los Shyris y Naciones Unidas, Edificio Naturart, Quito, Ecuador.</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>+593 99 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>contacto@naturartfoods.com</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
          <p className="text-slate-500">
            © {new Date().getFullYear()} Naturart Foods. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 text-slate-500">
            <Link to="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link to="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
