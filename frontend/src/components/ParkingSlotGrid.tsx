import styles from "./ParkingSlotGrid.module.css";

interface SlotData {
  slot_id: string;
  section: string;
  status: string;
  confidence: number;
  predictions: {
    [minutes: number]: string;
  };
}

interface Props {
  slots: SlotData[];
}

export const ParkingSlotGrid = ({ slots }: Props) => {
  const sectionA = slots.filter((s) => s.section === "A");
  const sectionB = slots.filter((s) => s.section === "B");

  const renderSlot = (slot: SlotData) => {
    const hasPredictions = Object.keys(slot.predictions).length > 0;

    return (
      <div key={slot.slot_id} className={styles.slotCard}>
        <div className={styles.slotHeader}>
          <span className={styles.slotId}>{slot.slot_id}</span>
          <span className={`${styles.statusBadge} ${styles[slot.status]}`}>
            {slot.status === "occupied" ? "🚗" : "✓"}
          </span>
        </div>

        <div className={styles.currentStatus}>
          <span className={styles.label}>Current:</span>
          <span className={`${styles.statusText} ${styles[slot.status]}`}>
            {slot.status.toUpperCase()}
          </span>
        </div>

        {hasPredictions && (
          <div className={styles.predictions}>
            <span className={styles.label}>Predicted:</span>
            <div className={styles.predictionList}>
              {[15, 30, 45, 60].map(
                (min) =>
                  slot.predictions[min] && (
                    <div key={min} className={styles.predictionItem}>
                      <span className={styles.time}>+{min}min</span>
                      <span
                        className={`${styles.predStatus} ${styles[slot.predictions[min]]}`}
                      >
                        {slot.predictions[min] === "occupied" ? "🚗" : "✓"}
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        <div className={styles.confidence}>
          {(slot.confidence * 100).toFixed(0)}% conf
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Section A</h3>
        <div className={styles.grid}>
          {sectionA.length > 0 ? (
            sectionA.map(renderSlot)
          ) : (
            <p className={styles.empty}>No slots detected</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Section B</h3>
        <div className={styles.grid}>
          {sectionB.length > 0 ? (
            sectionB.map(renderSlot)
          ) : (
            <p className={styles.empty}>No slots detected</p>
          )}
        </div>
      </div>
    </div>
  );
};
