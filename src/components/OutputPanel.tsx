import React from 'react';

export const OutputPanel: React.FC<{
  weights: number[] | null,
  stats: Record<string, number> | null,
  assets: string[]
}> = ({ weights, stats, assets }) => (
  <div>
    <h4>Optimized Portfolio</h4>
    {weights ? (
      <ul>
        {assets.map((name, i) =>
          <li key={name}>{name}: {(weights[i]*100).toFixed(2)}%</li>
        )}
      </ul>
    ) : <span>No result</span>}
    {stats && (
      <div>
        <div>Expected Return: {stats.ret?.toFixed(4)}</div>
        <div>Risk (Std Dev): {stats.risk?.toFixed(4)}</div>
        <div>Objective: {stats.obj?.toFixed(4)}</div>
      </div>
    )}
  </div>
);
