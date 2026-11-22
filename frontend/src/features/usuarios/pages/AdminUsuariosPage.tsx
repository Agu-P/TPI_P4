import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Users, UserCheck, UserX, Shield, User } from 'lucide-react';
import {
  useUsuarios,
  useActivarUsuario,
  useDesactivarUsuario,
} from '../hooks/useUsuarios';
import { UserPublic } from '../types/usuario';
import { useAuthStore } from '../../../store/authStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/Card';
import { Skeleton } from '../../../shared/components/Skeleton';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { EstadoError } from '../../../shared/components/EstadoError';

const columnHelper = createColumnHelper<UserPublic>();

export const AdminUsuariosPage: React.FC = () => {
  const { data: usuarios, isLoading, isError, error, refetch } = useUsuarios();
  const { usuario: usuarioActual } = useAuthStore();

  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();

  const handleActivar = async (id: number) => {
    try {
      await activarMutation.mutateAsync(id);
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleDesactivar = async (user: UserPublic) => {
    if (confirm(`¿Desactivar la cuenta de ${user.username}? No podrá iniciar sesión hasta ser reactivado.`)) {
      try {
        await desactivarMutation.mutateAsync(user.id);
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
    columnHelper.accessor('username', {
      header: 'Usuario',
      cell: (info) => {
        const u = info.row.original;
        const esUsuarioSesion = usuarioActual?.id === u.id;
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{info.getValue()}</span>
            {esUsuarioSesion && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Tú
              </span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('full_name', {
      header: 'Nombre Completo',
      cell: (info) => <span className="text-sm text-slate-700">{info.getValue()}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <span className="text-xs text-slate-500 font-mono">{info.getValue()}</span>,
    }),
    columnHelper.accessor('role', {
      header: 'Rol',
      cell: (info) => {
        const role = info.getValue();
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              role === 'admin'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {role === 'admin' ? (
              <Shield className="w-3 h-3 text-amber-600" />
            ) : (
              <User className="w-3 h-3 text-slate-500" />
            )}
            {role === 'admin' ? 'Administrador' : 'Cliente'}
          </span>
        );
      },
    }),
    columnHelper.accessor('disabled', {
      header: 'Estado',
      cell: (info) => {
        const disabled = info.getValue();
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              disabled
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {disabled ? 'Desactivado' : 'Activo'}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const u = info.row.original;
        const esUsuarioSesion = usuarioActual?.id === u.id;

        return (
          <div className="flex items-center gap-2 justify-end">
            {u.disabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActivar(u.id)}
                isLoading={activarMutation.isPending}
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                title="Activar cuenta"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Activar
              </Button>
            ) : (
              /* REGLA: El botón Desactivar no se muestra en la fila del usuario de la sesión */
              !esUsuarioSesion && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDesactivar(u)}
                  isLoading={desactivarMutation.isPending}
                  title="Desactivar cuenta"
                >
                  <UserX className="w-3.5 h-3.5 mr-1" />
                  Desactivar
                </Button>
              )
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: usuarios || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualiza los usuarios registrados, sus roles y administra su activación
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Listado de Usuarios</CardTitle>
          <span className="text-xs text-slate-500">
            Total registrados: <strong>{usuarios?.length || 0}</strong>
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
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
          ) : !usuarios || usuarios.length === 0 ? (
            <div className="p-8">
              <EstadoVacio titulo="No se encontraron usuarios registrados" />
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
    </div>
  );
};
