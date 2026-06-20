import { View, Text, StyleSheet } from 'react-native';
import type { LineChartProps, MarkerVariant } from './types';

export function LineChart({
  data,
  markers = [],
  width,
  height,
  padding = {
    top: 28,
    right: 36,
    bottom: 30,
    left: 36,
  },
}: LineChartProps) {
  if (data.length < 2) {
    return <View style={[viewStyles.chart, { width, height }]} />;
  }

  const xValues = data.map((p) => p.x);
  const yValues = data.map((p) => p.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const plotTop = padding.top;
  const plotBottom = padding.top + plotHeight;

  const toScreenX = (x: number) => {
    return padding.left + ((x - minX) / xRange) * plotWidth;
  };

  const toScreenY = (y: number) => {
    return padding.top + plotHeight - ((y - minY) / yRange) * plotHeight;
  };

  const screenPoints = data.map((point) => ({
    x: toScreenX(point.x),
    y: toScreenY(point.y),
  }));

  const markerConfig: Record<
    MarkerVariant,
    { color: string; textTop: number; viewTop: number; valueTop?: number }
  > = {
    median: {
      color: 'navy',
      textTop: 14,
      valueTop: plotBottom + 16,
      viewTop: plotTop + 10,
    },
    p95: {
      color: 'maroon',
      textTop: 4,
      viewTop: plotTop + 4,
      valueTop: plotBottom + 4,
    },
    min: {
      color: 'black',
      textTop: 4,
      viewTop: plotTop + 4,
      valueTop: plotBottom + 4,
    },
    max: {
      color: 'black',
      textTop: 4,
      viewTop: plotTop + 4,
      valueTop: plotBottom + 4,
    },
  };

  return (
    <View style={[viewStyles.chart, { width, height }]}>
      {/* Vertikale Marker */}
      {markers.map((marker) => {
        const x = toScreenX(marker.value);

        return (
          <View key={marker.key}>
            <View
              style={[
                viewStyles.markerLine,
                {
                  left: x,
                  top: markerConfig[marker.key].viewTop,
                  height: plotHeight,
                  backgroundColor: markerConfig[marker.key].color,
                },
              ]}
            />

            <Text
              style={[
                viewStyles.markerTopLabel,
                {
                  left: x - 30,
                  top: markerConfig[marker.key].textTop,
                  color: markerConfig[marker.key].color,
                },
              ]}
              numberOfLines={1}
            >
              {marker.label}
            </Text>

            <Text
              style={[
                viewStyles.markerBottomLabel,
                {
                  left: x - 34,
                  top: markerConfig[marker.key].valueTop,
                  color: markerConfig[marker.key].color,
                },
              ]}
              numberOfLines={1}
            >
              {marker.value?.toFixed(2)}ms
            </Text>
          </View>
        );
      })}

      {/* Line Chart */}
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
              viewStyles.lineSegment,
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

      {/* x-Achse */}
      <View
        style={[
          viewStyles.xAxis,
          {
            left: padding.left,
            top: plotBottom,
            width: plotWidth,
          },
        ]}
      />
    </View>
  );
}

const viewStyles = StyleSheet.create({
  chart: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#333',
    transformOrigin: 'left center',
  },
  xAxis: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#aaa',
  },
  markerLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#999',
  },
  markerTopLabel: {
    position: 'absolute',
    width: 60,
    textAlign: 'center',
    fontSize: 10,
    color: '#333',
  },
  markerBottomLabel: {
    position: 'absolute',
    width: 68,
    textAlign: 'center',
    fontSize: 10,
    color: '#333',
  },
});
