import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function Verificar() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // Manejo de los 3 estados obligatorios para evitar pantallas en blanco
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'exito' | 'error'
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    const verificarCuenta = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/verificar/${token}`);
        const data = await response.json();

        if (response.ok) {
          setEstado('exito');
          // Auto-Login: Guardar JWT en localStorage
          localStorage.setItem('token', data.token);

          // Redirigir al inicio después de 3 segundos usando useNavigate
          setTimeout(() => {
            navigate('/');
            // Forzamos la recarga si necesitas que el contexto de React se reinicialice
            window.location.reload(); 
          }, 3000);
        } else {
          setEstado('error');
          setMensajeError(data.error || 'El enlace es inválido o expiró');
        }
      } catch (err) {
        console.error('Error de red al verificar:', err);
        setEstado('error');
        setMensajeError('Hubo un problema conectando con el servidor.');
      }
    };

    if (token) {
      verificarCuenta();
    } else {
      setEstado('error');
      setMensajeError('Token no proporcionado.');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-stone-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 w-full max-w-md text-center">
        
        {/* ESTADO 1: CARGANDO */}
        {estado === 'cargando' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
            <h2 className="text-2xl font-bold text-stone-800">Verificando tu cuenta...</h2>
            <p className="text-stone-500">Por favor no cierres esta ventana.</p>
          </div>
        )}

        {/* ESTADO 2: ÉXITO */}
        {estado === 'exito' && (
          <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in-up">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-700">¡Verificación exitosa!</h2>
            <p className="text-stone-600 font-semibold">Redirigiendo...</p>
          </div>
        )}

        {/* ESTADO 3: ERROR */}
        {estado === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in-up">
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600">Verificación Fallida</h2>
            <p className="text-stone-600 mb-6">{mensajeError}</p>
            <Link 
              to="/" 
              className="mt-4 px-6 py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition"
            >
              Volver al Inicio
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
