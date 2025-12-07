import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

export default function StatMode({ mode, setMode, visible, onClose }) {
  const modes = ['points', 'goals', 'assists', 
                'plusMinus', 'toi', 'goalsPp', 
                'faceoffLeaders', 'penaltyMins'
                ]
  const goalieModes = ['savePctg', 'goalsAgainstAverage',
                      'wins', 'shutouts'
                      ]

  return  (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="fade">
      <TouchableOpacity style={s.back} onPress={onClose} activeOpacity={1}>
        <TouchableWithoutFeedback>
          <View style={s.sheet}>
            <Text style={s.header}>SKATER</Text>
            {modes.map((m) => (
              <Text key={m} style={s.text}>{m}</Text>
            ))}
            <Text style={s.header}>GOALIE</Text>
            {goalieModes.map((m) => (
              <Text key={m} style={s.text}>{m}</Text>
            ))}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  )
}

const s = StyleSheet.create({
  header: {
    fontWeight: 600,
    fontSize: 16,
    color: 'white',
    paddingVertical: 10
  },
  text: {
    paddingVertical: 6,
    color: 'white'
  },
  back: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  sheet: {
    padding: 30,
    minWidth: '70%',
    borderRadius: 15,
    backgroundColor: '#171717',
  }
})