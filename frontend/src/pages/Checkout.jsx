import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, useAuth } from '../context/AppContext';
import { CreditCard, ShieldCheck, CheckCircle, ChevronLeft, ArrowRight, RefreshCw, Leaf } from 'lucide-react';

export default function Checkout() {
  const { cart, getCartTotal, checkout, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metodoPago, setMetodoPago] = useState('tarjeta'); // 'tarjeta', 'banco_pichincha', 'de_una'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pedidoRealizado, setPedidoRealizado] = useState(false);
  const [totalFacturado, setTotalFacturado] = useState(null);

  // Estados del Formulario de Tarjeta (Sin validaciones)
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [focusedField, setFocusedField] = useState('');
  
  // Datos de Facturación y Envío
  const [cedula, setCedula] = useState('');
  const [cedulaError, setCedulaError] = useState('');
  const [nombreFacturacion, setNombreFacturacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [direccionEnvio, setDireccionEnvio] = useState('');

  // Estados para Pago Ecuatoriano
  const [comprobante, setComprobante] = useState(null);
  const [codigoDeUna, setCodigoDeUna] = useState('');

  // Generar código DeUna simulado
  const generarCodigoDeUna = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoDeUna(code);
  };

  // Detección visual básica de franquicia
  const detectarFranquicia = (numero) => {
    const cleanNumber = numero.replace(/\D/g, '');
    if (/^4/.test(cleanNumber)) return { nombre: 'Visa', color: 'from-blue-600 to-cyan-500' };
    if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) return { nombre: 'Mastercard', color: 'from-orange-500 to-red-500' };
    if (/^3[47]/.test(cleanNumber)) return { nombre: 'American Express', color: 'from-stone-700 to-stone-500' };
    return { nombre: 'Tarjeta', color: 'from-stone-800 to-stone-700' };
  };

  const franquicia = detectarFranquicia(numeroTarjeta);

  // Formateador de tarjeta (agrega espacios cada 4 dígitos)
  const handleNumeroChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumeroTarjeta(formatted.trim());
  };

  // Formateador de fecha de expiración (MM/YY)
  const handleFechaChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (input.length >= 3) {
      setFechaExpiracion(`${input.substring(0, 2)}/${input.substring(2, 4)}`);
    } else {
      setFechaExpiracion(input);
    }
  };

  // Formateador de CVV (solo números, max 4 dígitos)
  const handleCvvChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(input);
  };

  // Validación estricta de Cédula Ecuatoriana
  const validarCedula = (val) => {
    if (!val) return false;
    if (typeof val !== 'string' || val.length !== 10 || !/^\d+$/.test(val)) return false;
    const digito_region = parseInt(val.substring(0, 2), 10);
    if (digito_region < 1 || digito_region > 24) return false;
    
    const ultimo_digito = parseInt(val.substring(9, 10), 10);
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let digito = parseInt(val.charAt(i), 10);
      if (i % 2 === 0) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
    }
    const decena = Math.ceil(suma / 10) * 10;
    let digito_validador = decena - suma;
    if (digito_validador === 10) digito_validador = 0;
    
    return digito_validador === ultimo_digito;
  };

  // Validar en tiempo real
  const handleCedulaChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
    setCedula(val);
  };

  const handleTelefonoChange = (e) => {
    // Solo permitir números y máximo 10 caracteres
    const val = e.target.value.replace(/\D/g, '').substring(0, 10);
    setTelefono(val);
    if (val.length > 0 && val.length < 10) {
      setTelefonoError('El celular debe tener exactamente 10 dígitos.');
    } else {
      setTelefonoError('');
    }
  };

  // Flujo directo de Procesar Pago (SIMULACIÓN PURA)
  const handlePagarSubmit = async (e) => {
    e.preventDefault(); // Evitamos que el form recargue la página
    setError('');
  

    if (telefono.length !== 10) {
      setError('El celular de contacto debe tener 10 dígitos.');
      return;
    }

    setLoading(true);

    try {
      // 1. Simular procesamiento de 2 segundos para dar realismo al click
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Enviar a Oracle
      const result = await checkout({
        direccionEnvio,
        cedula,
        nombreFacturacion,
        telefono
      });

      // 3. Limpiar carrito y mostrar éxito
      setTotalFacturado(result.total_facturado);
      setPedidoRealizado(true);
      clearCart();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  // --- VISTAS CONDICIONALES ---

  if (cart.length === 0 && !pedidoRealizado) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
          <p className="text-stone-550 font-bold mb-4">No tienes productos en tu carrito para pagar.</p>
          <Link to="/catalogo" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-block text-xs">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // PANTALLA DE ÉXITO OBLIGATORIO
  if (pedidoRealizado) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xl flex flex-col items-center animate-fade-in-up">
          <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-850 mb-2">¡Simulación de Pago Completada con Éxito!</h2>
          <p className="text-stone-500 mb-6 text-sm leading-relaxed">
            Tu compra de prueba ha sido procesada directamente. El pedido se registró en tu base de datos y la facturación total calculada por Oracle es de <strong className="text-emerald-700 font-bold">${parseFloat(totalFacturado).toFixed(2)}</strong>.
          </p>
          <div className="space-y-3 w-full">
            <button
              onClick={() => navigate('/mis-pedidos')}
              className="w-full block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all text-sm text-center cursor-pointer"
            >
              Ver Mis Pedidos
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full block bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 px-8 rounded-xl transition-all text-sm text-center cursor-pointer"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA DE CHECKOUT PRINCIPAL
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/carrito" className="inline-flex items-center space-x-1.5 text-stone-500 hover:text-stone-800 text-xs font-bold mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Volver al Carrito</span>
      </Link>

      <h1 className="text-3xl font-extrabold text-stone-850 mb-8">Completar Compra (Modo Simulación)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Columna Izquierda: Formulario de pago SIN VALIDACIONES */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-850 mb-5">Método de pago (Demostración)</h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMetodoPago('tarjeta')}
              className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 transition-all text-xs sm:text-sm font-bold cursor-pointer ${metodoPago === 'tarjeta' ? 'border-emerald-600 bg-emerald-50/20 text-emerald-700' : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Tarjeta</span>
            </button>
            <button
              type="button"
              onClick={() => setMetodoPago('banco_pichincha')}
              className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 transition-all text-xs sm:text-sm font-bold cursor-pointer ${metodoPago === 'banco_pichincha' ? 'border-yellow-500 bg-yellow-50/20 text-yellow-700' : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
            >
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Transferencia</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMetodoPago('de_una');
                if (!codigoDeUna) generarCodigoDeUna();
              }}
              className={`flex-1 p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 transition-all text-xs sm:text-sm font-bold cursor-pointer ${metodoPago === 'de_una' ? 'border-pink-600 bg-pink-50/20 text-pink-700' : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>DeUna!</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-650 p-4 rounded-xl text-center text-xs mb-6">
              {error}
            </div>
          )}

          <div className="mb-8 space-y-4 bg-stone-50 p-6 rounded-2xl border border-stone-150">
            <h3 className="font-bold text-stone-850 mb-4 text-sm uppercase tracking-wider border-b border-stone-200 pb-2">Datos de Facturación y Envío</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Cédula o RUC <span className="text-emerald-600">*</span></label>
                  <input
                    type="text"
                    placeholder="Ej. 1712345678"
                    value={cedula}
                    onChange={handleCedulaChange}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-white ${cedulaError ? 'border-red-400 focus:ring-red-500' : 'border-stone-200 focus:ring-emerald-500'}`}
                    required
                  />
                  {cedulaError && <p className="text-xs font-bold text-red-500 mt-1">{cedulaError}</p>}
                </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Nombre o Razón Social <span className="text-emerald-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={nombreFacturacion}
                  onChange={(e) => setNombreFacturacion(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Celular de Contacto <span className="text-emerald-600">*</span></label>
                  <input
                    type="text"
                    placeholder="Ej. 0991234567"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    maxLength="10"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm bg-white ${telefonoError ? 'border-red-400 focus:ring-red-500' : 'border-stone-200 focus:ring-emerald-500'}`}
                    required
                  />
                  {telefonoError && <p className="text-xs font-bold text-red-500 mt-1">{telefonoError}</p>}
                </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Dirección de Envío <span className="text-emerald-600">*</span></label>
                <input
                  type="text"
                  placeholder="Ej. Av. Amazonas y NNUU..."
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <form onSubmit={handlePagarSubmit} className="space-y-5">
            {metodoPago === 'tarjeta' ? (
              <>
                <div className="relative mb-8 overflow-hidden rounded-2xl shadow-lg h-48 w-full max-w-sm mx-auto bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-6 text-white flex flex-col justify-between select-none">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                    <Leaf className="w-48 h-48" />
                  </div>
                  <div className="flex justify-between items-start z-10">
                    <div className="bg-amber-400 h-9 w-12 rounded-lg opacity-85 shadow-sm"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-stone-300">
                      {franquicia.nombre}
                    </span>
                  </div>
                  <div className="text-lg font-mono tracking-widest text-center py-2 z-10">
                    {numeroTarjeta || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-end z-10">
                    <div>
                      <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Titular de Tarjeta</p>
                      <p className="text-xs font-bold tracking-wide uppercase truncate max-w-[180px]">
                        {nombreTarjeta || 'Nombre Completo'}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Vence</p>
                        <p className="text-xs font-mono font-bold">{fechaExpiracion || 'MM/YY'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">CVV</p>
                        <p className="text-xs font-mono font-bold">{focusedField === 'cvv' ? cvv : '•••'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Se quitaron atributos 'required', patterns y limitaciones para no bloquear pruebas */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Nombre en la Tarjeta</label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez (Opcional en simulación)"
                      value={nombreTarjeta}
                      onChange={(e) => setNombreTarjeta(e.target.value)}
                      onFocus={() => setFocusedField('nombre')}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Número de Tarjeta</label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={numeroTarjeta}
                      onChange={handleNumeroChange}
                      onFocus={() => setFocusedField('numero')}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Vencimiento</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={fechaExpiracion}
                        onChange={handleFechaChange}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={handleCvvChange}
                        onFocus={() => setFocusedField('cvv')}
                        onBlur={() => setFocusedField('')}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : metodoPago === 'banco_pichincha' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-stone-850 text-lg">Simulación de Transferencia</h3>
                  <p className="text-xs text-stone-500 mt-1">No necesitas subir nada, solo procesa el pago.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Sube comprobante falso (Opcional)</label>
                  <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-white relative cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => setComprobante(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {!comprobante ? (
                      <>
                        <ShieldCheck className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                        <p className="text-sm text-stone-600 font-bold">Haz clic o ignora este paso</p>
                      </>
                    ) : (
                      <p className="text-sm text-emerald-700 font-bold">Archivo seleccionado: {comprobante.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-stone-50 border border-stone-150 p-6 rounded-2xl text-center space-y-5">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-stone-200 mb-2">
                  <div className="w-40 h-40 bg-pink-50 flex items-center justify-center border-4 border-pink-600 rounded-xl relative overflow-hidden">
                    <div className="bg-white p-2 rounded relative z-10 font-black text-pink-700 text-2xl border-2 border-pink-600">
                      DeUna!
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
                  En modo simulación, asume que el escaneo del QR fue exitoso. Clic en Procesar.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-base cursor-pointer disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Procesando pago en curso...</span>
                </>
              ) : (
                <>
                  <span>Procesar Pago Simulado (${getCartTotal().toFixed(2)})</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Resumen de compra */}
        <div className="lg:col-span-5 bg-stone-50 border border-stone-150 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-stone-850 mb-4 pb-2 border-b border-stone-200">
            Resumen de tu Compra
          </h2>

          <div className="space-y-4 max-h-56 overflow-y-auto mb-4 pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="max-w-[70%]">
                  <p className="font-bold text-stone-800 truncate">{item.nombre}</p>
                  <p className="text-stone-450">Cant: {item.cantidad}</p>
                </div>
                <span className="font-extrabold text-stone-800">${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-4 space-y-2.5 text-xs text-stone-605">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío Express</span>
              <span className="text-emerald-600 font-bold">Gratis</span>
            </div>
            <div className="flex justify-between font-extrabold text-stone-855 text-sm pt-2">
              <span>Total a pagar</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
