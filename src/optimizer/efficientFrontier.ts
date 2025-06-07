import * as tf from '@tensorflow/tfjs';
import { EfficientOptimizer } from './efficientOptimizer.ts';
import * as obj from './objectives.ts';

export type ScatterPoint = {
  risk: number;
  ret: number;
  weights: number[];
  targetReturn: number;
};

export async function collectFrontierScatterPoints(
  mu: number[],
  cov: number[][],
  nPoints: number,
  constraintFns: ((w: tf.Tensor) => tf.Scalar)[]
): Promise<ScatterPoint[]> {
  const minRet = Math.min(...mu);
  const maxRet = Math.max(...mu);

  const allPoints: ScatterPoint[] = [];
  for (let i = 0; i < nPoints; ++i) {
    const targetReturn = minRet + (maxRet - minRet) * i / (nPoints - 1);
    const opt = new EfficientOptimizer(mu, cov);

    constraintFns.forEach(fn => opt.addConstraint(fn));

    opt.addConstraint(w => {
      const muT = tf.tensor1d(mu);
      const ret = tf.sum(w.mul(muT));
      const penalty = tf.square(ret.sub(targetReturn)).mul(1000).asScalar();
      muT.dispose();
      return penalty;
    });

    // Collect all intermediate points for this run
    const stepPoints: ScatterPoint[] = [];
    await opt.optimize(
      obj.portfolioVariance,
      'minimize',
      1,
      false,
      (weights, ret, risk) => {
        stepPoints.push({ risk, ret, weights: [...weights], targetReturn });
      }
    );
    allPoints.push(...stepPoints);
  }

  return allPoints;
}