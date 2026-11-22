import { axiosInstance } from '../../../shared/api/axiosInstance';
import { UserPublic } from '../types/usuario';

export async function getUsuariosApi(): Promise<UserPublic[]> {
  const res = await axiosInstance.get<UserPublic[]>('/admin/usuarios');
  return res.data;
}

export async function activarUsuarioApi(id: number): Promise<UserPublic> {
  const res = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/activar`);
  return res.data;
}

export async function desactivarUsuarioApi(id: number): Promise<UserPublic> {
  const res = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/desactivar`);
  return res.data;
}
