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
}

interface ParkingStreamData {
  frame: string;
  slots: SlotData[];
  stats: StatsData;
  predictions: PredictionResponse | null;
  section?: string;
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
  const sectionRef = useRef<string>(section);

  useEffect(() => {
    sectionRef.current = section;

    // Close existing connection before opening new one
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }

    const wsUrl = url || `ws://localhost:8000/ws/stream/${section}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      if (sectionRef.current === section) {
        setConnected(false);
      }
    };

    ws.onerror = () => {
      if (sectionRef.current === section) {
        setError("Failed to connect to parking stream");
      }
    };

    ws.onmessage = (event) => {
      // Ignore messages from old sections
      if (sectionRef.current !== section) return;

      try {
        const parsed = JSON.parse(event.data);

        setData({
          frame: parsed.frame || "",
          slots: Array.isArray(parsed.slots) ? parsed.slots : [],
          stats: parsed.stats || {
            total: 0,
            occupied: 0,
            empty: 0,
            occupancy_rate: 0,
          },
          predictions: parsed.predictions || null,
          section: parsed.section,
        });
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    wsRef.current = ws;

    return () => {
      if (sectionRef.current === section && wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
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
