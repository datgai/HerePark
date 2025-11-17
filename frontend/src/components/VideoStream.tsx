import { useParkingStream } from "../hooks/useParkingStream";
import styles from "./VideoStream.module.css";

export const VideoStream = () => {
  const { data, connected } = useParkingStream();

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
          alt="Parking lot stream"
          className={styles.video}
        />
      ) : (
        <div className={styles.placeholder}>Waiting for stream...</div>
      )}
    </div>
  );
};

export { useParkingStream };
