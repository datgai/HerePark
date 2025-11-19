import { useState, useEffect, useRef } from "react";

interface SlotData {
  slot_id: string;
  section: string;
  status: string;
  confidence: number;
  bbox: number[];
  predictions: {
    [minutes: number]: string;
  };
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

export const useParkingStream = (
  url: string = "ws://localhost:8000/ws/stream"
) => {
  const [data, setData] = useState<ParkingStreamData>({
    frame: "",
    slots: [],
    stats: { total: 0, occupied: 0, empty: 0, occupancy_rate: 0 },
    predictions: null,
  });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const lastPredictionsRef = useRef<PredictionResponse | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);

      if (parsed.predictions) {
        lastPredictionsRef.current = parsed.predictions;
      }

      setData({
        ...parsed,
        predictions: lastPredictionsRef.current,
      });
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [url]);

  return { data, connected };
};
