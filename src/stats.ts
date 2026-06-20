import type { Marker } from './types';

function percentile(values: number[], p: number) {
  /* Calculates the p-th percentile, if calculated index is fractional, it interpolates between the two closest values. */

  if (!values || values.length < 1) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = p * (sorted.length - 1);

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  console.log('Percentile calculation:', { p, index, lower, upper, sorted });

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function computeStats(values: number[]): Marker[] {
  if (values.length === 0 || !values) {
    return [];
  }

  const sorted = [...values].sort((a, b) => a - b);

  return [
    { key: 'min', label: 'min', value: sorted[0] },
    { key: 'median', label: 'median', value: percentile(values, 0.5) },
    { key: 'p95', label: '95th percentile', value: percentile(values, 0.95) },
    { key: 'max', label: 'max', value: sorted[sorted.length - 1] },
  ];
}
