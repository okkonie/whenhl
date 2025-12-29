import { StyleSheet, Text, View } from "react-native";
import { colors } from '../assets/colors';

export default function StatBar({ leftLabel, rightLabel, leftValue, rightValue, leftColor, rightColor }) {
  const total = leftValue + rightValue;
  const leftPercent = (leftValue / total) * 100;
  const rightPercent = (rightValue / total) * 100;

  return (
    <View style={s.container}>
      <View style={s.labels}>
        <Text style={s.label}>{leftLabel}</Text>
        <Text style={s.label}>{rightLabel}</Text>
      </View>
      <View style={s.barContainer}>
        <View style={[s.bar, { width: `${leftPercent}%`, backgroundColor: leftColor }]}>
          <Text style={s.value}>{leftValue}</Text>
        </View>
        <View style={[s.bar, s.rightBar, { width: `${rightPercent}%`, backgroundColor: rightColor }]}>
          <Text style={s.value}>{rightValue}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 10,
    gap: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  label: {
    color: colors.text2,
    fontSize: 14,
  },
  barContainer: {
    backgroundColor: colors.card,
    borderRadius: 25,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  bar: {
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
    maxWidth: '85%',
  },
  rightBar: {
    alignItems: 'flex-end',
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
