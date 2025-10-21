import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CustomModal({ 
  visible, 
  onClose, 
  title = "INFO",
  loading = false,
  children 
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.modalContainer}>
        <View style={s.sheet}>
          <View style={s.headerRow}>
            <Text style={s.headerText}>
              {title}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={s.loaderContainer}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch'
  },
  sheet: {
    backgroundColor: '#111',
    width: '100%',
    height: '90%',
    borderTopWidth: 1,
    borderColor: '#222',
  },
  headerRow: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    paddingLeft: 15,
    fontSize: 14,
    fontWeight: 700,
    color: '#b0b0b0',
  },
  closeBtn: {
    padding: 15,
  }
});