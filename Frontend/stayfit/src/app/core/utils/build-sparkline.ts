export interface SparklinePoint {
  x: number;
  y: number;
}

export interface SparklineData {
  polyline: string;
  last: SparklinePoint;
}

export function buildSparkline(valuesOldestFirst: number[], width = 240, height = 60): SparklineData | null {
  if (valuesOldestFirst.length < 2) return null;

  const min = Math.min(...valuesOldestFirst);
  const max = Math.max(...valuesOldestFirst);
  const range = max - min || 1;
  const stepX = width / (valuesOldestFirst.length - 1);

  const coords: SparklinePoint[] = valuesOldestFirst.map((value, i) => ({
    x: i * stepX,
    y: height - ((value - min) / range) * height,
  }));

  return {
    polyline: coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' '),
    last: coords[coords.length - 1],
  };
}
