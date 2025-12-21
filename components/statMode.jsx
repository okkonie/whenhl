import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../assets/colors';

const modeLabels = {
  points: 'Points',
  goals: 'Goals',
  assists: 'Assists',
  plusMinus: 'Plus/Minus',
  toi: 'Time on Ice',
  goalsPp: 'Power Play Goals',
  faceoffLeaders: 'Faceoff %',
  penaltyMins: 'Penalty Minutes',
  savePctg: 'Save %',
  goalsAgainstAverage: 'Goals Against Avg',
  wins: 'Wins',
  shutouts: 'Shutouts',
};

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
        <View style={s.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.header}>SKATER</Text>
            {modes.map((m) => (
              <TouchableOpacity key={m} onPress={() => setMode(m)} activeOpacity={0.7}>
                <Text style={[s.text, mode === m && s.selected]}>{modeLabels[m]}</Text>
              </TouchableOpacity>
            ))}
            <Text style={s.header}>GOALIE</Text>
            {goalieModes.map((m) => (
              <TouchableOpacity key={m} onPress={() => setMode(m)} activeOpacity={0.7}>
                <Text style={[s.text, mode === m && s.selected]}>{modeLabels[m]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const s = StyleSheet.create({
  header: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.grey,
    paddingTop: 15,
    paddingBottom: 8,
  },
  text: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 16,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: colors.border,
    color: colors.yellow,
  },
  back: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  sheet: {
    padding: 15,
    minWidth: '70%',
    maxHeight: '70%',
    borderRadius: 15,
    backgroundColor: colors.card,
  }
})