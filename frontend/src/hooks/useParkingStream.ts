import { useState, useEffect, useRef } from "react";

interface SlotData {
  id: number;
  status: string;
  confidence: number;
  bbox: number[];
}

interface StatsData {
  total: number;
  occupied: number;
  empty: number;
  occupancy_rate: number;
}

interface ParkingStreamData {
  frame: string;
  slots: SlotData[];
  stats: StatsData;
}

export const useParkingStream = (
  url: string = "ws://localhost:8000/ws/stream"
) => {
  const [data, setData] = useState<ParkingStreamData>({
    frame: "",
    slots: [],
    stats: { total: 0, occupied: 0, empty: 0, occupancy_rate: 0 },
  });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setData(parsed);
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [url]);

  return { data, connected };
};
