import { Octicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import Loader from './loader';

export default function CustomModal({children, title, onClose, visible, loading, modalHeight = 0.93}){
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

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
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
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
    backgroundColor: colors.background,
    borderRadius: 15,
    flex: 1
  },
  headerText: {
    fontSize: 22,
    color: colors.text,
    fontWeight: 800,
  },
  modalHeader: {
    height: 50,
    paddingHorizontal: 20,
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
    backgroundColor: colors.highlight,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
})