import { childrenRepository } from "../repositories/children.repository.js";
import type {
  HeatmapAlertTypeCount,
  HeatmapPayload,
  HeatmapPoint
} from "../types/heatmap.types.js";

type BairroCoordinates = {
  lat: number;
  lng: number;
};

const bairroCoordinates: Record<string, BairroCoordinates> = {
  rocinha: { lat: -22.9886, lng: -43.2482 },
  mare: { lat: -22.8591, lng: -43.2463 },
  jacarezinho: { lat: -22.8926, lng: -43.2538 },
  "complexo do alemao": { lat: -22.8571, lng: -43.2715 },
  mangueira: { lat: -22.9102, lng: -43.2327 }
};

function normalizeBairroName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function collectAlerts(child: {
  saude: { alertas?: string[] } | null;
  educacao: { alertas?: string[] } | null;
  assistencia_social: { alertas?: string[] } | null;
}): string[] {
  return [
    ...(child.saude?.alertas ?? []),
    ...(child.educacao?.alertas ?? []),
    ...(child.assistencia_social?.alertas ?? [])
  ];
}

function sortAlertTypes(alertTypeMap: Map<string, number>): HeatmapAlertTypeCount[] {
  return Array.from(alertTypeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, quantidade]) => ({ tipo, quantidade }));
}

export class HeatmapService {
  async getAlertsHeatmap(): Promise<HeatmapPayload> {
    const children = await childrenRepository.findForHeatmap();

    const byBairro = new Map<string, HeatmapPoint>();
    const alertTypeByBairro = new Map<string, Map<string, number>>();

    for (const child of children) {
      const normalizedBairro = normalizeBairroName(child.bairro);
      const coordinates = bairroCoordinates[normalizedBairro];

      if (!coordinates) {
        continue;
      }

      const alerts = collectAlerts(child);

      if (alerts.length === 0) {
        continue;
      }

      const existing = byBairro.get(child.bairro);

      if (!existing) {
        byBairro.set(child.bairro, {
          bairro: child.bairro,
          lat: coordinates.lat,
          lng: coordinates.lng,
          peso: alerts.length,
          tipos_alerta: []
        });
      } else {
        existing.peso += alerts.length;
      }

      if (!alertTypeByBairro.has(child.bairro)) {
        alertTypeByBairro.set(child.bairro, new Map<string, number>());
      }

      const alertTypeMap = alertTypeByBairro.get(child.bairro);

      if (!alertTypeMap) {
        continue;
      }

      for (const alert of alerts) {
        alertTypeMap.set(alert, (alertTypeMap.get(alert) ?? 0) + 1);
      }
    }

    const points = Array.from(byBairro.values())
      .map((point) => ({
        ...point,
        tipos_alerta: sortAlertTypes(alertTypeByBairro.get(point.bairro) ?? new Map())
      }))
      .sort((a, b) => b.peso - a.peso);

    return {
      updated_at: new Date().toISOString(),
      points
    };
  }
}

export const heatmapService = new HeatmapService();
