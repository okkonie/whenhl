import { View, StyleSheet, Modal, Text, TouchableOpacity } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PlayerOptions({ visible = true, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={s.modalContainer} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
          style={s.sheetWrapper}
        >
          <View style={s.sheet}>
            <View style={s.headerRow}>
              <Text style={s.headerText}>
                Options
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={s.settings}>

            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

    </Modal>
  )
}

const s = StyleSheet.create({
  settings: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sheetWrapper: {
    width: '90%',
    height: '50%',
  },
  sheet: {
    backgroundColor: '#111',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: '#222',
    borderRadius: 10,
  },
  headerRow: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    paddingLeft: 20,
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
  },
  closeBtn: {
    padding: 20,
  },
})