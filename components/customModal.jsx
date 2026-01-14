import { Octicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from './colors';
import Loader from './loader';

export default function CustomModal({children, title, onClose, visible, loading, modalHeight = 0.92}){
  const { width, height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[s.modalContainer, {
        width: width, 
        height: height * modalHeight,
      }]}> 
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
    bottom: 0,
    backgroundColor: colors.card,
    borderRadius: 15,
    flex: 1
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