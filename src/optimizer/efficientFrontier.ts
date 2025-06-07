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

  // Sort by risk (volatility), and for duplicate risks, keep the one with max return
  points.sort((a, b) => a.risk - b.risk);

  // Remove duplicates: keep only the point with max return for each unique risk
  const uniquePoints: FrontierPoint[] = [];
  let lastRisk: number | null = null;
  const riskThreshold = 1e-5; // Increased threshold for deduplication
  for (const pt of points) {
    if (lastRisk === null || Math.abs(pt.risk - lastRisk) > riskThreshold) {
      uniquePoints.push(pt);
      lastRisk = pt.risk;
    } else {
      if (pt.targetReturn > uniquePoints[uniquePoints.length - 1].targetReturn) {
        uniquePoints[uniquePoints.length - 1] = pt;
      }
    }
  }

  return uniquePoints;
}