import React from 'react';
import { Box, Typography, List, ListItem } from '@mui/material';

export const OutputPanel: React.FC<{
  weights: number[] | null,
  stats: Record<string, number> | null,
  assets: string[]
}> = ({ weights, stats, assets }) => (
  <Box>
    <Typography variant="h6" gutterBottom>Optimized Portfolio</Typography>
    {weights ? (
      <List dense>
        {assets.map((name, i) =>
          <ListItem key={name}>
            <Typography variant="body2">{name}: {(weights[i]*100).toFixed(2)}%</Typography>
          </ListItem>
        )}
      </List>
    ) : <Typography variant="body2">No result</Typography>}
    {stats && (
      <Box mt={2}>
        <Typography variant="body2">Expected Return: {stats.ret?.toFixed(4)}</Typography>
        <Typography variant="body2">Risk (Std Dev): {stats.risk?.toFixed(4)}</Typography>
        <Typography variant="body2">Objective: {stats.obj?.toFixed(4)}</Typography>
      </Box>
    )}
  </Box>
);