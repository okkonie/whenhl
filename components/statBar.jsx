import { StyleSheet, Text, View } from "react-native";
import { colors } from '../assets/colors';

export default function StatBar({ label, value, valueOf }) {

  return (
    <View style={s.container}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value} / {valueOf}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 10,
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
    paddingVertical: 15
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
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
