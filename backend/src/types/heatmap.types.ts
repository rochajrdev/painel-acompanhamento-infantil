export interface HeatmapAlertTypeCount {
  tipo: string;
  quantidade: number;
}

export interface HeatmapPoint {
  bairro: string;
  lat: number;
  lng: number;
  peso: number;
  tipos_alerta: HeatmapAlertTypeCount[];
}

export interface HeatmapPayload {
  updated_at: string;
  points: HeatmapPoint[];
}
