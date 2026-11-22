import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';

export const CarritoPage: React.FC = () => {
  const { items, total, cambiarCantidad, quitar, vaciar } = useCartStore();
  const navigate = useNavigate();
  const cartTotal = total();

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Explora nuestro catálogo para armar tu pedido con las mejores comidas."
          icono={<ShoppingCart className="w-8 h-8 text-amber-500" />}
          accionTexto="Ver Catálogo"
          onAccion={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tu Carrito</h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisa los platos seleccionados antes de confirmar el pedido
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={vaciar} className="text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-1.5" />
          Vaciar Carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.producto_id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
              {item.imagen_url ? (
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                  FS
                </div>
              )}

              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-slate-800 text-base">{item.nombre}</h3>
                <span className="text-sm font-semibold text-amber-600 font-mono">
                  ${item.precio_unitario.toLocaleString('es-AR')}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Stock disponible: {item.stock_maximo}
                </span>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                <button
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  className="w-7 h-7 rounded-lg bg-white text-slate-600 flex items-center justify-center shadow-xs hover:bg-slate-50 cursor-pointer"
                  title="Disminuir"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-slate-800 font-mono">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stock_maximo}
                  className="w-7 h-7 rounded-lg bg-white text-slate-600 flex items-center justify-center shadow-xs hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  title="Aumentar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtotal y eliminar */}
              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <span className="font-bold text-slate-900 text-base font-mono">
                  ${(item.cantidad * item.precio_unitario).toLocaleString('es-AR')}
                </span>
                <button
                  onClick={() => quitar(item.producto_id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Quitar ítem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen */}
        <div>
          <Card className="p-6 sticky top-24 space-y-5">
            <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
              Resumen del Pedido
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Total de productos</span>
                <span>{items.reduce((acc, i) => acc + i.cantidad, 0)} unidades</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío</span>
                <span className="text-emerald-600 font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span className="text-amber-600 font-mono">${cartTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Iniciar Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Link
              to="/"
              className="block text-center text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors"
            >
              ← Seguir agregando comidas
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
