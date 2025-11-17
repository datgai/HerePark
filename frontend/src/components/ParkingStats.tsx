import styles from "./ParkingStats.module.css";

interface StatsData {
  total: number;
  occupied: number;
  empty: number;
  occupancy_rate: number;
}

interface Props {
  stats: StatsData;
}

export const ParkingStats = ({ stats }: Props) => {
  return (
    <>
      <div className={styles.stat}>
        <div className={`${styles.stat__icon} ${styles.total}`}>
          <svg
            width="48"
            height="49"
            viewBox="0 0 48 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 10.5C6 9.43913 6.42143 8.42172 7.17157 7.67157C7.92172 6.92143 8.93913 6.5 10 6.5H38C39.0609 6.5 40.0783 6.92143 40.8284 7.67157C41.5786 8.42172 42 9.43913 42 10.5V38.5C42 39.5609 41.5786 40.5783 40.8284 41.3284C40.0783 42.0786 39.0609 42.5 38 42.5H10C8.93913 42.5 7.92172 42.0786 7.17157 41.3284C6.42143 40.5783 6 39.5609 6 38.5V10.5Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 32.5V16.5H25.334C26.806 16.5 28 18.29 28 20.5C28 22.71 26.806 24.5 25.334 24.5H20"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.stat__content}>
          <span>{stats.total}</span>
          <p>Total Slots</p>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={`${styles.stat__icon} ${styles.occupied}`}>
          <svg
            width="49"
            height="49"
            viewBox="0 0 49 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.6">
              <path
                d="M10.6667 34.5C10.6667 35.5609 11.0881 36.5783 11.8383 37.3284C12.5884 38.0786 13.6058 38.5 14.6667 38.5C15.7276 38.5 16.745 38.0786 17.4951 37.3284C18.2453 36.5783 18.6667 35.5609 18.6667 34.5C18.6667 33.4391 18.2453 32.4217 17.4951 31.6716C16.745 30.9214 15.7276 30.5 14.6667 30.5C13.6058 30.5 12.5884 30.9214 11.8383 31.6716C11.0881 32.4217 10.6667 33.4391 10.6667 34.5Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30.6667 34.5C30.6667 35.5609 31.0881 36.5783 31.8383 37.3284C32.5884 38.0786 33.6058 38.5 34.6667 38.5C35.7276 38.5 36.745 38.0786 37.4951 37.3284C38.2453 36.5783 38.6667 35.5609 38.6667 34.5C38.6667 33.4391 38.2453 32.4217 37.4951 31.6716C36.745 30.9214 35.7276 30.5 34.6667 30.5C33.6058 30.5 32.5884 30.9214 31.8383 31.6716C31.0881 32.4217 30.6667 33.4391 30.6667 34.5Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.6667 34.5H6.66669V22.5M6.66669 22.5L10.6667 12.5H28.6667L36.6667 22.5M6.66669 22.5H36.6667M36.6667 22.5H38.6667C39.7276 22.5 40.745 22.9214 41.4951 23.6716C42.2453 24.4217 42.6667 25.4391 42.6667 26.5V34.5H38.6667M30.6667 34.5H18.6667M24.6667 22.5V12.5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>
        <div className={styles.stat__content}>
          <span>{stats.occupied}</span>
          <p>Occupied</p>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={`${styles.stat__icon} ${styles.available}`}>
          <svg
            width="48"
            height="49"
            viewBox="0 0 48 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 10.5C6 9.43913 6.42143 8.42172 7.17157 7.67157C7.92172 6.92143 8.93913 6.5 10 6.5H38C39.0609 6.5 40.0783 6.92143 40.8284 7.67157C41.5786 8.42172 42 9.43913 42 10.5V38.5C42 39.5609 41.5786 40.5783 40.8284 41.3284C40.0783 42.0786 39.0609 42.5 38 42.5H10C8.93913 42.5 7.92172 42.0786 7.17157 41.3284C6.42143 40.5783 6 39.5609 6 38.5V10.5Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 32.5V16.5H25.334C26.806 16.5 28 18.29 28 20.5C28 22.71 26.806 24.5 25.334 24.5H20"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.stat__content}>
          <span>{stats.empty}</span>
          <p>Available</p>
        </div>
      </div>

      <div className={styles.stat}>
        <div className={`${styles.stat__icon} ${styles.rate}`}>
          <svg
            width="49"
            height="49"
            viewBox="0 0 49 49"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M33.7333 16.5C33.3352 15.3705 32.6082 14.3859 31.6458 13.6731C30.6834 12.9602 29.5298 12.5517 28.3333 12.5H20.3333C18.742 12.5 17.2158 13.1321 16.0906 14.2574C14.9654 15.3826 14.3333 16.9087 14.3333 18.5C14.3333 20.0913 14.9654 21.6174 16.0906 22.7426C17.2158 23.8679 18.742 24.5 20.3333 24.5H28.3333C29.9246 24.5 31.4507 25.1321 32.5759 26.2574C33.7011 27.3826 34.3333 28.9087 34.3333 30.5C34.3333 32.0913 33.7011 33.6174 32.5759 34.7426C31.4507 35.8679 29.9246 36.5 28.3333 36.5H20.3333C19.1367 36.4483 17.9831 36.0398 17.0207 35.3269C16.0584 34.6141 15.3313 33.6295 14.9333 32.5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24.3333 6.5V12.5M24.3333 36.5V42.5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.stat__content}>
          <span>{stats.occupancy_rate.toFixed(0)}%</span>
          <p>Occupancy Rate</p>
        </div>
      </div>
    </>
  );
};
