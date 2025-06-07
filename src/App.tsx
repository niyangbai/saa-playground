import { useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from '@mui/material/Link';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AssetInputPanel } from './components/AssetInputPanel';
import { ObjectiveSelector } from './components/ObjectiveSelector';
import { ConstraintBuilder } from './components/ConstraintBuilder';
import type { ConstraintConfig } from './components/ConstraintBuilder';
import { FrontierPlot } from './components/FrontierPlot';
import { OutputPanel } from './components/OutputPanel';
import { EfficientOptimizer } from './optimizer/efficientOptimizer';
import * as obj from './optimizer/objectives';
import * as cons from './optimizer/constraints';
import { collectFrontierScatterPoints } from './optimizer/efficientFrontier';
import * as tf from '@tensorflow/tfjs';

type ObjectiveKey = 'min_vol' | 'max_sharpe' | 'max_div';

const GITHUB_URL = "https://github.com/niyangbai/saa-playground"; 

const objectiveMap: Record<ObjectiveKey, {
  fn: (w: tf.Tensor, mu: tf.Tensor1D, cov: tf.Tensor2D) => tf.Scalar,
  direction: 'minimize' | 'maximize'
}> = {
  min_vol: { fn: obj.portfolioVariance, direction: 'minimize' },
  max_sharpe: { fn: obj.sharpeRatio, direction: 'maximize' },
  max_div: { fn: obj.diversificationRatio, direction: 'maximize' },
};

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
      case 'betweenMinusOneAndOne':
        return (w: tf.Tensor) => cons.betweenMinusOneAndOne()(w).asScalar();
      case 'sumToTarget':
        return (w: tf.Tensor) => cons.sumToTarget(Number(cfg.target))(w).asScalar();
      case 'minWeight':
        return (w: tf.Tensor) => cons.minWeight(Number(cfg.min))(w).asScalar();
      case 'turnover': {
        const prevW = cfg.prevW.split(',').map((s: string) => Number(s.trim()));
        return (w: tf.Tensor) => cons.turnover(prevW, Number(cfg.maxTurnover))(w).asScalar();
      }
      case 'riskBudget': {
        const cov = JSON.parse(cfg.cov);
        return (w: tf.Tensor) => cons.riskBudget(cov, Number(cfg.maxFraction))(w).asScalar();
      }
      default:
        throw new Error(`Unknown constraint key: ${(cfg as any).key}`);
    }
  });
}

const DEFAULT_ASSETS = ['A', 'B', 'C'];
const DEFAULT_RETURNS = [0.20, 0.10, 0.02];
const DEFAULT_COV = [
  [0.10, 0.02, 0.01],
  [0.02, 0.12, 0.06],
  [0.01, 0.06, 0.08],
];

export default function App() {
  const [assets, setAssets] = useState<string[]>(DEFAULT_ASSETS);
  const [returns, setReturns] = useState<number[]>(DEFAULT_RETURNS);
  const [cov, setCov] = useState<number[][]>(DEFAULT_COV);
  const [objective, setObjective] = useState<ObjectiveKey>('max_sharpe');
  const [constraints, setConstraints] = useState<ConstraintConfig[]>([
    { key: 'sumToOne' },
    { key: 'noShort' }
  ]);
  const [frontier, setFrontier] = useState<Array<{ targetReturn: number; risk: number; weights: number[]; ret: number }>>([]);
  const [weights, setWeights] = useState<number[] | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [efLoading, setEfLoading] = useState<boolean>(false);
  const [showAllPoints, setShowAllPoints] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const constraintFns = buildConstraintFns(constraints);
      const opt = new EfficientOptimizer(returns, cov);
      constraintFns.forEach(fn => opt.addConstraint(fn));
      const { fn, direction } = objectiveMap[objective];
      const sumToTargetCfg = constraints.find(c => c.key === 'sumToTarget');
      const targetSum = sumToTargetCfg ? Number(sumToTargetCfg.target) : 1;
      const noShorting = constraints.some(c => c.key === 'noShort');
      await opt.optimize(fn, direction, targetSum, noShorting);
      setWeights(opt.getWeights());
      setStats(opt.getPerformance());
    } finally {
      setLoading(false);
    }
  };

  const runEfficientFrontier = async () => {
    setEfLoading(true);
    try {
      const constraintFns = buildConstraintFns(constraints);
      // Use the new scatter point collector
      const scatterPoints = await collectFrontierScatterPoints(returns, cov, 30, constraintFns);
      setFrontier(scatterPoints);
    } finally {
      setEfLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 2 }}>
      <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '90vh' }}>
        <Paper elevation={3} sx={{ p: { xs: 1, md: 4 }, borderRadius: 4, width: '100%', maxWidth: 1400 }}>
          {/* Header with badges and GitHub */}
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
                SAA Playground
              </Typography>
              <Divider sx={{ mb: 1, width: 120, borderBottomWidth: 3, borderColor: 'primary.main' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: { xs: 2, sm: 0 } }}>
              <img src="https://img.shields.io/badge/license-AGPL-green" alt="AGPL License" />
              <img src="https://img.shields.io/badge/node-%3E%3D16.0-blue" alt="Node.js Version" />
              <img src="https://img.shields.io/badge/built%20with-vite-646CFF" alt="Vite" />
              <Link href={GITHUB_URL} target="_blank" rel="noopener" sx={{ ml: 1 }}>
                <GitHubIcon fontSize="large" />
              </Link>
            </Box>
          </Box>
          {/* Main layout */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            width: '100%',
            minHeight: '70vh',
          }}>
            {/* Left: Inputs */}
            <Box sx={{ flex: 1, minWidth: 320, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <AssetInputPanel
                  assets={assets}
                  returns={returns}
                  cov={cov}
                  setAssets={setAssets}
                  setReturns={setReturns}
                  setCov={setCov}
                />
              </Paper>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <ObjectiveSelector
                  objective={objective}
                  setObjective={setObjective}
                />
              </Paper>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, flexGrow: 1 }}>
                <ConstraintBuilder
                  assets={assets}
                  constraints={constraints}
                  setConstraints={setConstraints}
                />
              </Paper>
            </Box>
            {/* Right: Results */}
            <Box sx={{ flex: 2, minWidth: 340, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <OutputPanel weights={weights} stats={stats} assets={assets} />
                <Box mt={3} mb={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={runOptimization}
                      disabled={loading}
                      size="large"
                      sx={{ minWidth: 180, flex: 1 }}
                    >
                      {loading ? "Optimizing..." : "Run Optimization"}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={runEfficientFrontier}
                      disabled={efLoading}
                      size="large"
                      sx={{ minWidth: 180, flex: 1 }}
                    >
                      {efLoading ? "Computing Efficient Frontier..." : "Compute Efficient Frontier"}
                    </Button>
                  </Box>
                </Box>
                <Box mt={1} sx={{ flex: 1, minHeight: 300, width: '100%' }}>
                  <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.default', borderRadius: 2, height: '100%', width: '100%' }}>
                    <FrontierPlot data={frontier} showAllPoints={showAllPoints} />
                  </Paper>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showAllPoints}
                          onChange={(_, checked) => setShowAllPoints(checked)}
                          color="primary"
                        />
                      }
                      label="Show all points"
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
          {/* Disclaimer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Disclaimer: This tool is for educational and demonstration purposes only. Not financial advice.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}