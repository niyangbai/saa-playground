import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface FrontierPoint {
  targetReturn: number;
  risk: number;
  weights: number[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const ret = payload[0].payload.targetReturn;
    const risk = payload[0].payload.risk;
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #8884d8',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#222',
        fontSize: 14,
        boxShadow: '0 2px 8px rgba(136,132,216,0.08)'
      }}>
        <div><b>Return:</b> {(ret * 100).toFixed(2)}%</div>
        <div><b>Volatility:</b> {(risk * 100).toFixed(4)}%</div>
      </div>
    );
  }
  return null;
};

export const FrontierPlot: React.FC<{ data: FrontierPoint[] }> = ({ data }) => (
  <div style={{ width: '100%', height: 600 }}>
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{ top: 10, right: 20, left: 30, bottom: 35 }} // more left margin for label
      >
        <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
        <XAxis
          dataKey="risk"
          label={{
            value: "Risk (Std Dev)",
            position: "insideBottom",
            offset: 0,
            dy: 28,
            style: { fill: "#8884d8", fontWeight: 500 }
          }}
          tickFormatter={v => (Number(v) * 100).toFixed(2) + '%'}
          tick={{ fill: "#555", fontSize: 13 }}
        />
        <YAxis
          dataKey="targetReturn"
          label={{
            value: "Return",
            angle: -90,
            position: "insideLeft",
            offset: -15,
            dy: 0, // move label up a bit, remove dx
            style: { fill: "#8884d8", fontWeight: 500 }
          }}
          tickFormatter={v => (Number(v) * 100).toFixed(2) + '%'}
          tick={{ fill: "#555", fontSize: 13 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="targetReturn"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);