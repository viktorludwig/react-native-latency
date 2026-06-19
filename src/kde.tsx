function gaussianKernel(u: number) {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
}

function kdeAtX(values: number[], x: number, bandwidth: number) {
  let sum = 0;

  for (const value of values) {
    const normalizedDistance = (x - value) / bandwidth;
    sum += gaussianKernel(normalizedDistance);
  }

  return sum / (values.length * bandwidth);
}

function computeKDE(values: number[], bandwidth: number, numPoints: number) {
  if (values.length === 0) {
    return [];
  }

  if (bandwidth <= 0) {
    throw new Error('bandwidth must be greater than 0');
  }

  if (numPoints < 2) {
    throw new Error('numPoints must be at least 2');
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ x: min, y: 1 }];
  }
  const step = (max - min) / (numPoints - 1);

  const kdeValues = [];
  for (let i = 0; i < numPoints; i++) {
    const x = min + i * step;
    kdeValues.push({ x, y: kdeAtX(values, x, bandwidth) });
  }

  return kdeValues;
}

export { computeKDE };
