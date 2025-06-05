import React from 'react';

export interface AssetInputProps {
  assets: string[];
  returns: number[];
  cov: number[][];
  setAssets: (a: string[]) => void;
  setReturns: (r: number[]) => void;
  setCov: (c: number[][]) => void;
}

export const AssetInputPanel: React.FC<AssetInputProps> = ({
  assets, returns, cov, setAssets, setReturns, setCov,
}) => (
  <div>
    <h4>Asset Names (comma separated)</h4>
    <input
      type="text"
      value={assets.join(',')}
      onChange={e => setAssets(e.target.value.split(',').map(s => s.trim()))}
      style={{width: '100%'}}
    />
    <h4>Expected Returns (comma separated)</h4>
    <input
      type="text"
      value={returns.join(',')}
      onChange={e => setReturns(e.target.value.split(',').map(s => parseFloat(s)))}
      style={{width: '100%'}}
    />
    <h4>Covariance Matrix (CSV, one row per line)</h4>
    <textarea
      value={cov.map(row => row.join(',')).join('\n')}
      onChange={e => setCov(
        e.target.value
          .split('\n')
          .map(row => row.split(',').map(s => parseFloat(s)))
      )}
      style={{width: '100%', minHeight: 80}}
    />
  </div>
);
