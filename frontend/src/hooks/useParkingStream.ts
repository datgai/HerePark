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
  const lastPredictionsRef = useRef<PredictionResponse | null>(null);
  const messageCountRef = useRef(0);

  useEffect(() => {
    console.log(`[HOOK] Section changed to: ${section}`);
    sectionRef.current = section;

    const connectWebSocket = () => {
      // Close existing connection BEFORE opening new one
      if (wsRef.current) {
        console.log(
          `[HOOK] Closing existing WebSocket (was connected to: ${sectionRef.current})`
        );
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000);
        }
        wsRef.current = null;
      }

      messageCountRef.current = 0;
      lastPredictionsRef.current = null;

      const wsUrl = url || `ws://localhost:8000/ws/stream/${section}`;
      console.log(`[HOOK] Creating NEW WebSocket to: ${wsUrl}`);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[HOOK] ✓ WebSocket OPEN for section: ${section}`);
        setConnected(true);
        setError(null);
      };

      ws.onclose = (event) => {
        console.log(
          `[HOOK] WebSocket CLOSED for ${section} - Code: ${event.code}, Current section: ${sectionRef.current}`
        );
        // Only set disconnected if this is still the active section
        if (sectionRef.current === section) {
          setConnected(false);
        }
      };

      ws.onerror = (event) => {
        console.error(`[HOOK] WebSocket ERROR for ${section}:`, event);
        if (sectionRef.current === section) {
          setError("Failed to connect to parking stream");
        }
      };

      ws.onmessage = (event) => {
        // Ignore messages from old sections
        if (sectionRef.current !== section) {
          console.log(
            `[HOOK] Ignoring message from old section ${section}, current: ${sectionRef.current}`
          );
          return;
        }

        try {
          const parsed = JSON.parse(event.data);
          messageCountRef.current++;

          // Log every 30 messages
          if (messageCountRef.current % 30 === 0) {
            console.log(
              `[HOOK] ${section} - Received ${messageCountRef.current} messages`,
              {
                slots: parsed.slots?.length || 0,
                occupancy: parsed.stats?.occupancy_rate?.toFixed(1) + "%",
                hasPredictions: !!parsed.predictions,
              }
            );
          }

          // Check if predictions changed
          const predictionsChanged =
            JSON.stringify(parsed.predictions) !==
            JSON.stringify(lastPredictionsRef.current);

          if (predictionsChanged) {
            console.log(
              `[HOOK] ${section} - Predictions updated:`,
              parsed.predictions
            );
            lastPredictionsRef.current = parsed.predictions;
          }

          setData({
            frame: parsed.frame || data.frame,
            slots: Array.isArray(parsed.slots) ? parsed.slots : [],
            stats: parsed.stats || data.stats,
            predictions: lastPredictionsRef.current,
            section: parsed.section,
          });
        } catch (err) {
          console.error("[HOOK] Parse error:", err);
        }
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      console.log(`[HOOK] Cleanup triggered for section ${section}`);
      if (wsRef.current && sectionRef.current === section) {
        console.log(`[HOOK] Closing WebSocket for section ${section}`);
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;

        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000);
        }
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
