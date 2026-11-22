import { axiosInstance } from '../../../shared/api/axiosInstance';
import { RegisterData, UserPublic } from '../types/auth';

export async function registerApi(data: RegisterData): Promise<UserPublic> {
  const res = await axiosInstance.post<UserPublic>('/auth/register', data);
  return res.data;
}

export async function loginApi(username: string, password: string): Promise<{ message: string }> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const res = await axiosInstance.post<{ message: string }>('/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
}

export async function logoutApi(): Promise<{ message: string }> {
  const res = await axiosInstance.post<{ message: string }>('/auth/logout');
  return res.data;
}

export async function getMeApi(): Promise<UserPublic> {
  const res = await axiosInstance.get<UserPublic>('/auth/me');
  return res.data;
}
