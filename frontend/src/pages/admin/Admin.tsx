import style from "./Admin.module.css";
import { ParkingStats } from "../../components/ParkingStats";
import CircularProgress from "../../components/CircularProgress";
import RevenueCharts from "../../components/RevenueCharts";
import { VideoStream, useParkingStream } from "../../components/VideoStream";

function Admin() {
  const { data } = useParkingStream();

  const sampleData = [
    { name: "Jan", value: 10000 },
    { name: "Feb", value: 4500 },
    { name: "Mar", value: 6000 },
    { name: "Apr", value: 5000 },
    { name: "May", value: 8000 },
  ];

  return (
    <section className={style.adminContent}>
      <header className={style.header}>Dashboard</header>

      <div className={style.row} id={style.stats}>
        <ParkingStats stats={data.stats} />
      </div>

      <div className={style.row} id={style.park}>
        <div className={`${style.card} ${style.parking}`}>
          <h3>Parking Area</h3>
          <div className={style.parking__content}>
            <VideoStream />
            <div className={style.parking__info}>
              <b>Area Name</b> <br />
              Rocks Basement Parking
              <br />
              <b>Address</b>
              <br />
              No.1 Address A,B
            </div>
          </div>
        </div>

        <div className={`${style.card} ${style.vehicles}`}>
          <h3>Vehicles</h3>
          <p>
            <strong> AK 470</strong> <br />
            09:46 AM 3/3/2026
          </p>
          <p>
            <strong> WAT 1500</strong> <br />
            09:45 AM 3/3/2026
          </p>
          <p>
            <strong> TAT 3000</strong> <br />
            09:45 AM 3/3/2026
          </p>
        </div>
      </div>

      <div className={style.row} id={style.activities}>
        <div className={`${style.card} ${style.revenue}`}>
          <h3>Revenue Analytics</h3>
          <RevenueCharts data={sampleData} />
        </div>
        <div className={`${style.card} ${style.occupancy}`}>
          <h3>Occupancy</h3>
          <div className={style.occupancy__content}>
            <div className={style.occupancy__legend}>
              <div>
                <div
                  className={style.occupancy__legend_icon}
                  id={style.occupied}
                ></div>
                Slots Occupied
              </div>
              <div>
                <div
                  className={style.occupancy__legend_icon}
                  id={style.unoccupied}
                ></div>
                Slots Unoccupied
              </div>
            </div>
            <div className={style.circular__progress}>
              <CircularProgress value={data.stats.occupancy_rate} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;
