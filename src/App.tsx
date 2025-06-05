import { useState } from 'react';
import { AssetInputPanel } from './components/AssetInputPanel';
import { ObjectiveSelector } from './components/ObjectiveSelector';
import { ConstraintBuilder } from './components/ConstraintBuilder';
import type { ConstraintConfig } from './components/ConstraintBuilder';
import { FrontierPlot } from './components/FrontierPlot';
import { OutputPanel } from './components/OutputPanel';
import { EfficientOptimizer } from './optimizer/efficientOptimizer';
import * as obj from './optimizer/objectives';
import * as cons from './optimizer/constraints';
import { computeEfficientFrontier } from './optimizer/efficientFrontier';
import * as tf from '@tensorflow/tfjs';

// 1. Strict type for allowed objectives
type ObjectiveKey = 'min_vol' | 'max_sharpe' | 'max_div';

// 2. Objective map type (and the runtime object)
const objectiveMap: Record<ObjectiveKey, {
  fn: (w: tf.Tensor, mu: tf.Tensor1D, cov: tf.Tensor2D) => tf.Scalar,
  direction: 'minimize' | 'maximize'
}> = {
  min_vol: { fn: obj.portfolioVariance, direction: 'minimize' },
  max_sharpe: { fn: obj.sharpeRatio, direction: 'maximize' },
  max_div: { fn: obj.diversificationRatio, direction: 'maximize' },
};

// 3. Util: convert ConstraintConfig[] to array of (w) => tf.Scalar functions, all type-safe
function buildConstraintFns(
  constraints: ConstraintConfig[]
): Array<(w: tf.Tensor) => tf.Scalar> {
  return constraints.map(cfg => {
    switch (cfg.key) {
      case 'noShort':
        return (w: tf.Tensor) => cons.noShort()(w).asScalar();
      case 'sumToOne':
        return (w: tf.Tensor) => cons.sumToOne()(w).asScalar();
      case 'bounds': {
        const minVec = cfg.minVec.split(',').map(s => Number(s.trim()));
        const maxVec = cfg.maxVec.split(',').map(s => Number(s.trim()));
        return (w: tf.Tensor) => cons.bounds(minVec, maxVec)(w).asScalar();
      }
      case 'groupMax': {
        const groupIdx = cfg.groupIdx.split(',').map(s => Number(s.trim()));
        return (w: tf.Tensor) => cons.groupMax(groupIdx, Number(cfg.max))(w).asScalar();
      }
      case 'groupMin': {
        const groupIdx = cfg.groupIdx.split(',').map(s => Number(s.trim()));
        return (w: tf.Tensor) => cons.groupMin(groupIdx, Number(cfg.min))(w).asScalar();
      }
      case 'maxWeight':
        return (w: tf.Tensor) => cons.maxWeight(Number(cfg.max))(w).asScalar();
      default:
        throw new Error(`Unknown constraint key: ${(cfg as any).key}`);
    }
  });
}

const DEFAULT_ASSETS = ['A', 'B', 'C'];
const DEFAULT_RETURNS = [0.12, 0.10, 0.08];
const DEFAULT_COV = [
  [0.10, 0.03, 0.02],
  [0.03, 0.12, 0.06],
  [0.02, 0.06, 0.08],
];

export default function App() {
  // 4. All state fully typed
  const [assets, setAssets] = useState<string[]>(DEFAULT_ASSETS);
  const [returns, setReturns] = useState<number[]>(DEFAULT_RETURNS);
  const [cov, setCov] = useState<number[][]>(DEFAULT_COV);
  const [objective, setObjective] = useState<ObjectiveKey>('min_vol');
  const [constraints, setConstraints] = useState<ConstraintConfig[]>([
    { key: 'sumToOne' },
    { key: 'noShort' }
  ]);
  const [frontier, setFrontier] = useState<Array<{ targetReturn: number; risk: number; weights: number[] }>>([]);
  const [weights, setWeights] = useState<number[] | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 5. Main optimization handler
  const runOptimization = async () => {
    setLoading(true);
    try {
      const constraintFns = buildConstraintFns(constraints);

      // Single portfolio optimization (with selected objective)
      const opt = new EfficientOptimizer(returns, cov);
      constraintFns.forEach(fn => opt.addConstraint(fn));
      const { fn, direction } = objectiveMap[objective];
      await opt.optimize(fn, direction);
      setWeights(opt.getWeights());
      setStats(opt.getPerformance());

      // Efficient frontier (always uses variance for curve; applies all constraints)
      const f = await computeEfficientFrontier(returns, cov, 30, constraintFns);
      setFrontier(f);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: 900, margin: '0 auto', padding: 32}}>
      <h2>SAA Playground</h2>
      <AssetInputPanel
        assets={assets}
        returns={returns}
        cov={cov}
        setAssets={setAssets}
        setReturns={setReturns}
        setCov={setCov}
      />
      <ObjectiveSelector
        objective={objective}
        setObjective={setObjective}
      />
      <ConstraintBuilder
        assets={assets}
        constraints={constraints}
        setConstraints={setConstraints}
      />
      <button onClick={runOptimization} disabled={loading} style={{margin:'12px 0'}}>
        {loading ? "Optimizing..." : "Run Optimization"}
      </button>
      <FrontierPlot data={frontier}/>
      <OutputPanel weights={weights} stats={stats} assets={assets}/>
    </div>
  );
}
