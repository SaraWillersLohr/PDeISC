// controlador del dashboard � expone m�tricas al frontend
import { Request, Response } from "express";
import * as dashboardService from "../services/dashboardService";

// get /api/dashboard/summary � m�tricas del panel due�o/copropietario
// esta funci�n maneja la solicitud para obtener las m�tricas del panel de control,
// esas metricas incluyen el n�mero total de animales, el n�mero de animales por estado de salud,
// el n�mero de corrales y el n�mero de especies.
export async function summary(_req: Request, res: Response): Promise<void> {
  try {
    const data = await dashboardService.getDashboardSummary();
    res.json({ success: true, message: "métricas obtenidas", data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "error al obtener métricas";
    res.status(500).json({ success: false, message });
  }
}

