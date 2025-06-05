import * as tf from '@tensorflow/tfjs';
import { EfficientOptimizer } from './efficientOptimizer.ts';
import * as obj from './objectives.ts';
// import * as cons from './constraints.ts';

export type FrontierPoint = {
  targetReturn: number;
  risk: number;
  weights: number[];
};

export async function computeEfficientFrontier(
  mu: number[],
  cov: number[][],
  nPoints: number,
  constraintFns: ((w: tf.Tensor) => tf.Scalar)[]
): Promise<FrontierPoint[]> {
  const minRet = Math.min(...mu);
  const maxRet = Math.max(...mu);

  const points: FrontierPoint[] = [];
  for (let i = 0; i < nPoints; ++i) {
    const targetReturn = minRet + (maxRet - minRet) * i / (nPoints - 1);
    const opt = new EfficientOptimizer(mu, cov);

    // User-specified constraints
    constraintFns.forEach(fn => opt.addConstraint(fn));

    // Always enforce sum-to-one (unless user wants otherwise)
    // opt.addConstraint(cons.sumToOne());

    // Target return constraint for this frontier point
    opt.addConstraint(w => {
      const muT = tf.tensor1d(mu);
      const ret = tf.sum(w.mul(muT));
      const penalty = tf.square(ret.sub(targetReturn)).mul(1000).asScalar();
      muT.dispose();
      return penalty;
    });

    await opt.optimize(obj.portfolioVariance, 'minimize');
    const weights = opt.getWeights()!;
    const perf = opt.getPerformance();

    points.push({
      targetReturn,
      risk: perf.risk,
      weights,
    });
  }
  return points;
}
