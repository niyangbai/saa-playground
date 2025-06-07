import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface FrontierPoint {
  targetReturn: number;
  risk: number;
  weights: number[];
  ret: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const ret = payload[0].payload.ret ?? payload[0].payload.targetReturn;
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

function getAxisMinMax(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const pad = range * 0.08 || 0.01;
  return [min - pad, max + pad];
}

export const FrontierPlot: React.FC<{ data: FrontierPoint[] }> = ({ data }) => {
  const risks = data.map(d => d.risk);
  const rets = data.map(d => d.ret);
  const [riskMin, riskMax] = getAxisMinMax(risks);
  const [retMin, retMax] = getAxisMinMax(rets);

  return (
    <div style={{ width: '100%', height: 600 }}>
      <ResponsiveContainer aspect={1}>
        <ScatterChart
          margin={{ top: 10, right: 20, left: 30, bottom: 35 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
          <XAxis
            dataKey="risk"
            domain={[riskMin, riskMax]}
            label={{
              value: "Risk (Std Dev)",
              position: "insideBottom",
              offset: 0,
              dy: 25, // move label further down
              style: { fill: "#8884d8", fontWeight: 700, fontSize: 28 }
            }}
            tickFormatter={v => (Number(v) * 100).toFixed(2) + '%'}
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
              style: { fill: "#8884d8", fontWeight: 700, fontSize: 28 }
            }}
            tickFormatter={v => (Number(v) * 100).toFixed(2) + '%'}
            tick={{ fill: "#555", fontSize: 20 }}
            type="number"
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            name="Frontier Scatter"
            data={data}
            fill="#8884d8"
            line={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};