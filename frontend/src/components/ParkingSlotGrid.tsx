import styles from "./ParkingSlotGrid.module.css";

interface SlotData {
  slot_id: string;
  section: string;
  status: string;
  confidence: number;
  bbox: number[];
  prediction?: string;
}

interface Props {
  slots: SlotData[];
  compact?: boolean;
}

const PREDICTION_LABELS = {
  available_now: { text: "Now", color: "green" },
  available_soon: { text: "< 5 mins", color: "blue" },
  available_later: { text: "5 - 15 mins", color: "orange" },
  long_wait: { text: ">15 mins", color: "red" },
  unknown: { text: "Loading...", color: "gray" },
};

export const ParkingSlotGrid = ({ slots, compact = false }: Props) => {
  const sectionA = slots.filter((s) => s.section === "A");
  const sectionB = slots.filter((s) => s.section === "B");
  const sectionC = slots.filter((s) => s.section === "C");

  const renderSlot = (slot: SlotData) => {
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
          <span className={styles.label}>Current: </span>
          <br />
          <span className={`${styles.statusText} ${styles[slot.status]}`}>
            {slot.status.toUpperCase()}
          </span>
        </div>

        <div className={styles.prediction}>
          <span className={styles.label}>Availability: </span>
          <div
            className={`${styles.predictionBadge} ${styles[predInfo.color]}`}
          >
            <span className={styles.predText}>{predInfo.text}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, section: SlotData[]) => {
    if (section.length === 0) return null;

    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <div className={styles.grid}>{section.map(renderSlot)}</div>
      </div>
    );
  };

  if (slots.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>No slots detected</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {renderSection("Section A", sectionA)}
      {renderSection("Section B", sectionB)}
      {renderSection("Section C", sectionC)}
    </div>
  );
};
