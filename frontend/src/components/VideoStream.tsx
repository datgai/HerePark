import { useParkingStream } from "../hooks/useParkingStream";
import styles from "./VideoStream.module.css";

interface VideoStreamProps {
  section?: string;
}

export const VideoStream = ({ section = "AB" }: VideoStreamProps) => {
  const { data, connected } = useParkingStream(section);

  return (
    <div className={styles.container}>
      <div className={styles.status}>
        <span className={connected ? styles.connected : styles.disconnected}>
          {connected ? "● Live" : "○ Disconnected"}
        </span>
      </div>

      {data.frame ? (
        <img
          src={`data:image/jpeg;base64,${data.frame}`}
          alt={`Parking lot stream - ${section}`}
          className={styles.video}
        />
      ) : (
        <div className={styles.placeholder}>Waiting for stream...</div>
      )}
    </div>
  );
};

export { useParkingStream };
