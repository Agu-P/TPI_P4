import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import { Plus, Edit2, Trash2, Sliders, AlertCircle, Check, X } from 'lucide-react';
import {
  useProductos,
  useCreateProducto,
  useUpdateProducto,
  useUpdateStock,
  useDeleteProducto,
} from '../hooks/useProductos';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { Producto } from '../types/producto';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/Card';
import { Modal } from '../../../shared/ui/Modal';
import { Input } from '../../../shared/ui/Input';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { EstadoError } from '../../../shared/components/EstadoError';

const columnHelper = createColumnHelper<Producto>();

export const AdminProductosPage: React.FC = () => {
   const { data: productosData, isLoading, isError, error, refetch } = useProductos({
    skip: 0,
    limit: 100,
  });
  const { data: categorias } = useCategorias();

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const updateStockMutation = useUpdateStock();
  const deleteMutation = useDeleteProducto();

  // Estados modales
  const [modalAbmOpen, setModalAbmOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [stockProducto, setStockProducto] = useState<Producto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Formulario ABM
  const abmForm = useForm({
    defaultValues: {
      nombre: editingProducto?.nombre || '',
      descripcion: editingProducto?.descripcion || '',
      precio_base: editingProducto?.precio_base || 0,
      imagen_url: editingProducto?.imagen_url || '',
      stock: editingProducto?.stock || 0,
      disponible: editingProducto?.disponible ?? true,
      categoria_id: editingProducto?.categoria_id || (categorias?.[0]?.id ?? 1),
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (editingProducto) {
          await updateMutation.mutateAsync({
            id: editingProducto.id,
            data: {
              nombre: value.nombre,
              descripcion: value.descripcion || null,
              precio_base: Number(value.precio_base),
              imagen_url: value.imagen_url || null,
              stock: Number(value.stock),
              disponible: value.disponible,
              categoria_id: Number(value.categoria_id),
            },
          });
        } else {
          await createMutation.mutateAsync({
            nombre: value.nombre,
            descripcion: value.descripcion || null,
            precio_base: Number(value.precio_base),
            imagen_url: value.imagen_url || null,
            stock: Number(value.stock),
            disponible: value.disponible,
            categoria_id: Number(value.categoria_id),
          });
        }
        setModalAbmOpen(false);
        setEditingProducto(null);
      } catch (err) {
        setFormError(handleApiError(err));
      }
    },
  });

  // Formulario Stock Rápido
  const [rapidoStock, setRapidoStock] = useState(0);
  const [rapidoDisponible, setRapidoDisponible] = useState(true);

  const handleOpenCreate = () => {
    setEditingProducto(null);
    abmForm.reset({
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
      categoria_id: categorias?.[0]?.id ?? 1,
    });
    setFormError(null);
    setModalAbmOpen(true);
  };

  const handleOpenEdit = (prod: Producto) => {
    setEditingProducto(prod);
    abmForm.reset({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio_base: prod.precio_base,
      imagen_url: prod.imagen_url || '',
      stock: prod.stock,
      disponible: prod.disponible,
      categoria_id: prod.categoria_id,
    });
    setFormError(null);
    setModalAbmOpen(true);
  };

  const handleOpenStock = (prod: Producto) => {
    setStockProducto(prod);
    setRapidoStock(prod.stock);
    setRapidoDisponible(prod.disponible);
    setFormError(null);
    setModalStockOpen(true);
  };

  const handleGuardarStock = async () => {
    if (!stockProducto) return;
    setFormError(null);
    try {
      await updateStockMutation.mutateAsync({
        id: stockProducto.id,
        data: {
          stock: rapidoStock,
          disponible: rapidoDisponible,
        },
      });
      setModalStockOpen(false);
      setStockProducto(null);
    } catch (err) {
      setFormError(handleApiError(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Dar de baja este producto? Dejará de mostrarse en el catálogo público.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        alert(handleApiError(err));
      }
    }
  };

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => <span className="font-mono text-xs text-slate-400">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('nombre', {
      header: 'Producto',
      cell: (info) => {
        const prod = info.row.original;
        return (
          <div className="flex items-center gap-3">
            {prod.imagen_url ? (
              <img
                src={prod.imagen_url}
                alt={prod.nombre}
                className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold shrink-0">
                FS
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-800 block">{prod.nombre}</span>
              <span className="text-xs text-slate-400">
                {prod.categoria?.nombre || `Cat #${prod.categoria_id}`}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('precio_base', {
      header: 'Precio',
      cell: (info) => (
        <span className="font-semibold text-slate-900">
          ${info.getValue().toLocaleString('es-AR')}
        </span>
      ),
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      cell: (info) => {
        const stock = info.getValue();
        return (
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded-full font-bold ${
              stock <= 0
                ? 'bg-rose-100 text-rose-700'
                : stock <= 5
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {stock} u.
          </span>
        );
      },
    }),
    columnHelper.accessor('disponible', {
      header: 'Disponible',
      cell: (info) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            info.getValue() ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {info.getValue() ? (
            <>
              <Check className="w-3.5 h-3.5" /> Sí
            </>
          ) : (
            <>
              <X className="w-3.5 h-3.5" /> No
            </>
          )}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const prod = info.row.original;
        return (
          <div className="flex items-center gap-1.5 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenStock(prod)}
              title="Ajustar Stock y Disponibilidad"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(prod)}
              title="Editar producto"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(prod.id)}
              disabled={deleteMutation.isPending}
              title="Dar de baja"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: productosData?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Productos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra el catálogo, precios, stock y disponibilidad de platos
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Listado de Productos</CardTitle>
          <span className="text-xs text-slate-500">
            Total activos: <strong>{productosData?.total || 0}</strong>
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <div className="p-6">
              <EstadoError
                mensaje={handleApiError(error)}
                onReintentar={() => refetch()}
              />
            </div>
          ) : !productosData || productosData.items.length === 0 ? (
            <div className="p-8">
              <EstadoVacio
                titulo="No hay productos activos"
                descripcion="Agrega el primer producto al catálogo para comenzar las ventas."
                accionTexto="Crear Producto"
                onAccion={handleOpenCreate}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/75">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-3.5 text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación cliente TanStack Table */}
              <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <div>
                  Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal ABM Crear / Editar */}
      <Modal
        isOpen={modalAbmOpen}
        onClose={() => setModalAbmOpen(false)}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            abmForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <abmForm.Field
              name="nombre"
              validators={{
                onChange: ({ value }) => (!value ? 'El nombre es requerido' : undefined),
              }}
            >
              {(field) => (
                <Input
                  label="Nombre"
                  placeholder="ej: Hamburguesa Triple Queso"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors?.[0]}
                />
              )}
            </abmForm.Field>

            <abmForm.Field name="categoria_id">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  >
                    {categorias?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </abmForm.Field>
          </div>

          <abmForm.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  placeholder="Ingredientes, detalles de preparación..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </abmForm.Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <abmForm.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) => (Number(value) < 0 ? 'No puede ser negativo' : undefined),
              }}
            >
              {(field) => (
                <Input
                  label="Precio Base ($)"
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors?.[0]}
                />
              )}
            </abmForm.Field>

            <abmForm.Field
              name="stock"
              validators={{
                onChange: ({ value }) => (Number(value) < 0 ? 'No puede ser negativo' : undefined),
              }}
            >
              {(field) => (
                <Input
                  label="Stock Inicial"
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors?.[0]}
                />
              )}
            </abmForm.Field>

            <abmForm.Field name="disponible">
              {(field) => (
                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    Disponible para venta
                  </label>
                </div>
              )}
            </abmForm.Field>
          </div>

          <abmForm.Field name="imagen_url">
            {(field) => (
              <Input
                label="URL de la Imagen"
                placeholder="https://ejemplo.com/foto.jpg"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </abmForm.Field>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalAbmOpen(false)}>
              Cancelar
            </Button>
            <abmForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit}
                  isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                >
                  {editingProducto ? 'Guardar Cambios' : 'Crear Producto'}
                </Button>
              )}
            </abmForm.Subscribe>
          </div>
        </form>
      </Modal>

      {/* Modal Ajuste Rápido de Stock */}
      <Modal
        isOpen={modalStockOpen}
        onClose={() => setModalStockOpen(false)}
        title={`Ajustar Stock: ${stockProducto?.nombre || ''}`}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {formError}
          </div>
        )}
        <div className="space-y-4">
          <Input
            label="Unidades en stock"
            type="number"
            min="0"
            value={rapidoStock}
            onChange={(e) => setRapidoStock(Math.max(0, parseInt(e.target.value) || 0))}
          />

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={rapidoDisponible}
              onChange={(e) => setRapidoDisponible(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
            Habilitar disponibilidad inmediata
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModalStockOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleGuardarStock}
              isLoading={updateStockMutation.isPending}
            >
              Actualizar Stock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
