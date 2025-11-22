import { useState, useEffect } from "react";
import { MapPin, Info, ChevronDown, ChevronUp } from "lucide-react";
import { ParkingStats } from "../components/ParkingStats";
import { ParkingSlotGrid } from "../components/ParkingSlotGrid";
import { AvailabilityList } from "../components/AvailabilityList";
import { useParkingStream } from "../hooks/useParkingStream";
import "./HomePage.css";

interface CardVisibility {
  stats: boolean;
  predictions: boolean;
  availability: boolean;
  layout: boolean;
}

export default function HomePage() {
  const { data, connected, error } = useParkingStream();
  const [selectedSection, setSelectedSection] = useState("all");
  const [cardVisibility, setCardVisibility] = useState<CardVisibility>({
    stats: true,
    predictions: true,
    availability: true,
    layout: true,
  });

  const toggleCard = (card: keyof CardVisibility) => {
    setCardVisibility((prev) => ({
      ...prev,
      [card]: !prev[card],
    }));
  };

  const filteredSlots =
    selectedSection === "all"
      ? data.slots
      : data.slots.filter((s) => s.section === selectedSection);

  return (
    <div className="homepage">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-content">
          <div className="header-top">
            <h1>HerePark</h1>
            <div
              className={`status-dot ${connected ? "connected" : "disconnected"}`}
              title={connected ? "Connected" : "Disconnected"}
            />
          </div>
          <p className="header-location">
            <MapPin /> Building A - Basement Parking
          </p>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="homepage-main">
        {/* Stats Section */}
        {cardVisibility.stats && (
          <section className="card-section">
            <button
              className="card-header-btn"
              onClick={() => toggleCard("stats")}
              aria-label="Toggle stats"
            >
              <h2>Parking Overview</h2>
              <ChevronUp />
            </button>
            <div className="card-content">
              <ParkingStats stats={data.stats} />
            </div>
          </section>
        )}

        {/* Collapsed Stats Button */}
        {!cardVisibility.stats && (
          <button
            className="card-collapsed-btn"
            onClick={() => toggleCard("stats")}
          >
            <span>Parking Overview</span>
            <ChevronDown />
          </button>
        )}

        {/* Predictions Section */}
        {data.predictions?.predictions &&
          data.predictions.predictions.length > 0 && (
            <>
              {cardVisibility.predictions && (
                <section className="card-section">
                  <button
                    className="card-header-btn"
                    onClick={() => toggleCard("predictions")}
                    aria-label="Toggle predictions"
                  >
                    <div className="card-title">
                      <Info />
                      Next 15 Minutes
                    </div>
                    <ChevronUp />
                  </button>
                  <div className="card-content">
                    <div className="predictions-grid">
                      {data.predictions.predictions
                        .slice(0, 3)
                        .map((pred, idx) => (
                          <div key={idx} className="prediction-box">
                            <div className="pred-time">
                              {pred.minutes_ahead}m
                            </div>
                            <div className="pred-occupancy">
                              {Math.round(pred.predicted_occupancy)}%
                            </div>
                            <div className="pred-slots">
                              {pred.predicted_empty_slots} slots
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </section>
              )}

              {!cardVisibility.predictions && (
                <button
                  className="card-collapsed-btn"
                  onClick={() => toggleCard("predictions")}
                >
                  <span>Next 15 Minutes</span>
                  <ChevronDown />
                </button>
              )}
            </>
          )}

        {/* Section Filter */}
        <div className="section-filter">
          {["all", "A", "B"].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`filter-btn ${selectedSection === sec ? "active" : ""}`}
              aria-pressed={selectedSection === sec}
            >
              {sec === "all" ? "All" : `Sec ${sec}`}
            </button>
          ))}
        </div>

        {/* Availability Section */}
        {cardVisibility.availability && (
          <section className="card-section">
            <button
              className="card-header-btn"
              onClick={() => toggleCard("availability")}
              aria-label="Toggle availability list"
            >
              <h2>Available Slots</h2>
              <ChevronUp />
            </button>
            <div className="card-content">
              <AvailabilityList slots={filteredSlots} compact={true} />
            </div>
          </section>
        )}

        {!cardVisibility.availability && (
          <button
            className="card-collapsed-btn"
            onClick={() => toggleCard("availability")}
          >
            <span>Available Slots ({filteredSlots.length})</span>
            <ChevronDown />
          </button>
        )}

        {/* Layout Section */}
        {cardVisibility.layout && (
          <section className="card-section">
            <button
              className="card-header-btn"
              onClick={() => toggleCard("layout")}
              aria-label="Toggle parking layout"
            >
              <h2>Parking Layout</h2>
              <ChevronUp />
            </button>
            <div className="card-content">
              <ParkingSlotGrid slots={filteredSlots} compact={true} />
            </div>
          </section>
        )}

        {!cardVisibility.layout && (
          <button
            className="card-collapsed-btn"
            onClick={() => toggleCard("layout")}
          >
            <span>Parking Layout</span>
            <ChevronDown />
          </button>
        )}
      </main>
    </div>
  );
}
