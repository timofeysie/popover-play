import { describe, it, expect } from "vitest";
import { heightAt, vertexTime, flightDuration } from "@/features/mathRefresher/trajectory";

describe("quadratic trajectory math", () => {
  const coeffs = { a: -4.9, b: 20, c: 1 };

  it("evaluates h(t) = at^2 + bt + c", () => {
    expect(heightAt(coeffs, 0)).toBe(1);
    expect(heightAt({ a: -1, b: 0, c: 10 }, 2)).toBe(6);
  });

  it("finds the vertex time -b / 2a", () => {
    expect(vertexTime(coeffs)).toBeCloseTo(2.0408, 3);
  });

  it("finds the positive landing time (root of h(t) = 0)", () => {
    const landing = flightDuration(coeffs);
    expect(landing).toBeGreaterThan(0);
    expect(heightAt(coeffs, landing)).toBeCloseTo(0, 6);
  });

  it("returns 0 when the parabola never reaches the ground (invalid physical setup)", () => {
    expect(flightDuration({ a: -1, b: 0, c: -5 })).toBe(0);
  });
});
