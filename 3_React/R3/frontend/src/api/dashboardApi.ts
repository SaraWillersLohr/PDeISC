/** api del dashboard — métricas desde el backend */
import axiosInstance from './axiosInstance';
import type { DashboardSummary } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** obtengo resumen de métricas para el panel admin */
export async function getDashboardSummaryApi(): Promise<DashboardSummary> {
  const { data } = await axiosInstance.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
  if (!data.success) throw new Error(data.message);
  return data.data;
}
