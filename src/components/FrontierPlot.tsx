import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface FrontierPoint {
  targetReturn: number;
  risk: number;
  weights: number[];
}

export const FrontierPlot: React.FC<{ data: FrontierPoint[] }> = ({ data }) => (
  <div style={{ width: '100%', height: 300 }}>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="risk" label={{ value: "Risk (Std Dev)", position: "insideBottomRight" }}/>
        <YAxis dataKey="targetReturn" label={{ value: "Return", angle: -90, position: "insideLeft" }}/>
        <Tooltip />
        <Line type="monotone" dataKey="targetReturn" stroke="#8884d8" dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  </div>
);
