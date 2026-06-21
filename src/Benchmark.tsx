import { useState } from 'react';
import { Pressable, Platform, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { computeKDE } from './kde';
import { LineChart } from './LineChart';
import { computeStats } from './stats';
import type { Marker, Point } from './types';

export type BenchmarkProps = {
  /**
   * Function that should be benchmarked. It is executed once as warmup and then
   * repeatedly for measured runs. Async callbacks are awaited and measured end to end.
   */
  callback: () => void | Promise<void>;
  /**
   * Optional label shown below the benchmark results. When omitted, the component
   * derives a best-effort device label from React Native's Platform constants.
   */
  deviceLabel?: string;
};

function getDefaultDeviceLabel() {
  if (Platform.OS === 'android') {
    return `${Platform.constants.Manufacturer}: ${Platform.constants.Model}`;
  }

  if (Platform.OS === 'ios') {
    return `Apple: ${Platform.constants.systemName} ${Platform.constants.osVersion}`;
  }

  return Platform.OS;
}

/**
 * Runs a small interactive latency benchmark for a synchronous or asynchronous callback.
 *
 * The component renders a button, executes the provided callback across repeated runs,
 * then displays a density chart plus min, median, p95, max, and initial-run timings.
 * For realistic measurements, run it in a production or non-development build.
 */
export function Benchmark(props: BenchmarkProps) {
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLoop, setCurrentLoop] = useState(0);

  const [initialLatency, setInitialLatency] = useState(0);

  const [kdeData, setKDEData] = useState<Point[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);

  const statsConfig: Record<string, { color: string }> = {
    median: {
      color: 'navy',
    },
    p95: {
      color: 'maroon',
    },
    min: {
      color: 'black',
    },
    max: {
      color: 'black',
    },
    initial: {
      color: 'black',
    },
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const deviceLabel = props.deviceLabel ?? getDefaultDeviceLabel();

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
      await props.callback();

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
    <View style={styles.benchmark}>
      <Text>Function: {props.callback.name}</Text>
      {isRunning ? (
        <>
          <Text>Running benchmark, loop: {currentLoop}</Text>
          <ProgressBar progress={currentLoop / 100} />
        </>
      ) : (
        <Pressable
          onPress={runBenchmark}
          style={({ pressed }) =>
            pressed
              ? { ...styles.button, opacity: 0.5 }
              : { ...styles.button, opacity: 1 }
          }
        >
          <Text style={styles.buttonText}>
            {hasRun ? 'Run Benchmark Again' : 'Run Benchmark'}
          </Text>
        </Pressable>
      )}

      {hasRun && (
        <View style={styles.container}>
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
                <Text
                  style={[
                    styles.statsLabel,
                    { color: statsConfig[marker.key].color },
                  ]}
                >
                  {marker.label}
                </Text>

                <Text
                  style={[
                    styles.statsValue,
                    { color: statsConfig[marker.key].color },
                  ]}
                >
                  {marker.value.toFixed(2)}
                </Text>

                <Text
                  style={[
                    styles.statsUnit,
                    { color: statsConfig[marker.key].color },
                  ]}
                >
                  ms
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <Text style={styles.deviceInfo}>{deviceLabel}</Text>

      {__DEV__ && (
        <Text style={styles.devModeWarning}>
          Development mode detected, for more realistic results, run on a
          production build or with development build and "npx expo start
          --dev-client --no-dev --minify".
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  benchmark: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 32,
    marginTop: 16,
    backgroundColor: 'teal',
    color: 'white',
    padding: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    padding: 8,
  },
  container: {
    marginTop: 32,
    alignItems: 'center',
  },
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
    fontWeight: 'bold',
  },
  statsValue: {
    width: 128,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsUnit: {
    width: 24,
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  devModeWarning: {
    marginHorizontal: 60,
    color: 'grey',
    marginBottom: 16,
  },
  deviceInfo: {
    fontSize: 12,
    marginBottom: 16,
    marginTop: 36,
    marginHorizontal: 60,
    alignSelf: 'flex-start',
  },
});
