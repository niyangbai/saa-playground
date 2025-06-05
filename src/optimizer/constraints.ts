import * as tf from '@tensorflow/tfjs';

/** No shorting: all weights >= 0 */
export function noShort(penalty = 1000) {
  return (w: tf.Tensor) => tf.sum(tf.relu(tf.neg(w))).mul(penalty) as tf.Scalar;
}

/** Sum to one: sum(w) == 1 */
export function sumToOne(penalty = 1000) {
  return (w: tf.Tensor) => tf.square(tf.sum(w).sub(1)).mul(penalty) as tf.Scalar;
}

/** Per-asset bounds: minVec[i] <= w[i] <= maxVec[i] */
export function bounds(minVec: number[], maxVec: number[], penalty = 1000) {
  return (w: tf.Tensor) =>
    tf.addN(minVec.map((min, i) => tf.relu(tf.scalar(min).sub(w.slice([i], [1])))))
      .add(tf.addN(maxVec.map((max, i) => tf.relu(w.slice([i], [1]).sub(tf.scalar(max))))))
      .mul(penalty);
}

/** Group allocation upper bound: sum of w[groupIdx] <= max */
export function groupMax(groupIdx: number[], max: number, penalty = 1000) {
  return (w: tf.Tensor) =>
    tf.sum(tf.gather(w, groupIdx)).sub(max).relu().mul(penalty);
}

/** Group allocation lower bound: sum of w[groupIdx] >= min */
export function groupMin(groupIdx: number[], min: number, penalty = 1000) {
  return (w: tf.Tensor) =>
    tf.scalar(min).sub(tf.sum(tf.gather(w, groupIdx))).relu().mul(penalty);
}

/** Max weight across all assets <= max */
export function maxWeight(max: number, penalty = 1000) {
  return (w: tf.Tensor) =>
    tf.relu(tf.max(w).sub(max)).mul(penalty);
}

/** Min weight across all assets >= min */
export function minWeight(min: number, penalty = 1000) {
  return (w: tf.Tensor) =>
    tf.relu(tf.sub(tf.scalar(min), tf.min(w))).mul(penalty);
}

/** Turnover constraint: sum(abs(w - prevW)) <= maxTurnover */
export function turnover(prevW: number[], maxTurnover: number, penalty = 1000) {
  return (w: tf.Tensor) => {
    const prev = tf.tensor1d(prevW);
    const val = tf.sum(tf.abs(w.sub(prev))).sub(maxTurnover).relu().mul(penalty);
    prev.dispose();
    return val;
  };
}

/** Risk budget: max risk contrib per asset <= maxFraction */
export function riskBudget(cov: number[][], maxFraction: number, penalty = 1000) {
  return (w: tf.Tensor) => {
    const covT = tf.tensor2d(cov);
    const portStd = tf.sqrt(tf.dot(w, tf.dot(covT, w)));
    const margRisk = tf.matMul(covT, w.reshape([-1, 1])).div(portStd);
    const contrib = w.mul(margRisk.reshape([w.shape[0]])).div(portStd);
    const val = tf.sum(tf.relu(contrib.sub(maxFraction))).mul(penalty);
    covT.dispose();
    margRisk.dispose();
    contrib.dispose();
    portStd.dispose();
    return val;
  };
}
