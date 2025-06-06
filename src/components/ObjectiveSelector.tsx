import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export type ObjectiveKey = 'min_vol' | 'max_sharpe' | 'max_div';

export interface ObjectiveSelectorProps {
  objective: ObjectiveKey;
  setObjective: (s: ObjectiveKey) => void;
}

export const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  objective, setObjective,
}) => (
  <Box>
    <FormControl fullWidth>
      <InputLabel id="objective-label">Optimization Objective</InputLabel>
      <Select
        labelId="objective-label"
        value={objective}
        label="Optimization Objective"
        onChange={e => setObjective(e.target.value as ObjectiveKey)}
      >
        <MenuItem value="min_vol">Min Volatility</MenuItem>
        <MenuItem value="max_sharpe">Max Sharpe</MenuItem>
        <MenuItem value="max_div">Max Diversification</MenuItem>
      </Select>
    </FormControl>
  </Box>
);