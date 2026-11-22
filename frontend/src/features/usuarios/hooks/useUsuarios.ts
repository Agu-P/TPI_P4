import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsuariosApi,
  activarUsuarioApi,
  desactivarUsuarioApi,
} from '../api/usuarios';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuariosApi,
  });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activarUsuarioApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desactivarUsuarioApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
