import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface FrontierPoint {
  targetReturn: number;
  risk: number;
  weights: number[];
  ret: number;
}

// Custom Tooltip
const CustomTooltip: React.FC<any> = React.memo(({ active, payload }) => {
  if (active && payload?.length) {
    const { ret, targetReturn, risk } = payload[0].payload;
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #8884d8",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#222",
          fontSize: 14,
          boxShadow: "0 2px 8px rgba(136,132,216,0.08)",
        }}
      >
        <div>
          <b>Return:</b> {((ret ?? targetReturn) * 100).toFixed(2)}%
        </div>
        <div>
          <b>Volatility:</b> {(risk * 100).toFixed(4)}%
        </div>
      </div>
    );
  }
  return null;
});

// Axis padding helper
function getAxisMinMax(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const pad = range * 0.08 || 0.01;
  return [min - pad, max + pad];
}

// Returns only the upper (efficient) frontier, sorted by risk ascending
function efficientFrontier(points: FrontierPoint[]): FrontierPoint[] {
  if (points.length <= 1) return [...points];
  const pts = points
    .map((p) => ({ ...p }))
    .sort((a, b) => a.risk - b.risk || b.ret - a.ret);

  const upper: FrontierPoint[] = [];
  for (const p of pts) {
    while (
      upper.length >= 2 &&
      (p.ret - upper[upper.length - 2].ret) * (upper[upper.length - 1].risk - upper[upper.length - 2].risk) >=
        (upper[upper.length - 1].ret - upper[upper.length - 2].ret) * (p.risk - upper[upper.length - 2].risk)
    ) {
      upper.pop();
    }
    upper.push(p);
  }
  return upper;
}

// Returns only the lower (inefficient) frontier, sorted by risk ascending
function lowerFrontier(points: FrontierPoint[]): FrontierPoint[] {
  if (points.length <= 1) return [...points];
  const pts = points
    .map((p) => ({ ...p }))
    .sort((a, b) => a.risk - b.risk || a.ret - b.ret);

  const lower: FrontierPoint[] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      (p.ret - lower[lower.length - 2].ret) * (lower[lower.length - 1].risk - lower[lower.length - 2].risk) <=
        (lower[lower.length - 1].ret - lower[lower.length - 2].ret) * (p.risk - lower[lower.length - 2].risk)
    ) {
      lower.pop();
    }
    lower.push(p);
  }
  return lower;
}

// Main plot component
export const FrontierPlot: React.FC<{ data: FrontierPoint[]; showAllPoints?: boolean }> = React.memo(
  ({ data, showAllPoints = false }) => {
    const risks = useMemo(() => data.map((d) => d.risk), [data]);
    const rets = useMemo(() => data.map((d) => d.ret), [data]);
    const [riskMin, riskMax] = useMemo(() => getAxisMinMax(risks), [risks]);
    const [retMin, retMax] = useMemo(() => getAxisMinMax(rets), [rets]);
    const upperFrontier = useMemo(() => {
      const arr = efficientFrontier(data);
      return arr.slice(0, -1); // remove most right
    }, [data]);
    const lowerFrontierPoints = useMemo(() => {
      const arr = lowerFrontier(data);
      return arr.slice(0, -1); // remove most right
    }, [data]);

    return (
      <div style={{ width: "100%", height: 600 }}>
        <ResponsiveContainer aspect={1}>
          <ScatterChart margin={{ top: 10, right: 20, left: 30, bottom: 35 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
            <XAxis
              dataKey="risk"
              domain={[riskMin, riskMax]}
              label={{
                value: "Risk (Std Dev)",
                position: "insideBottom",
                offset: 0,
                dy: 25,
                style: { fill: "#8884d8", fontWeight: 700, fontSize: 28 },
              }}
              tickFormatter={(v) => `${(Number(v) * 100).toFixed(2)}%`}
              tick={{ fill: "#555", fontSize: 20 }}
              type="number"
            />
            <YAxis
              dataKey="ret"
              domain={[retMin, retMax]}
              label={{
                value: "Return",
                angle: -90,
                position: "insideLeft",
                offset: -40,
                dy: 0,
                style: { fill: "#8884d8", fontWeight: 700, fontSize: 28 },
              }}
              tickFormatter={(v) => `${(Number(v) * 100).toFixed(2)}%`}
              tick={{ fill: "#555", fontSize: 20 }}
              type="number"
            />
            <Tooltip content={<CustomTooltip />} />
            {showAllPoints && (
              <Scatter
                name="Frontier Scatter"
                data={data}
                fill="#8884d8"
                line={false}
                shape="circle"
                legendType="circle"
              />
            )}
            <Scatter
              name="Upper Frontier"
              data={upperFrontier}
              fill="#ff7300"
              line={{ stroke: "#ff7300", strokeWidth: 6 }}
              shape={() => <></>} // No node
              legendType="line"
            />
            <Scatter
              name="Lower Frontier"
              data={lowerFrontierPoints}
              fill="#ff7300"
              line={{ stroke: "#ff7300", strokeWidth: 6, strokeDasharray: "8 6" }}
              shape={() => <></>} // No node
              legendType="line"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }
);