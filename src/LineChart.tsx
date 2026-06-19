import React from 'react';
import { View, StyleSheet } from 'react-native';

type Point = {
  x: number;
  y: number;
};

type LineChartProps = {
  data: Point[];
  width: number;
  height: number;
  padding?: number;
};

export function LineChart({
  data,
  width,
  height,
  padding = 12,
}: LineChartProps) {
  if (data.length < 2) {
    return <View style={[styles.chart, { width, height }]} />;
  }

  const xValues = data.map((p) => p.x);
  const yValues = data.map((p) => p.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const toScreenPoint = (point: Point) => {
    const screenX = padding + ((point.x - minX) / xRange) * plotWidth;

    // y ist in Screen-Koordinaten invertiert:
    // kleinere y-Werte oben, größere unten
    const screenY =
      padding + plotHeight - ((point.y - minY) / yRange) * plotHeight;

    return { x: screenX, y: screenY };
  };

  const screenPoints = data.map(toScreenPoint);

  return (
    <View style={[styles.chart, { width, height }]}>
      {screenPoints.slice(0, -1).map((start, index) => {
        const end = screenPoints[index + 1];

        const dx = end.x - start.x;
        const dy = end.y - start.y;

        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        return (
          <View
            key={index}
            style={[
              styles.lineSegment,
              {
                width: length,
                left: start.x,
                top: start.y,
                transform: [{ rotateZ: `${angle}rad` }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#333',
    transformOrigin: 'left center',
  },
});
