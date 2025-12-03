import { useState } from "react";
import { ChevronRight, Video } from "lucide-react";
import style from "./Parking.module.css";
import { VideoStream } from "../../../components/VideoStream";
import { AvailabilityList } from "../../../components/AvailabilityList";
import { ParkingSlotGrid } from "../../../components/ParkingSlotGrid";
import { useParkingStream } from "../../../hooks/useParkingStream";

const PARKING_SECTIONS = {
  AB: {
    name: "Section A & B",
    description: "Main Parking",
  },
  C: {
    name: "Section C",
    description: "Outside Parking",
  },
};

function Parking() {
  const [currentSection, setCurrentSection] = useState("AB");
  const { data } = useParkingStream(currentSection);

  const section = PARKING_SECTIONS[currentSection];
  const sectionKeys = Object.keys(PARKING_SECTIONS);
  const currentIndex = sectionKeys.indexOf(currentSection);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < sectionKeys.length - 1;

  const handlePrevSection = () => {
    if (canGoPrev) {
      setCurrentSection(sectionKeys[currentIndex - 1]);
    }
  };

  const handleNextSection = () => {
    if (canGoNext) {
      setCurrentSection(sectionKeys[currentIndex + 1]);
    }
  };

  const handleSectionClick = (sectionKey) => {
    setCurrentSection(sectionKey);
  };

  return (
    <section className={style.parkingContent}>
      {/* Breadcrumb Navigation */}
      <nav className={style.breadcrumb}>
        <div className={style.breadcrumbContent}>
          <span className={style.breadcrumbLabel}>Location:</span>
          <div className={style.breadcrumbNav}>
            {sectionKeys.map((key, idx) => (
              <div key={key} className={style.breadcrumbItem}>
                <button
                  onClick={() => handleSectionClick(key)}
                  className={`${style.breadcrumbBtn} ${
                    currentSection === key ? style.active : ""
                  }`}
                  aria-current={currentSection === key ? "page" : undefined}
                >
                  {PARKING_SECTIONS[key].name}
                </button>
                {idx < sectionKeys.length - 1 && (
                  <ChevronRight size={18} className={style.separator} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={style.sectionInfo}>
          <p className={style.sectionDesc}>{section.description}</p>
        </div>
      </nav>

      {/* Header */}
      <header className={style.header}>Parking - {section.name}</header>

      {/* Main Content */}
      <div className={style.row} id={style.live}>
        {/* Video Surveillance - Pass section here */}
        <div className={`${style.card} ${style.surveillance}`}>
          <h3>
            <Video size={20} />
            Surveillance
          </h3>
          <VideoStream section={currentSection} />
          <small className={style.streamMeta}>
            Stream: {currentSection} | Source: parking_{currentSection}.mp4
          </small>
        </div>

        {/* Availability Predictions */}
        <div className={`${style.card} ${style.prediction}`}>
          <h3>Availability Prediction</h3>
          <AvailabilityList slots={data.slots} />
          <small>Updated every ~2 seconds</small>
        </div>
      </div>

      {/* Parking Layout */}
      <div className={style.row}>
        <div className={style.card}>
          <h3>Layout - {section.name}</h3>
          <ParkingSlotGrid slots={data.slots} />
        </div>
      </div>

      {/* Section Navigation */}
      <div className={style.sectionNav}>
        <button
          onClick={handlePrevSection}
          disabled={!canGoPrev}
          className={style.navBtn}
          aria-label="Previous section"
        >
          ← Previous
        </button>
        <span className={style.navIndicator}>
          Section {currentIndex + 1} of {sectionKeys.length}
        </span>
        <button
          onClick={handleNextSection}
          disabled={!canGoNext}
          className={style.navBtn}
          aria-label="Next section"
        >
          Next →
        </button>
      </div>
    </section>
  );
}

export default Parking;
