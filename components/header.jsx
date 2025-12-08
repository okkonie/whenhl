import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../assets/colors'
export default function Header({children, text}){
  return (
    <View style={s.header}>
      <Text style={s.headerText}>{text}</Text>
      <View style={s.buttons}>
        {children}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    paddingLeft: 10,
    fontSize: 16,
    color: colors.text,
    fontWeight: 700,
  },
  buttons: {
    gap: 10,
    alignItems: 'center',
    flexDirection: 'row'
  },
})