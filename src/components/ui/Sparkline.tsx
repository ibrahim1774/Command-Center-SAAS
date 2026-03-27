"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = "var(--color-accent-blue)",
  width = 80,
  height = 32,
  className,
}: SparklineProps) {
  const id = useId();

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((value, i) => ({
    x: padding + (i / (data.length - 1)) * innerWidth,
    y: padding + innerHeight - ((value - min) / range) * innerHeight,
  }));

  // Build a smooth cubic bezier path
  const linePath = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + point.x) / 2;
    return `${path} C ${cpx},${prev.y} ${cpx},${point.y} ${point.x},${point.y}`;
  }, "");

  // Close the path along the bottom for the gradient fill
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x},${height} L ${first.x},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#gradient-${id})`} />
      <path
        d={linePath}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
