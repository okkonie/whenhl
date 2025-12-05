import { StyleSheet, TouchableOpacity } from "react-native";

export default function statMode(mode, visible, onClose){
  const modes = ['points', 'goals', 'assists', 
                'plusMinus', 'toi', 'goalsPp', 
                'faceoffLeaders', 'penaltyMins'
                ]

  return  (
    <TouchableOpacity style={s.back} onPress={onClose}>
      <Modal>
        
      </Modal>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  back: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)'
  }
})