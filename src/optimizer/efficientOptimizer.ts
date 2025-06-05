import * as tf from '@tensorflow/tfjs';
import type { ConstraintFn, ObjectiveFn, Direction } from './types';

export class EfficientOptimizer {
  mu: number[];
  cov: number[][];
  constraints: ConstraintFn[] = [];
  latestWeights: number[] | null = null;
  lastPerf: Record<string, number> = {};

  constructor(mu: number[], cov: number[][]) {
    this.mu = mu;
    this.cov = cov;
  }

  addConstraint(fn: ConstraintFn) {
    this.constraints.push(fn);
  }

  async optimize(
    objective: ObjectiveFn,
    direction: Direction = 'minimize',
  ): Promise<number[]> {
    const n = this.mu.length;
    const w = tf.variable(tf.fill([n], 1 / n));
    const mu = tf.tensor1d(this.mu);
    const cov = tf.tensor2d(this.cov);

    const lossFn = (w: tf.Tensor) => {
      let obj = objective(w, mu, cov);
      if (direction === 'maximize') obj = tf.neg(obj);
      let loss = obj;
      for (const c of this.constraints) loss = loss.add(c(w));
      return loss;
    };

    const opt = tf.train.adam(0.05);
    for (let i = 0; i < 200; ++i) {
      opt.minimize(() => lossFn(w), false);
    }
    const weights = Array.from(await w.data());
    this.latestWeights = weights;
    this._updateStats(weights, objective);

    w.dispose(); mu.dispose(); cov.dispose();
    return weights;
  }

  _updateStats(weights: number[], objective: ObjectiveFn) {
    this.lastPerf = {
      ret: weights.reduce((s, wi, i) => s + wi * this.mu[i], 0),
      risk: (() => {
        let risk = 0;
        for (let i = 0; i < weights.length; ++i)
          for (let j = 0; j < weights.length; ++j)
            risk += weights[i] * weights[j] * this.cov[i][j];
        return Math.sqrt(risk);
      })(),
      obj: 0 // Calculated below
    };
    // Compute value of the objective
    const wT = tf.tensor1d(weights);
    const muT = tf.tensor1d(this.mu);
    const covT = tf.tensor2d(this.cov);
    this.lastPerf.obj = objective(wT, muT, covT).arraySync() as number;
    wT.dispose(); muT.dispose(); covT.dispose();
  }

  getWeights() { return this.latestWeights; }
  getPerformance() { return this.lastPerf; }
}
