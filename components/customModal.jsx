import { Octicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import Loader from './loader';

export default function CustomModal({children, title, onClose, visible, loading}){
  const { width, height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.modalContainer, {width: width, height: height * 0.93}]}> 
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Octicons name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        {loading ? <Loader /> : children}
      </SafeAreaView>
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
})