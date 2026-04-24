"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapAlertType {
  tipo: string;
  quantidade: number;
}

export interface HeatmapPoint {
  bairro: string;
  lat: number;
  lng: number;
  peso: number;
  tipos_alerta: HeatmapAlertType[];
}

interface AlertHeatmapCardProps {
  points: HeatmapPoint[];
  updatedAt: string | null;
  sidebarOpen: boolean;
}

type HeatLayerFactory = {
  heatLayer: (latLngs: Array<[number, number, number]>, options?: Record<string, unknown>) => L.Layer;
};

function formatAlertName(alert: string): string {
  return alert.replaceAll("_", " ");
}

function formatUpdatedAt(value: string | null): string {
  if (!value) return "sem atualizacao";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "sem atualizacao";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export function AlertHeatmapCard({ points, updatedAt, sidebarOpen }: AlertHeatmapCardProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const maxWeight = useMemo(() => {
    return points.reduce((max, point) => Math.max(max, point.peso), 1);
  }, [points]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [-22.9068, -43.1729],
      zoom: 11,
      scrollWheelZoom: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      heatLayerRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current);
      markerLayerRef.current = null;
    }

    if (points.length === 0) {
      return;
    }

    const heatData: Array<[number, number, number]> = points.map((point) => [
      point.lat,
      point.lng,
      Math.max(0.2, point.peso / maxWeight)
    ]);

    const heatLayer = (L as typeof L & HeatLayerFactory).heatLayer(heatData, {
      radius: 30,
      blur: 18,
      minOpacity: 0.35,
      gradient: {
        0.25: "#93c5fd",
        0.5: "#f59e0b",
        0.75: "#f97316",
        1: "#C53030"
      }
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    const markerLayer = L.layerGroup();

    for (const point of points) {
      const details = point.tipos_alerta
        .slice(0, 4)
        .map((item) => `${item.quantidade} ${formatAlertName(item.tipo)}`)
        .join("<br/>");

      L.circleMarker([point.lat, point.lng], {
        radius: 10 + point.peso,
        color: "#004A8D",
        fillColor: "#004A8D",
        fillOpacity: 0.12,
        weight: 1
      })
        .bindPopup(
          `<strong>${point.bairro}</strong><br/>${point.peso} alertas ativos<br/>${details || "Sem detalhamento"}`
        )
        .addTo(markerLayer);
    }

    markerLayer.addTo(map);
    markerLayerRef.current = markerLayer;
  }, [maxWeight, points]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 320);

    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  return (
    <section className="rounded-lg border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-[#2D3748]">Mapa de Calor de Alertas</h3>
        <span className="text-xs font-medium text-[#525F6A]">Atualizado: {formatUpdatedAt(updatedAt)}</span>
      </div>
      <p className="mb-4 text-sm text-[#525F6A]">
        Intensidade maior indica concentracao de alertas ativos por bairro. Clique nos pontos para ver o tipo de alerta.
      </p>
      <div ref={mapContainerRef} className="h-[360px] w-full overflow-hidden rounded-lg border border-slate-200" />
      {points.length === 0 && (
        <p className="mt-3 text-sm text-[#525F6A]">Ainda nao ha pontos com alertas para exibir no mapa.</p>
      )}
    </section>
  );
}
