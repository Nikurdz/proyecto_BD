import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AppContext';
import DashboardAnalytics from '../components/DashboardAnalytics';
import { Trash2, Edit3, Plus, RefreshCw, AlertTriangle, CheckCircle, X, Upload, ImagePlus, Link2, FileImage } from 'lucide-react';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados para Usuarios y Tabs
  const [activeTab, setActiveTab] = useState('productos'); // 'productos' o 'usuarios'
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  // Estados del Formulario (Agregar/Editar)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null si es Agregar, ID del producto si es Editar
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [stockAgregar, setStockAgregar] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [categoria, setCategoria] = useState('');
  const [categoriasList, setCategoriasList] = useState([]);

  // Estados para el drag & drop de imagen
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [useUrlMode, setUseUrlMode] = useState(false); // Toggle entre subir archivo y URL manual
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/productos?page=1&limit=50`); // Traemos hasta 50 para administrar
      const responseData = await res.json();
      if (responseData.success) {
        setProductos(responseData.data);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setError('No se pudo cargar el listado de productos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/productos/categorias`);
      const responseData = await res.json();
      if (responseData.success) {
        setCategoriasList(responseData.data);
        if (responseData.data.length > 0 && !categoria) {
          setCategoria(responseData.data[0].nombre);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/auth/admin/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const responseData = await res.json();
      if (res.ok) {
        setUsuarios(responseData);
      } else {
        throw new Error(responseData.error || 'Error al obtener usuarios');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('No se pudo cargar el listado de usuarios.');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/auth/admin/pedidos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const responseData = await res.json();
      if (res.ok && responseData.success) {
        setPedidos(responseData.data);
      } else {
        throw new Error(responseData.error || 'Error al obtener pedidos');
      }
    } catch (err) {
      console.error('Error fetching pedidos:', err);
      setError('No se pudo cargar el listado de pedidos.');
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleReenviarCorreo = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/admin/usuarios/${id}/reenviar-verificacion`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Correo de verificación reenviado al usuario.');
      } else {
        setError(data.error || 'Error al reenviar correo.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión.');
    }
  };

  const handleCambiarRol = async (id, nuevoRol) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/admin/usuarios/${id}/rol`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rol: nuevoRol })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Rol actualizado a ${nuevoRol}.`);
        fetchUsuarios(); // Recargar usuarios
      } else {
        setError(data.error || 'Error al cambiar rol.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión.');
    }
  };

  const handleActualizarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/pedidos/admin/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Estado del pedido #${id} actualizado a ${nuevoEstado}`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchPedidos(); // Recargar pedidos
      } else {
        setError(data.error || 'Error al actualizar estado.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al actualizar estado.');
    }
  };

  useEffect(() => {
    // Seguridad: Bloquear acceso si no es admin
    if (!token || !user || user.rol !== 'admin') {
      navigate('/');
      return;
    }
    fetchProductos();
    fetchCategorias();
    fetchUsuarios();
    fetchPedidos();
  }, [token, user, navigate]);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setStockAgregar('');
    setDescuentoPct(0);
    setImagenUrl('');
    if (categoriasList.length > 0) {
      setCategoria(categoriasList[0].nombre);
    }
    setEditingId(null);
    setImagePreview(null);
    setUploadingImage(false);
    setUploadProgress('');
    setUseUrlMode(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingId(prod.id);
    setTitulo(prod.titulo);
    setDescripcion(prod.descripcion || '');
    setPrecio(prod.precioOriginal || prod.precio); // Cargamos precio original
    setDescuentoPct(prod.descuentoPorcentaje || 0);
    setStock(prod.stock);
    setStockAgregar(''); // Al editar, se inicia vacío el stock a agregar
    setImagenUrl(prod.imagen_url || '');
    setImagePreview(prod.imagen_url || null);
    setCategoria(prod.categoria || '');
    setUseUrlMode(false);
    setModalOpen(true);
  };

  // --- Funciones de Upload de Imagen ---

  const uploadFile = useCallback(async (file) => {
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP, etc.).');
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede exceder los 10MB.');
      return;
    }

    // Mostrar preview local inmediato
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Subir al backend para conversión a WEBP
    setUploadingImage(true);
    setUploadProgress('Convirtiendo a WEBP...');
    setError('');

    try {
      const formData = new FormData();
      formData.append('imagen', file);

      const res = await fetch(`http://${window.location.hostname}:5000/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setImagenUrl(data.url);
        setImagePreview(data.url);
        setUploadProgress('✓ Imagen convertida a WEBP');
      } else {
        throw new Error(data.error || 'Error al subir la imagen.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message);
      setUploadProgress('');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  }, [token]);

  // Handlers de Drag & Drop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo salir del estado drag si salimos del dropzone real
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input para permitir seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFile]);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    setImagenUrl('');
    setUploadProgress('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const bodyData = {
      titulo,
      descripcion_detallada: descripcion,
      precio: parseFloat(precio),
      descuentoPct: parseFloat(descuentoPct),
      imagen_url: imagenUrl,
      categoria
    };

    if (editingId) {
      bodyData.stockAgregar = parseInt(stockAgregar) || 0;
    } else {
      bodyData.stock = parseInt(stock) || 0;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `http://${window.location.hostname}:5000/api/productos/${editingId}`
        : `http://${window.location.hostname}:5000/api/productos`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        setSuccessMsg(editingId ? 'Producto actualizado con éxito.' : 'Producto creado con éxito.');
        setModalOpen(false);
        resetForm();
        fetchProductos();
      } else {
        throw new Error(responseData.error || 'Error al procesar la solicitud.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleAñadirCategoria = async () => {
    const nueva = window.prompt("Ingrese el nombre de la nueva categoría:");
    if (!nueva || nueva.trim() === '') return;
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/productos/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: nueva.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchCategorias();
        setCategoria(nueva.trim());
      } else {
        alert(data.error || "Error al crear la categoría");
      }
    } catch (err) {
      console.error('Error al añadir categoría:', err);
      alert('Error de conexión.');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto de forma permanente de Oracle DB?')) return;

    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        setSuccessMsg('Producto eliminado con éxito de la base de datos.');
        fetchProductos();
      } else {
        throw new Error(responseData.error || 'Error al eliminar.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (user?.rol !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-stone-850">Acceso No Autorizado</h2>
        <p className="text-xs text-stone-500 mt-2">Esta sección está restringida solo para administradores de Naturart Foods.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-855">Panel de Control</h1>
          <p className="text-xs text-stone-500 mt-1">Administración general de Naturart Foods</p>
        </div>
        {activeTab === 'productos' && (
          <button
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 space-x-8">
        <button
          onClick={() => setActiveTab('productos')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'productos'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
        >
          Productos
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'usuarios'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
        >
          Usuarios Registrados
        </button>
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pedidos'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
        >
          Gestión de Pedidos
        </button>
        <button
          onClick={() => setActiveTab('analiticas')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'analiticas'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
        >
          Analítica DW
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-650 p-4 rounded-xl text-xs mb-6 text-center font-bold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-xs mb-6 text-center font-bold flex items-center justify-center space-x-1.5">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Contenido Principal según el Tab activo */}
      {activeTab === 'productos' ? (
        <>
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-605" />
              <p className="mt-4 text-stone-500 text-sm font-semibold">Cargando inventario...</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-sm">
              <p className="text-stone-700 font-bold">No hay productos registrados en el inventario.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-150 uppercase tracking-wider">
                      <th className="p-4">Imagen</th>
                      <th className="p-4">Título</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4 text-right">Precio</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {productos.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4">
                          <img
                            src={prod.imagen_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=100'}
                            alt={prod.titulo}
                            className="w-12 h-12 object-contain rounded-lg border border-stone-100 bg-white"
                          />
                        </td>
                        <td className="p-4 font-bold text-stone-850">
                          <div className="max-w-xs truncate" title={prod.titulo}>{prod.titulo}</div>
                        </td>
                        <td className="p-4">
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[9px]">
                            {prod.categoria}
                          </span>
                        </td>
                        <td className="p-4 text-right font-extrabold text-stone-850">
                          ${(prod.precioOriginal || prod.precio).toFixed(2)}
                          {prod.descuentoPorcentaje > 0 && (
                            <span className="block text-[10px] text-red-500">-{prod.descuentoPorcentaje}%</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-bold ${prod.stock < 10 ? 'text-red-650' : 'text-stone-700'}`}>
                            {prod.stock} u.
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-2 rounded-xl transition-colors cursor-pointer border-none"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* TAB USUARIOS */
        <>
          {loadingUsuarios ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-605" />
              <p className="mt-4 text-stone-500 text-sm font-semibold">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center shadow-sm">
              <p className="text-stone-700 font-bold">No hay usuarios registrados.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-150 uppercase tracking-wider">
                      <th className="p-4">ID</th>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Correo</th>
                      <th className="p-4 text-center">Rol</th>
                      <th className="p-4 text-center">Estado Verificación</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {usuarios.map((usr) => (
                      <tr key={usr.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-stone-600">{usr.id}</td>
                        <td className="p-4 font-bold text-stone-850">{usr.nombre}</td>
                        <td className="p-4 text-stone-600">{usr.correo}</td>
                        <td className="p-4 text-center">
                          <select
                            value={usr.rol || 'cliente'}
                            onChange={(e) => handleCambiarRol(usr.id, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[10px] cursor-pointer outline-none border transition-colors ${
                              usr.rol === 'admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-2 focus:ring-purple-500'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-2 focus:ring-emerald-500'
                            }`}
                          >
                            <option value="cliente">Cliente</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          {usr.verificado === 1 ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-md font-bold text-[10px]">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md font-bold text-[10px]">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {usr.verificado !== 1 && (
                            <button
                              onClick={() => handleReenviarCorreo(usr.id)}
                              className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg font-bold transition-colors border-none cursor-pointer"
                              title="Reenviar correo de verificación"
                            >
                              Reenviar Correo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TABS CONTENT: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden mb-12 animate-fade-in-up">
          <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
            <div>
              <h2 className="text-lg font-bold text-stone-850">Gestión de Ventas</h2>
              <p className="text-xs text-stone-500">Historial completo de pedidos realizados</p>
            </div>
            <button
              onClick={fetchPedidos}
              disabled={loadingPedidos}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPedidos ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
          
          {loadingPedidos ? (
            <div className="p-16 text-center text-stone-500 flex flex-col items-center">
              <RefreshCw className="w-10 h-10 animate-spin mb-4 text-emerald-600" />
              <p className="font-bold text-lg">Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="p-16 text-center text-stone-500 flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-stone-300 mb-4" />
              <p className="font-bold text-xl text-stone-850 mb-1">Aún no hay ventas registradas</p>
              <p className="text-sm">Cuando tus clientes realicen compras, el historial aparecerá aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-150 uppercase tracking-wider">
                    <th className="p-4">Pedido ID</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {pedidos.map((ped) => (
                    <tr key={ped.ID} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-stone-850">#{ped.ID}</td>
                      <td className="p-4">
                        <p className="font-bold text-stone-850">{ped.CLIENTE}</p>
                        <p className="text-stone-500 text-[10px]">{ped.CORREO}</p>
                      </td>
                      <td className="p-4 text-stone-600 font-mono">
                        {new Date(ped.FECHA).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="p-4 font-extrabold text-stone-850">${Number(ped.TOTAL).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <select
                          value={ped.ESTADO || 'Pendiente'}
                          onChange={(e) => handleActualizarEstadoPedido(ped.ID, e.target.value)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[10px] cursor-pointer outline-none border transition-colors ${
                            ped.ESTADO?.toLowerCase() === 'entregado' || ped.ESTADO === 'COMPLETADO' || ped.ESTADO === 'PAGADO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-2 focus:ring-emerald-500'
                              : ped.ESTADO?.toLowerCase() === 'enviado'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-2 focus:ring-blue-500'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-2 focus:ring-yellow-500'
                          }`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TABS CONTENT: ANALITICAS */}
      {activeTab === 'analiticas' && (
        <DashboardAnalytics />
      )}

      {/* MODAL FORMULARIO AGREGAR / EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 bg-stone-100 hover:bg-stone-200 text-stone-600 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h2 className="text-xl font-black text-stone-850 mb-6 pb-2 border-b border-stone-100">
              {editingId ? 'Editar Producto en Oracle' : 'Nuevo Producto en Oracle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-stone-700">

              <div>
                <label className="block mb-2 text-stone-500 uppercase">Título del Producto</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-stone-500 uppercase">Descripción Detallada (CLOB)</label>
                <textarea
                  rows="4"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900 leading-relaxed"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-stone-500 uppercase">Precio Base ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900 text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-stone-500 uppercase">Descuento (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={descuentoPct}
                    onChange={(e) => setDescuentoPct(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900 text-center"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-stone-500 uppercase">
                    {editingId ? 'Agregar al Stock (+)' : 'Stock Inicial'}
                  </label>
                  {editingId ? (
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={stockAgregar}
                        onChange={(e) => setStockAgregar(e.target.value)}
                        placeholder={`Actual: ${stock}`}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900 text-center"
                      />
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900 text-center"
                      required
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-stone-500 uppercase">Categoría</label>
                  <button type="button" onClick={handleAñadirCategoria} className="text-xs text-emerald-600 font-bold hover:underline border-none cursor-pointer bg-transparent">+ Añadir Nueva Categoría</button>
                </div>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900 cursor-pointer h-10"
                  required
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {categoriasList.map((cat, idx) => (
                    <option key={idx} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {/* --- IMAGEN: Drag & Drop / URL Toggle --- */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-stone-500 uppercase">Imagen del Producto</label>
                  <button
                    type="button"
                    onClick={() => setUseUrlMode(!useUrlMode)}
                    className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer bg-transparent border-none text-[10px] font-bold uppercase tracking-wide"
                  >
                    {useUrlMode ? (
                      <>
                        <Upload className="w-3 h-3" />
                        <span>Subir archivo</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3 h-3" />
                        <span>Usar URL</span>
                      </>
                    )}
                  </button>
                </div>

                {useUrlMode ? (
                  /* Modo URL Manual */
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={imagenUrl}
                    onChange={(e) => {
                      setImagenUrl(e.target.value);
                      setImagePreview(e.target.value || null);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-stone-900"
                  />
                ) : (
                  /* Modo Drag & Drop */
                  <>
                    {imagePreview && !uploadingImage ? (
                      /* Preview de imagen ya subida */
                      <div className="relative group">
                        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-contain bg-white"
                          />
                          <div className="px-3 py-2 flex items-center justify-between bg-emerald-50">
                            <div className="flex items-center space-x-1.5">
                              <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">
                                {uploadProgress || 'Imagen lista (WEBP)'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-1"
                              title="Quitar imagen"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Zona de Drop */
                      <div
                        ref={dropZoneRef}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !uploadingImage && fileInputRef.current?.click()}
                        className={`
                          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                          flex flex-col items-center justify-center py-8 px-4
                          ${isDragging
                            ? 'border-emerald-500 bg-emerald-50 scale-[1.02] shadow-lg shadow-emerald-100'
                            : 'border-stone-250 bg-stone-50/50 hover:border-emerald-400 hover:bg-emerald-50/30'
                          }
                          ${uploadingImage ? 'pointer-events-none opacity-70' : ''}
                        `}
                        style={{ minHeight: '120px' }}
                      >
                        {uploadingImage ? (
                          /* Estado: Subiendo */
                          <div className="flex flex-col items-center space-y-2">
                            <div className="relative">
                              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                            <p className="text-emerald-600 font-bold text-[11px]">{uploadProgress}</p>
                          </div>
                        ) : (
                          /* Estado: Esperando archivo */
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`
                              p-3 rounded-2xl transition-all duration-300
                              ${isDragging
                                ? 'bg-emerald-100 text-emerald-600 scale-110'
                                : 'bg-stone-100 text-stone-400'
                              }
                            `}>
                              <ImagePlus className="w-7 h-7" />
                            </div>
                            <div className="text-center">
                              <p className={`font-bold text-[11px] ${isDragging ? 'text-emerald-600' : 'text-stone-600'}`}>
                                {isDragging ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen aquí'}
                              </p>
                              <p className="text-[10px] text-stone-400 mt-0.5">
                                o <span className="text-emerald-600 underline">haz clic para seleccionar</span>
                              </p>
                              <p className="text-[9px] text-stone-350 mt-1.5 uppercase tracking-wider">
                                JPG, PNG, GIF, WEBP — Máx 10MB — Se convierte a WEBP automáticamente
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Input oculto de archivo */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={uploadingImage}
                className={`
                  w-full font-bold py-3 rounded-xl transition-all shadow cursor-pointer border-none text-xs uppercase mt-6
                  ${uploadingImage
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }
                `}
              >
                {editingId ? 'Guardar Cambios' : 'Insertar Producto'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
