import React, { useState } from 'react';
import { Search, PackageX } from 'lucide-react';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { ProductoCard } from '../components/ProductoCard';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { EstadoError } from '../../../shared/components/EstadoError';
import { handleApiError } from '../../../shared/api/handleApiError';

const ITEMS_POR_PAGINA = 8;

export const CatalogoPage: React.FC = () => {
  const [pagina, setPagina] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<number | undefined>(undefined);

  const { data: categorias } = useCategorias();

  const {
    data: productosData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductos({
    skip: pagina * ITEMS_POR_PAGINA,
    limit: ITEMS_POR_PAGINA,
    search: searchTerm || undefined,
    categoria_id: selectedCategoria,
  });

  const total = productosData?.total || 0;
  const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagina(0); // Resetea a primera página
  };

  const handleCategoriaSelect = (catId?: number) => {
    setSelectedCategoria(catId);
    setPagina(0);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-600 via-amber-500 to-orange-500 text-white p-8 md:p-12 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Descubre Nuestro Menú Exclusivo
          </h1>
          <p className="text-amber-100 text-sm md:text-base leading-relaxed">
            Hamburguesas gourmet, pizzas a la piedra de masa madre y empanadas artesanales elaboradas al momento.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar hamburguesa, pizza, bebida..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Categorías Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategoriaSelect(undefined)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategoria === undefined
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {categorias?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoriaSelect(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoria === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
          <button
            onClick={() => handleCategoriaSelect(-1)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategoria === -1
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sin categoría
          </button>
        </div>
      </div>

      {/* Grid de Productos */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <EstadoError
            mensaje={handleApiError(error)}
            onReintentar={() => refetch()}
          />
        ) : !productosData || productosData.items.length === 0 ? (
          <EstadoVacio
            titulo="No se encontraron productos"
            descripcion={
              searchTerm || selectedCategoria !== undefined
                ? 'Intenta cambiar el término de búsqueda o quitar los filtros aplicados.'
                : 'Pronto agregaremos nuevos y deliciosos platos a la carta.'
            }
            icono={<PackageX className="w-8 h-8" />}
            accionTexto={
              searchTerm || selectedCategoria !== undefined ? 'Limpiar filtros' : undefined
            }
            onAccion={() => {
              setSearchTerm('');
              setSelectedCategoria(undefined);
              setPagina(0);
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productosData.items.map((prod) => (
                <ProductoCard key={prod.id} producto={prod} />
              ))}
            </div>

            {/* Paginación */}
            <Paginacion
              paginaActual={pagina}
              totalPaginas={totalPaginas}
              onCambiarPagina={(p) => setPagina(p)}
              className="mt-8"
            />
          </>
        )}
      </div>
    </div>
  );
};
