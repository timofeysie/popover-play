export interface QuadraticCoefficients {
  /** Coefficient of t^2 — half of gravity's downward pull. Negative for a thrown ball. */
  a: number;
  /** Coefficient of t — the ball's initial upward velocity. */
  b: number;
  /** Constant term — the ball's initial height off the ground. */
  c: number;
}

export function heightAt({ a, b, c }: QuadraticCoefficients, t: number): number {
  return a * t * t + b * t + c;
}

/** Time at which the parabola reaches its vertex (the ball's peak height). */
export function vertexTime({ a, b }: QuadraticCoefficients): number {
  return -b / (2 * a);
}

/** How long the ball is in the air — the positive root of h(t) = 0. */
export function flightDuration(coeffs: QuadraticCoefficients): number {
  const { a, b, c } = coeffs;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 0;

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const roots = [(-b + sqrtDiscriminant) / (2 * a), (-b - sqrtDiscriminant) / (2 * a)];
  const positiveRoots = roots.filter((t) => t > 1e-6);

  return positiveRoots.length > 0 ? Math.max(...positiveRoots) : 0;
}
