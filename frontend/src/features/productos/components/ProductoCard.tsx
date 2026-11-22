import React, { useState } from 'react';
import { ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { Producto } from '../types/producto';
import { useCartStore } from '../../../store/cartStore';
import { Button } from '../../../shared/ui/Button';

interface ProductoCardProps {
  producto: Producto;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({ producto }) => {
  const { agregar, items } = useCartStore();
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  const itemEnCarrito = items.find((i) => i.producto_id === producto.id);
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
  const sinStock = producto.stock <= 0 || !producto.disponible;
  const stockDisponibleRestante = Math.max(0, producto.stock - cantidadEnCarrito);

  const handleAgregar = () => {
    if (sinStock || stockDisponibleRestante <= 0) return;
    agregar(
      {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_base,
        imagen_url: producto.imagen_url,
        stock_maximo: producto.stock,
      },
      1
    );
    setAgregadoAnim(true);
    setTimeout(() => setAgregadoAnim(false), 900);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Imagen */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="text-sm font-medium">Sin imagen</span>
          </div>
        )}

        {/* Categoría Badge */}
        {producto.categoria && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
            {producto.categoria.nombre}
          </span>
        )}

        {/* Disponibilidad / Stock Badge */}
        {sinStock ? (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Agotado
          </span>
        ) : producto.stock <= 3 ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            ¡Últimos {producto.stock}!
          </span>
        ) : null}
      </div>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {producto.nombre}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {producto.descripcion || 'Sin descripción disponible.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block leading-none">Precio</span>
            <span className="text-lg font-bold text-slate-900">
              ${producto.precio_base.toLocaleString('es-AR')}
            </span>
          </div>

          <Button
            size="sm"
            variant={agregadoAnim ? 'secondary' : 'primary'}
            disabled={sinStock || stockDisponibleRestante <= 0}
            onClick={handleAgregar}
            className="rounded-xl px-3.5"
          >
            {agregadoAnim ? (
              <>
                <Check className="w-4 h-4 mr-1 text-emerald-400" />
                ¡Listo!
              </>
            ) : sinStock ? (
              'Agotado'
            ) : stockDisponibleRestante <= 0 ? (
              'En carrito'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1.5" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
