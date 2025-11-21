import styles from "./AvailabilityList.module.css";

interface SlotData {
  slot_id: string;
  section: string;
  status: string;
  confidence: number;
  prediction?: string;
}

interface Props {
  slots: SlotData[];
}

const PRIORITY_ORDER = {
  available_now: 0,
  available_soon: 1,
  available_later: 2,
  long_wait: 3,
  unknown: 4,
};

const PREDICTION_INFO = {
  available_now: {
    text: "Free Now",
    color: "green",
    icon: "",
    time: "Available Now",
  },
  available_soon: {
    text: "Free <5min",
    color: "blue",
    icon: "",
    time: "< 5 min",
  },
  available_later: {
    text: "Wait 5-15min",
    color: "orange",
    icon: "",
    time: "5 - 15 min",
  },
  long_wait: { text: "Wait >15min", color: "red", icon: "", time: ">15 min" },
  unknown: { text: "Loading...", color: "gray", icon: "", time: "..." },
};

export const AvailabilityList = ({ slots }: Props) => {
  const sortedSlots = [...slots].sort((a, b) => {
    const priorityA =
      PRIORITY_ORDER[a.prediction as keyof typeof PRIORITY_ORDER] ?? 4;
    const priorityB =
      PRIORITY_ORDER[b.prediction as keyof typeof PRIORITY_ORDER] ?? 4;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.slot_id.localeCompare(b.slot_id);
  });

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {sortedSlots.map((slot) => {
          const predInfo =
            PREDICTION_INFO[slot.prediction as keyof typeof PREDICTION_INFO] ||
            PREDICTION_INFO.unknown;

          return (
            <div
              key={slot.slot_id}
              className={`${styles.slotItem} ${styles[`bg_${predInfo.color}`]}`}
            >
              <div className={styles.slotInfo}>
                <span className={styles.section}>
                  <b>Section {slot.section}:</b>
                </span>
                <br />
                <span className={styles.slotId}> Slot {slot.slot_id}</span>
              </div>

              <div className={styles.timeInfo}>
                <span
                  className={`${styles.timeBadge} ${styles[predInfo.color]}`}
                >
                  {predInfo.icon} {predInfo.time}
                </span>
              </div>

              <div className={styles.statusIndicator}>
                <span
                  className={`${styles[slot.status]} ${styles[predInfo.color]}`}
                ></span>
              </div>
            </div>
          );
        })}
      </div>

      {sortedSlots.length === 0 && (
        <p className={styles.empty}>No slots detected</p>
      )}
    </div>
  );
};
