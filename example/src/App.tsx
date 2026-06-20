import { View, StyleSheet } from 'react-native';
import { BenchMark } from 'react-native-latency';

export default function App() {
  return (
    <View style={styles.container}>
      <BenchMark
        callback={() => {
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += Math.sqrt(i);
          }
          return sum;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
