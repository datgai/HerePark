import style from "./Parking.module.css";
import Layout from "../../../components/Layout";
import parkingImg from "../../../assets/parking.png";
import { ParkingSlotGrid } from "../../../components/ParkingSlotGrid";
import { VideoStream } from "../../../components/VideoStream";
import { useParkingStream } from "../../../hooks/useParkingStream";

function Parking() {
  const { data } = useParkingStream();

  return (
    <section className={style.parkingContent}>
      <header className={style.header}>Parking</header>
      <div className={style.row} id={style.live}>
        <div className={`${style.card} ${style.surveillance}`}>
          <h3>Surveillance</h3>
          <VideoStream />
        </div>
        <div className={`${style.card} ${style.prediction}`}>
          <h3>Availability Prediction</h3>
          <p>
            Slot A1-1 <br /> 1 Hour
          </p>
        </div>
      </div>
      <div className={style.row}>
        <div className={style.card}>
          <h3>Layout</h3>
          <ParkingSlotGrid slots={data.slots} />
        </div>
      </div>
    </section>
  );
}

export default Parking;
