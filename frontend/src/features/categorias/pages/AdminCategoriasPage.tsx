import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useForm } from '@tanstack/react-form';
import { Plus, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';
import {
  useCategorias,
  useCreateCategoria,
  useUpdateCategoria,
  useDeleteCategoria,
} from '../hooks/useCategorias';
import { Categoria } from '../types/categoria';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/Card';
import { Modal } from '../../../shared/ui/Modal';
import { Input } from '../../../shared/ui/Input';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { EstadoError } from '../../../shared/components/EstadoError';

const columnHelper = createColumnHelper<Categoria>();

export const AdminCategoriasPage: React.FC = () => {
  const { data: categorias, isLoading, isError, error, refetch } = useCategorias();
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: editingCategoria?.nombre || '',
      descripcion: editingCategoria?.descripcion || '',
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (editingCategoria) {
          await updateMutation.mutateAsync({
            id: editingCategoria.id,
            data: {
              nombre: value.nombre,
              descripcion: value.descripcion || null,
            },
          });
        } else {
          await createMutation.mutateAsync({
            nombre: value.nombre,
            descripcion: value.descripcion || null,
          });
        }
        setModalOpen(false);
        setEditingCategoria(null);
      } catch (err) {
        setFormError(handleApiError(err));
      }
    },
  });

  const handleOpenCreate = () => {
    setEditingCategoria(null);
    form.reset({ nombre: '', descripcion: '' });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    form.reset({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Dar de baja esta categoría? Sus productos continuarán asociados pero la categoría quedará inactiva.')) {
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
      cell: (info) => <span className="text-slate-500 font-mono text-xs">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('nombre', {
      header: 'Nombre',
      cell: (info) => (
        <span className="font-semibold text-slate-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-500 shrink-0" />
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: (info) => (
        <span className="text-slate-500 text-sm">{info.getValue() || '—'}</span>
      ),
    }),
    columnHelper.accessor('activo', {
      header: 'Estado',
      cell: (info) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            info.getValue()
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {info.getValue() ? 'Activa' : 'Inactiva'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const cat = info.row.original;
        return (
          <div className="flex items-center gap-1.5 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(cat)}
              title="Editar categoría"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(cat.id)}
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
    data: categorias || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Categorías</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra las categorías del menú de comidas
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-base">Listado de Categorías</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="p-6">
              <EstadoError
                mensaje={handleApiError(error)}
                onReintentar={() => refetch()}
              />
            </div>
          ) : !categorias || categorias.length === 0 ? (
            <div className="p-8">
              <EstadoVacio
                titulo="No hay categorías registradas"
                descripcion="Crea la primera categoría para clasificar los platos y bebidas."
                accionTexto="Crear Categoría"
                onAccion={handleOpenCreate}
              />
            </div>
          ) : (
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
                        <td key={cell.id} className="px-6 py-4 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
                if (value.length > 100) return 'El nombre no puede superar 100 caracteres';
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Nombre de la categoría"
                placeholder="ej: Pizzas, Pastas..."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
                  placeholder="Breve detalle de los productos incluidos..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit}
                  isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                >
                  {editingCategoria ? 'Guardar Cambios' : 'Crear'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Modal>
    </div>
  );
};
