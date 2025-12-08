import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { colors } from '../assets/colors'

export default function Loader(){
  return (
    <View style={s.loader}>
      <ActivityIndicator color={colors.text}/>
    </View>
  )
}

const s = StyleSheet.create({
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
})