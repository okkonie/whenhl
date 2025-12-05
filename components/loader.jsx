import { ActivityIndicator, StyleSheet, View } from 'react-native'

export default function Loader(){
  return (
    <View style={s.loader}>
      <ActivityIndicator color="#fff" />
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