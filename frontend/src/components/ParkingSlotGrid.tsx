import styles from "./ParkingSlotGrid.module.css";

interface SlotData {
  slot_id: string;
  section: string;
  status: string;
  confidence: number;
  prediction?: string;
  predictions?: {
    [minutes: number]: string;
  };
}

interface Props {
  slots: SlotData[];
}

const PREDICTION_LABELS = {
  available_now: { text: "Now", color: "green", icon: "" },
  available_soon: { text: "< 5 mins", color: "blue", icon: "" },
  available_later: { text: "5 - 15 mins", color: "orange", icon: "" },
  long_wait: { text: ">15 mins", color: "red", icon: "" },
  unknown: { text: "Loading...", color: "gray", icon: "" },
};

export const ParkingSlotGrid = ({ slots }: Props) => {
  const sectionA = slots.filter((s) => s.section === "A");
  const sectionB = slots.filter((s) => s.section === "B");

  const renderSlot = (slot: SlotData) => {
    console.log(`Slot ${slot.slot_id} full data:`, JSON.stringify(slot));
    const predInfo =
      PREDICTION_LABELS[slot.prediction as keyof typeof PREDICTION_LABELS] ||
      PREDICTION_LABELS.unknown;

    return (
      <div
        key={slot.slot_id}
        className={`${styles.slotCard} ${styles[predInfo.color]}`}
      >
        <div className={styles.slotHeader}>
          <span className={styles.slotId}>{slot.slot_id}</span>
        </div>

        <div className={styles.currentStatus}>
          <span className={styles.label}>Current : </span>
          <span className={`${styles.statusText} ${styles[slot.status]}`}>
            {slot.status.toUpperCase()}
          </span>
        </div>

        <div className={styles.prediction}>
          <span className={styles.label}>Availability:</span>
          <div
            className={`${styles.predictionBadge} ${styles[predInfo.color]}`}
          >
            <span className={styles.predText}>{predInfo.text}</span>
          </div>
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
