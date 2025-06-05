// src/components/ObjectiveSelector.tsx

import React from 'react';

// 1. Import the same union type for objectives:
export type ObjectiveKey = 'min_vol' | 'max_sharpe' | 'max_div';

// 2. Props accept only this type:
export interface ObjectiveSelectorProps {
  objective: ObjectiveKey;
  setObjective: (s: ObjectiveKey) => void;
}

export const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  objective, setObjective,
}) => (
  <div>
    <label>Optimization Objective: </label>
    <select
      value={objective}
      onChange={e => setObjective(e.target.value as ObjectiveKey)}
    >
      <option value="min_vol">Min Volatility</option>
      <option value="max_sharpe">Max Sharpe</option>
      <option value="max_div">Max Diversification</option>
    </select>
  </div>
);
