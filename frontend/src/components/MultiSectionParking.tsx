import { useState } from "react";
import { ChevronRight, Video } from "lucide-react";
import styles from "./MultiSectionParking.module.css";

const PARKING_SECTIONS = {
  AB: {
    name: "Section A & B",
    videoSource: "ws://localhost:8000/ws/stream/AB",
    boundingBoxes: "bounding_boxes_A.json",
    slots: [
      { id: "B1", section: "A", status: "empty", prediction: "available_now" },
      { id: "B2", section: "A", status: "occupied", prediction: "long_wait" },
    ],
  },
  C: {
    name: "Section C",
    videoSource: "ws://localhost:8000/ws/stream/C",
    boundingBoxes: "bounding_boxes_C.json",
    slots: [
      {
        id: "L1-1",
        section: "A",
        status: "empty",
        prediction: "available_soon",
      },
      {
        id: "L1-2",
        section: "B",
        status: "occupied",
        prediction: "available_later",
      },
    ],
  },
};

export default function MultiSectionParking() {
  const [currentSection, setCurrentSection] = useState("AB");
  const section = PARKING_SECTIONS[currentSection];

  const handleSectionChange = (sectionKey) => {
    setCurrentSection(sectionKey);
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumb}>
        <div className={styles.breadcrumbContent}>
          <span className={styles.label}>Parking Location:</span>
          <div className={styles.breadcrumbNav}>
            {Object.entries(PARKING_SECTIONS).map(([key, data]) => (
              <div key={key} className={styles.breadcrumbItem}>
                <button
                  onClick={() => handleSectionChange(key)}
                  className={`${styles.breadcrumbBtn} ${
                    currentSection === key ? styles.active : ""
                  }`}
                  aria-current={currentSection === key ? "page" : undefined}
                >
                  {data.name}
                </button>
                {key !==
                  Object.keys(PARKING_SECTIONS)[
                    Object.keys(PARKING_SECTIONS).length - 1
                  ] && <ChevronRight size={18} className={styles.separator} />}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className={styles.content}>
        {/* Surveillance Section */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Video size={20} />
            Surveillance - {section.name}
          </h3>
          <div className={styles.videoContainer}>
            <div className={styles.videoPlaceholder}>
              <p>Live stream from {section.name}</p>
              <small>{section.videoSource}</small>
            </div>
            <div className={styles.videoMeta}>
              <span className={styles.badge}>
                Active Bounding Boxes: {section.slots.length}
              </span>
              <span className={styles.badge}>{section.boundingBoxes}</span>
            </div>
          </div>
        </div>

        {/* Slot Grid */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Available Slots</h3>
          <div className={styles.slotGrid}>
            {section.slots.map((slot) => (
              <div
                key={slot.id}
                className={`${styles.slotCard} ${styles[slot.status]}`}
              >
                <div className={styles.slotId}>{slot.id}</div>
                <div className={styles.slotStatus}>
                  {slot.status.toUpperCase()}
                </div>
                <div className={styles.slotPrediction}>{slot.prediction}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
