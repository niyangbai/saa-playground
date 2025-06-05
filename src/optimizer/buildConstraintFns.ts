import * as tf from '@tensorflow/tfjs';
import * as cons from './constraints';
import type { ConstraintConfig } from '../components/ConstraintBuilder';

// Converts ConstraintConfig objects to constraint functions returning tf.Scalar
export function buildConstraintFns(
  constraints: ConstraintConfig[]
): ((w: tf.Tensor) => tf.Scalar)[] {
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
        const cov = JSON.parse(cfg.cov); // expects a JSON string for the covariance matrix
        return (w: tf.Tensor) => cons.riskBudget(cov, Number(cfg.maxFraction))(w).asScalar();
      }
      default:
        throw new Error(`Unknown constraint key: ${(cfg as any).key}`);
    }
  });
}
