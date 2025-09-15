import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./RevenueCharts.module.css";

type RevenueChartsProps = {
  data: { name: string; value: number }[];
};

const RevenueCharts: React.FC<RevenueChartsProps> = ({ data }) => {
  return (
    <div className={styles.chart__container}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--primary-colour)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--secondary-colour)"
                stopOpacity={0.6}
              />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" className={styles.chart__grid} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueCharts;
