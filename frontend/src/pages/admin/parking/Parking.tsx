import style from "./Parking.module.css";
import Layout from "../../../components/Layout";
import parkingImg from "../../../assets/parking.png";

function Parking() {
  return (
    <section className={style.parkingContent}>
      <header className={style.header}>Parking</header>
      <div className={style.row} id={style.live}>
        <div className={`${style.card} ${style.surveillance}`}>
          <h3>Surveillance</h3>
          <img src={parkingImg} className={style.surveillance__feed}></img>
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
          <Layout />
        </div>
      </div>
    </section>
  );
}

export default Parking;
