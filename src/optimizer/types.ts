import type * as tf from '@tensorflow/tfjs';

/**
 * A constraint function takes a portfolio weights tensor (1D) and
 * returns a scalar penalty (0 if satisfied, positive if violated).
 */
export type ConstraintFn = (w: tf.Tensor) => tf.Scalar;

/**
 * An objective function takes portfolio weights (1D),
 * expected returns (1D), and covariance matrix (2D),
 * and returns a scalar (the value to optimize: lower is better for minimize).
 */
export type ObjectiveFn = (w: tf.Tensor, mu: tf.Tensor1D, cov: tf.Tensor2D) => tf.Scalar;

/**
 * Optimization direction: minimize or maximize
 */
export type Direction = 'minimize' | 'maximize';
