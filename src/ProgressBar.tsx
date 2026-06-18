import { View, StyleSheet } from 'react-native';

type ProgressBarProps = {
  progress: number; // 0 - 1
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '80%',
    height: 10,
    borderRadius: 20,
    backgroundColor: 'lightgray',
    overflow: 'hidden',
    margin: 20,
  },
  fill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'navy',
  },
});
