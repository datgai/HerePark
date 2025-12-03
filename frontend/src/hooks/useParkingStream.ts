import { useState, useEffect, useRef } from "react";

interface SlotData {
  slot_id: string;
  section: string;
  status: string;
  confidence: number;
  bbox: number[];
  prediction?: string;
}

interface StatsData {
  total: number;
  occupied: number;
  empty: number;
  occupancy_rate: number;
}

interface PredictionData {
  time: string;
  minutes_ahead: number;
  predicted_occupancy: number;
  predicted_empty_slots: number;
}

interface PredictionResponse {
  predictions: PredictionData[];
  current_occupancy: number;
  message?: string;
}

interface ParkingStreamData {
  frame: string;
  slots: SlotData[];
  stats: StatsData;
  predictions: PredictionResponse | null;
}

export const useParkingStream = (section: string = "AB", url?: string) => {
  const [data, setData] = useState<ParkingStreamData>({
    frame: "",
    slots: [],
    stats: { total: 0, occupied: 0, empty: 0, occupancy_rate: 0 },
    predictions: null,
  });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastPredictionsRef = useRef<PredictionResponse | null>(null);

  useEffect(() => {
    // Build WebSocket URL with section parameter
    const wsUrl = url || `ws://localhost:8000/ws/stream/${section}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      setError("Failed to connect to parking stream");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.predictions) {
          lastPredictionsRef.current = parsed.predictions;
        }

        setData((prev) => ({
          frame: parsed.frame || prev.frame,
          slots: Array.isArray(parsed.slots) ? parsed.slots : [],
          stats: parsed.stats || prev.stats,
          predictions: lastPredictionsRef.current,
        }));
      } catch (err) {
        console.error("Error parsing stream data:", err);
      }
    };

    wsRef.current = ws;

    // Cleanup on unmount or section change
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [section, url]);

  return {
    data: {
      frame: data.frame || "",
      slots: data.slots || [],
      stats: data.stats || {
        total: 0,
        occupied: 0,
        empty: 0,
        occupancy_rate: 0,
      },
      predictions: data.predictions,
    },
    connected,
    error,
  };
};
