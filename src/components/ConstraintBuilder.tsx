import React, { useState } from "react";
import { Box, Typography, Button, Select, MenuItem, TextField, IconButton, List, ListItem } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const CONSTRAINT_TYPES = [
  { key: "noShort", label: "No Shorting", fields: [] },
  { key: "sumToOne", label: "Sum to One", fields: [] },
  { key: "bounds", label: "Per-Asset Bounds", fields: ["minVec", "maxVec"] },
  { key: "groupMax", label: "Group Max", fields: ["groupIdx", "max"] },
  { key: "groupMin", label: "Group Min", fields: ["groupIdx", "min"] },
  { key: "maxWeight", label: "Max Weight", fields: ["max"] },
  { key: "betweenMinusOneAndOne", label: "Between -1 and 1", fields: [] },
  { key: "sumToTarget", label: "Sum to Target", fields: ["target"] },
  { key: "minWeight", label: "Min Weight", fields: ["min"] },
  { key: "turnover", label: "Turnover", fields: ["prevW", "maxTurnover"] },
  { key: "riskBudget", label: "Risk Budget", fields: ["cov", "maxFraction"] },
];

export type ConstraintConfig =
  | { key: "noShort" | "sumToOne" }
  | { key: "bounds"; minVec: string; maxVec: string }
  | { key: "groupMax"; groupIdx: string; max: string }
  | { key: "groupMin"; groupIdx: string; min: string }
  | { key: "maxWeight"; max: string }
  | { key: "betweenMinusOneAndOne" }
  | { key: "sumToTarget"; target: string }
  | { key: "minWeight"; min: string }
  | { key: "turnover"; prevW: string; maxTurnover: string }
  | { key: "riskBudget"; cov: string; maxFraction: string };

interface ConstraintBuilderProps {
  assets: string[];
  constraints: ConstraintConfig[];
  setConstraints: (c: ConstraintConfig[]) => void;
}

export const ConstraintBuilder: React.FC<ConstraintBuilderProps> = ({
  constraints, setConstraints
}) => {
  const [type, setType] = useState(CONSTRAINT_TYPES[0].key);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleAdd = () => {
    let newConfig: ConstraintConfig;
    if (type === "noShort" || type === "sumToOne") {
      newConfig = { key: type };
    } else if (type === "bounds") {
      newConfig = { key: "bounds", minVec: form.minVec ?? "", maxVec: form.maxVec ?? "" };
    } else if (type === "groupMax") {
      newConfig = { key: "groupMax", groupIdx: form.groupIdx ?? "", max: form.max ?? "" };
    } else if (type === "groupMin") {
      newConfig = { key: "groupMin", groupIdx: form.groupIdx ?? "", min: form.min ?? "" };
    } else if (type === "maxWeight") {
      newConfig = { key: "maxWeight", max: form.max ?? "" };
    } else if (type === "betweenMinusOneAndOne") {
      newConfig = { key: "betweenMinusOneAndOne" };
    } else if (type === "sumToTarget") {
      newConfig = { key: "sumToTarget", target: form.target ?? "" };
    } else if (type === "minWeight") {
      newConfig = { key: "minWeight", min: form.min ?? "" };
    } else if (type === "turnover") {
      newConfig = { key: "turnover", prevW: form.prevW ?? "", maxTurnover: form.maxTurnover ?? "" };
    } else if (type === "riskBudget") {
      newConfig = { key: "riskBudget", cov: form.cov ?? "", maxFraction: form.maxFraction ?? "" };
    } else {
      return;
    }
    setConstraints([...constraints, newConfig]);
    setForm({});
  };

  const handleRemove = (i: number) => {
    setConstraints(constraints.filter((_, idx) => idx !== i));
  };

  const renderFields = () => {
    const fields = CONSTRAINT_TYPES.find(ct => ct.key === type)?.fields || [];
    return fields.map(field => (
      <TextField
        key={field}
        label={field}
        value={form[field] || ""}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        size="small"
        sx={{ mr: 1, width: 120 }}
      />
    ));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Constraints</Typography>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Select
          value={type}
          onChange={e => { setType(e.target.value); setForm({}); }}
          size="small"
        >
          {CONSTRAINT_TYPES.map(ct => <MenuItem value={ct.key} key={ct.key}>{ct.label}</MenuItem>)}
        </Select>
        {renderFields()}
        <Button variant="contained" onClick={handleAdd} size="small">Add</Button>
      </Box>
      <List dense>
        {constraints.map((c, i) => (
          <ListItem
            key={i}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(i)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <Typography variant="body2">
              {c.key === "noShort" && "No Shorting"}
              {c.key === "sumToOne" && "Sum to One"}
              {c.key === "bounds" && `Per-Asset Bounds: min=[${c.minVec}], max=[${c.maxVec}]`}
              {c.key === "groupMax" && `Group Max: idx=[${c.groupIdx}], max=${c.max}`}
              {c.key === "groupMin" && `Group Min: idx=[${c.groupIdx}], min=${c.min}`}
              {c.key === "maxWeight" && `Max Weight: ${c.max}`}
              {c.key === "betweenMinusOneAndOne" && `Between -1 and 1`}
              {c.key === "sumToTarget" && `Sum to Target: ${c.target}`}
              {c.key === "minWeight" && `Min Weight: ${c.min}`}
              {c.key === "turnover" && `Turnover: prevW=[${c.prevW}], maxTurnover=${c.maxTurnover}`}
              {c.key === "riskBudget" && `Risk Budget: cov=${c.cov}, maxFraction=${c.maxFraction}`}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};