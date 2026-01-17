import { Octicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from './colors';
import Loader from './loader';

export default function CustomModal({children, title, onClose, visible, loading}){

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={s.modalContainer}> 
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Octicons name="x" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        {loading ? <Loader /> : children}
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    backgroundColor: colors.card,
    borderRadius: 20,
    flex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    top: 50,
    shadowColor: '#000',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
  },
  headerText: {
    fontSize: 22,
    color: colors.text,
    fontWeight: 800,
  },
  modalHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  btn: {
    padding: 10,
    backgroundColor: colors.border,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
})