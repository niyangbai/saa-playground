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
    targetSum: number = 1,
    noShorting: boolean = false,
    onStep?: (weights: number[], ret: number, risk: number) => void
  ): Promise<number[]> {
    const n = this.mu.length;
    const w = tf.variable(tf.fill([n], 1 / n));
    const muT = tf.tensor1d(this.mu);
    const covT = tf.tensor2d(this.cov);

    const lossFn = (w: tf.Tensor) => {
      let loss = objective(w, muT, covT);
      if (direction === 'maximize') loss = tf.neg(loss);
      for (const constraint of this.constraints) {
        loss = loss.add(constraint(w));
      }
      return loss;
    };

    const optimizer = tf.train.adam(0.05);
    for (let step = 0; step < 200; ++step) {
      optimizer.minimize(() => lossFn(w), false);
      w.assign(w.div(w.sum()).mul(targetSum));
      if (noShorting) {
        w.assign(tf.maximum(w, 0));
        w.assign(w.div(w.sum()).mul(targetSum));
      }

      // Collect intermediate points
      if (onStep) {
        const weights = Array.from(await w.data());
        // Compute return and risk
        const ret = weights.reduce((sum, wi, i) => sum + wi * this.mu[i], 0);
        let risk = 0;
        for (let i = 0; i < weights.length; ++i) {
          for (let j = 0; j < weights.length; ++j) {
            risk += weights[i] * weights[j] * this.cov[i][j];
          }
        }
        risk = Math.sqrt(risk);
        onStep(weights, ret, risk);
      }
    }

    const weights = Array.from(await w.data());
    this.latestWeights = weights;
    this._updateStats(weights, objective);

    w.dispose();
    muT.dispose();
    covT.dispose();

    return weights;
  }

  _updateStats(weights: number[], objective: ObjectiveFn) {
    // Compute return and risk
    const ret = weights.reduce((sum, wi, i) => sum + wi * this.mu[i], 0);

    let risk = 0;
    for (let i = 0; i < weights.length; ++i) {
      for (let j = 0; j < weights.length; ++j) {
        risk += weights[i] * weights[j] * this.cov[i][j];
      }
    }
    risk = Math.sqrt(risk);

    // Compute value of the objective
    const wT = tf.tensor1d(weights);
    const muT = tf.tensor1d(this.mu);
    const covT = tf.tensor2d(this.cov);
    const objValue = objective(wT, muT, covT).arraySync() as number;

    this.lastPerf = { ret, risk, obj: objValue };

    wT.dispose();
    muT.dispose();
    covT.dispose();
  }

  getWeights() {
    return this.latestWeights;
  }

  getPerformance() {
    return this.lastPerf;
  }
}
