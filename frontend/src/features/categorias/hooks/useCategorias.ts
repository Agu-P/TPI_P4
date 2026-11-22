import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategoriasApi,
  createCategoriaApi,
  updateCategoriaApi,
  deleteCategoriaApi,
} from '../api/categorias';
import { CategoriaCreate, CategoriaUpdate } from '../types/categoria';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategoriasApi,
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriaCreate) => createCategoriaApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      updateCategoriaApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoriaApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}
