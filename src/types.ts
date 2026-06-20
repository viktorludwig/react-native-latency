export type Point = {
  x: number;
  y: number;
};

export type MarkerVariant = 'min' | 'median' | 'p95' | 'max';

export type Marker = {
  key: MarkerVariant;
  label: string;
  value: number;
};

export type ChartPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type LineChartProps = {
  data: Point[];
  markers?: Marker[];
  width: number;
  height: number;
  padding?: ChartPadding;
};
