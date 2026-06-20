import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { computeKDE } from './kde';
import { LineChart } from './LineChart';
import { computeStats } from './stats';
import type { Marker, Point } from './types';

type Props = {
  callback: () => void;
};

export function BenchMark(props: Props) {
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLoop, setCurrentLoop] = useState(0);

  const [initialLatency, setInitialLatency] = useState(0);

  const [kdeData, setKDEData] = useState<Point[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const runBenchmark = async () => {
    const warmupRuns = 1;
    const measuredRuns = 100;
    const results = [];
    setIsRunning(true);
    setHasRun(false);
    await delay(0);

    for (let i = 0; i < warmupRuns + measuredRuns; i++) {
      setCurrentLoop(i);
      const start = performance.now();
      props.callback();

      const end = performance.now();
      const measurement = end - start;
      if (i < warmupRuns) {
        setInitialLatency(measurement);
      } else {
        results.push(measurement);
      }

      await delay(0);
    }

    setHasRun(true);
    setIsRunning(false);

    const curve = computeKDE(results, 0.1, 100);
    setKDEData(curve);

    const stats = computeStats(results);
    setMarkers(stats);
  };

  return (
    <>
      {isRunning ? (
        <>
          <Text>Running benchmark, loop: {currentLoop}</Text>
          <ProgressBar progress={currentLoop / 100} />
        </>
      ) : (
        <Button title="Run Benchmark" onPress={runBenchmark} />
      )}

      {hasRun && (
        <>
          <LineChart
            width={300}
            height={200}
            data={kdeData}
            markers={markers}
          />
          <View style={styles.statsTable}>
            {[
              ...markers,
              {
                key: 'initial',
                label: 'Initial',
                value: initialLatency,
              },
            ].map((marker) => (
              <View key={marker.key} style={styles.statsRow}>
                <Text style={styles.statsLabel}>{marker.label}</Text>

                <Text style={styles.statsValue}>{marker.value.toFixed(2)}</Text>

                <Text style={styles.statsUnit}>ms</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  statsTable: {
    marginTop: 32,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  statsLabel: {
    width: 128,
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
  },
  statsValue: {
    width: 128,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  statsUnit: {
    width: 24,
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
});
