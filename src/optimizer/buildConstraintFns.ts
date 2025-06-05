import * as tf from '@tensorflow/tfjs';
import * as cons from './constraints';
import type { ConstraintConfig } from '../components/ConstraintBuilder';

// Converts ConstraintConfig objects to constraint functions returning tf.Scalar
export function buildConstraintFns(
  constraints: ConstraintConfig[],
  assets: string[]
): ((w: tf.Tensor) => tf.Scalar)[] {
  return constraints.map(cfg => {
    switch (cfg.key) {
      case 'noShort':
        // Make sure noShort returns tf.Scalar
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
