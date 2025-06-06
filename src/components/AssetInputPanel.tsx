import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

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
  <Box>
    <Typography variant="h6" gutterBottom>Asset Names (comma separated)</Typography>
    <TextField
      fullWidth
      variant="outlined"
      value={assets.join(',')}
      onChange={e => setAssets(e.target.value.split(',').map(s => s.trim()))}
      margin="dense"
    />
    <Typography variant="h6" gutterBottom>Expected Returns (comma separated)</Typography>
    <TextField
      fullWidth
      variant="outlined"
      value={returns.join(',')}
      onChange={e => setReturns(e.target.value.split(',').map(s => parseFloat(s)))}
      margin="dense"
    />
    <Typography variant="h6" gutterBottom>Covariance Matrix (CSV, one row per line)</Typography>
    <TextField
      fullWidth
      variant="outlined"
      multiline
      minRows={4}
      value={cov.map(row => row.join(',')).join('\n')}
      onChange={e => setCov(
        e.target.value
          .split('\n')
          .map(row => row.split(',').map(s => parseFloat(s)))
      )}
      margin="dense"
    />
  </Box>
);