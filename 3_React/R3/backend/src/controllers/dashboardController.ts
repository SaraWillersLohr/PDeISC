/** controlador del dashboard — expone métricas al frontend */
import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';

/** GET /api/dashboard/summary — métricas del panel dueño/copropietario */
export async function summary(_req: Request, res: Response): Promise<void> {
  try {
    const data = await dashboardService.getDashboardSummary();
    res.json({ success: true, message: 'métricas obtenidas', data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'error al obtener métricas';
    res.status(500).json({ success: false, message });
  }
}
