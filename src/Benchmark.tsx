import { useState } from 'react';
import { Button, Text } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { computeKDE } from './kde';
import { LineChart } from './LineChart';

type Props = {
  callback: () => void;
};

export function BenchMark(props: Props) {
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLoop, setCurrentLoop] = useState(0);

  const [latency, setLatency] = useState(0);
  const [initialLatency, setInitialLatency] = useState(0);

  const [kdeData, setKDEData] = useState<{ x: number; y: number }[]>([]);

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

    const avgResult =
      results.reduce((sum, result) => sum + result, 0) / results.length;
    setLatency(avgResult);
    console.log(`Avg Latency: ${avgResult} ms`);
    setHasRun(true);
    setIsRunning(false);

    const curve = computeKDE(results, 1, 100);
    setKDEData(curve);
    console.log('KDE Data:', curve);
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
          <Text>Measured avg {latency.toFixed(2)} ms,</Text>
          <Text>Initial warmup run: {initialLatency.toFixed(2)} ms</Text>
          <LineChart width={300} height={200} data={kdeData} />
        </>
      )}
    </>
  );
}
