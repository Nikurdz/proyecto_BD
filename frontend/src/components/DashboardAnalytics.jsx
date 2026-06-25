import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const DashboardAnalytics = () => {
  const [periodo, setPeriodo] = useState('anio_actual'); // 'historico' | 'anio_actual'
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const fetchAnaliticas = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:5000/api/admin/reportes/ventas?periodo=${periodo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!respuesta.ok) {
        throw new Error('No se pudieron obtener las métricas del Data Warehouse.');
      }

      const json = await respuesta.json();
      setDatos(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchAnaliticas();
  }, [periodo]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:5000/api/admin/reportes/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || 'Error al sincronizar DW');
      setSyncMsg(data.message);
      // Reload metrics after successful sync
      fetchAnaliticas();
      // Clear success msg after 4s
      setTimeout(() => setSyncMsg(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Cálculos de KPIs generales a partir del arreglo de ventasPorMes
  const totalIngresos = datos?.ventasPorMes?.reduce((acc, curr) => acc + curr.totalIngresos, 0) || 0;
  const totalProductos = datos?.ventasPorMes?.reduce((acc, curr) => acc + curr.totalProductos, 0) || 0;

  // Mapeo de meses numéricos a texto
  const mesesText = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <div className="bg-slate-50 min-h-full p-8 rounded-2xl shadow-sm border border-slate-100">
      
      {/* Cabecera y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Analítica DW</h2>
          <p className="text-sm text-slate-500 mt-1">Métricas procesadas desde el Data Warehouse (OLAP)</p>
          {syncMsg && <p className="text-xs text-emerald-600 font-bold mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">{syncMsg}</p>}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
          </button>
          
          <div className="bg-white p-1 flex rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setPeriodo('anio_actual')}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              periodo === 'anio_actual' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Ventas de este Año
          </button>
          <button 
            onClick={() => setPeriodo('historico')}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              periodo === 'historico' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Histórico Completo
          </button>
        </div>
      </div>
      </div>

      {cargando && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {!cargando && !error && datos && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* KPIs Globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ingresos Totales</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">${totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Productos Vendidos</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{totalProductos.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfico/Tabla de Ventas por Mes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Tendencia de Ventas (Mensual)</h3>
              
              {datos.ventasPorMes.length > 0 ? (
                <div className="space-y-4">
                  {datos.ventasPorMes.map((mesData, idx) => {
                    // Cálculo simple para barras horizontales
                    const maxIngreso = Math.max(...datos.ventasPorMes.map(d => d.totalIngresos));
                    const porcentaje = (mesData.totalIngresos / maxIngreso) * 100;

                    return (
                      <div key={idx} className="relative">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{mesesText[mesData.mes - 1]} {mesData.anio}</span>
                          <span className="font-bold text-emerald-600">${mesData.totalIngresos.toLocaleString('en-US')}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-xl">
                  No hay datos de ventas para este periodo.
                </div>
              )}
            </div>

            {/* Top 5 Productos */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Top 5 Productos Estrella</h3>
              
              {datos.topProductos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                        <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Cant.</th>
                        <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {datos.topProductos.map((prod, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              idx === 1 ? 'bg-slate-200 text-slate-700' : 
                              idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-700">{prod.nombre}</span>
                          </td>
                          <td className="py-4 text-right text-slate-600 font-medium">{prod.cantidadVendida}</td>
                          <td className="py-4 text-right text-emerald-600 font-bold">${prod.ingresosTotales.toLocaleString('en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-10 bg-slate-50 rounded-xl">
                  No hay productos registrados en ventas.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;
