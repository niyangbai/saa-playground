import * as tf from '@tensorflow/tfjs';

/** Portfolio variance */
export function portfolioVariance(w: tf.Tensor, _mu: tf.Tensor1D, cov: tf.Tensor2D): tf.Scalar {
  return tf.dot(w, tf.dot(cov, w)) as tf.Scalar;
}

/** Portfolio return */
export function portfolioReturn(w: tf.Tensor, mu: tf.Tensor1D): tf.Scalar {
  return tf.sum(w.mul(mu)) as tf.Scalar;
}

/** Sharpe ratio (rf optional, default 0) */
export function sharpeRatio(w: tf.Tensor, mu: tf.Tensor1D, cov: tf.Tensor2D): tf.Scalar {
  const ret = tf.sum(w.mul(mu));
  const std = tf.sqrt(tf.dot(w, tf.dot(cov, w)));
  return ret.div(std.add(1e-8)) as tf.Scalar;
}

/** Diversification ratio */
export function diversificationRatio(w: tf.Tensor, _mu: tf.Tensor1D, cov: tf.Tensor2D): tf.Scalar {
  const stds = tf.tensor1d(cov.arraySync().map((row: number[], i: number) => Math.sqrt(row[i])));
  const numer = tf.sum(w.mul(stds));
  const denom = tf.sqrt(tf.dot(w, tf.dot(cov, w)));
  const ratio = numer.div(denom) as tf.Scalar;
  stds.dispose();
  denom.dispose();
  return ratio;
}

/** Example: user custom metric (just pass a function (w, mu, cov) => tf.Scalar) */
