# react-native-latency

Run small latency experiments in React Native and visualize the result directly
in your app. `react-native-latency` measures a callback over repeated runs and
shows a density chart plus min, median, p95, max, and initial-run timings.

- TypeScript support
- Zero runtime dependencies
- Supports sync and async callbacks
- Works with React Native `>=0.73.0`

## Installation

```sh
npm install react-native-latency
```

```sh
bun add react-native-latency
```

## Usage

For meaningful numbers, run benchmarks in a production build or in a
non-development build. Development mode adds React Native and tooling overhead
that can dominate short-running callbacks.

If you use Expo development builds, start Metro without development mode and
with minification:

```sh
npx expo start --dev-client --no-dev --minify
```

```tsx
import { Benchmark } from 'react-native-latency';

export function Example() {
  return (
    <Benchmark
      deviceLabel="Apple: iPhone 17 Pro"
      callback={async () => {
        await expensiveOperation();
      }}
    />
  );
}
```

The callback can also be synchronous:

```tsx
<Benchmark
  callback={() => {
    expensiveOperation();
  }}
/>
```

## Props

| Prop          | Type                          | Required | Description                                                                                                         |
| ------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `callback`    | `() => void \| Promise<void>` | Yes      | Function to benchmark. Async callbacks are awaited and measured end to end.                                         |
| `deviceLabel` | `string`                      | No       | Label shown below the benchmark. If omitted, a best-effort label is derived from React Native `Platform` constants. |

## Notes

On iOS, React Native's built-in `Platform` constants do not expose marketing
device names such as `iPhone 17 Pro`; pass `deviceLabel` if you want to show one.

## Compatibility

```json
{
  "react": ">=18.2.0",
  "react-native": ">=0.73.0"
}
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
