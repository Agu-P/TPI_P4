import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductosApi,
  createProductoApi,
  updateProductoApi,
  updateProductoStockApi,
  deleteProductoApi,
} from '../api/productos';
import {
  FiltrosProductos,
  ProductoCreate,
  ProductoUpdate,
  ProductoStockUpdate,
} from '../types/producto';

export function useProductos(filtros?: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductosApi(filtros),
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductoCreate) => createProductoApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      updateProductoApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) =>
      updateProductoStockApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductoApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}
