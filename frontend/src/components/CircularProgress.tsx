import React from "react";
import styles from "./CircularProgress.module.css";

type CircularProgressProps = {
  value: number; // percentage 0-100
  strokeWidth?: number;
  gradientId?: string; // so you can have multiple on the same page
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  strokeWidth = 10,
  gradientId = "progressGradient",
}) => {
  const size = 100; // SVG uses viewBox scaling, so this stays scalable
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      className={styles.svgContainer}
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary-colour)" />
          <stop offset="100%" stopColor="var(--secondary-colour)" />
        </linearGradient>
      </defs>

      <circle
        className={styles.backgroundCircle}
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />

      <circle
        className={styles.progressCircle}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />

      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className={styles.centerText}
      >
        {value}%
      </text>
    </svg>
  );
};

export default CircularProgress;
