import React, { useState } from "react";

const CONSTRAINT_TYPES = [
  { key: "noShort", label: "No Shorting", fields: [] },
  { key: "sumToOne", label: "Sum to One", fields: [] },
  { key: "bounds", label: "Per-Asset Bounds", fields: ["minVec", "maxVec"] },
  { key: "groupMax", label: "Group Max", fields: ["groupIdx", "max"] },
  { key: "groupMin", label: "Group Min", fields: ["groupIdx", "min"] },
  { key: "maxWeight", label: "Max Weight", fields: ["max"] },
];

// Types for config (for your buildConstraintFns)
export type ConstraintConfig =
  | { key: "noShort" | "sumToOne" }
  | { key: "bounds"; minVec: string; maxVec: string }
  | { key: "groupMax"; groupIdx: string; max: string }
  | { key: "groupMin"; groupIdx: string; min: string }
  | { key: "maxWeight"; max: string };

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
    } else {
      return; // unknown constraint
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
      <input
        key={field}
        type="text"
        placeholder={field}
        value={form[field] || ""}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        style={{ marginRight: 8 }}
      />
    ));
  };

  return (
    <div style={{margin: "16px 0"}}>
      <h4>Constraints</h4>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <select value={type} onChange={e => { setType(e.target.value); setForm({}); }}>
          {CONSTRAINT_TYPES.map(ct => <option value={ct.key} key={ct.key}>{ct.label}</option>)}
        </select>
        {renderFields()}
        <button onClick={handleAdd}>Add Constraint</button>
      </div>
      <ul>
        {constraints.map((c, i) => (
          <li key={i} style={{marginBottom:4}}>
            {c.key === "noShort" && "No Shorting"}
            {c.key === "sumToOne" && "Sum to One"}
            {c.key === "bounds" && `Per-Asset Bounds: min=[${c.minVec}], max=[${c.maxVec}]`}
            {c.key === "groupMax" && `Group Max: idx=[${c.groupIdx}], max=${c.max}`}
            {c.key === "groupMin" && `Group Min: idx=[${c.groupIdx}], min=${c.min}`}
            {c.key === "maxWeight" && `Max Weight: ${c.max}`}
            <button onClick={() => handleRemove(i)} style={{marginLeft:8}}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
