import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View, StyleSheet, FlatList } from 'react-native';

export default function StatsDropdown({ skaterOn, selected, onSelect, modalVisible, setModalVisible }) {
  const skaterOptions = [
    'points',
    'goals',
    'assists',
    '+/-',
    'time on ice',
    'pp goals',
    'faceoff%',
    'penalty mins',
  ];
  const goalieOptions = [
    'save%',
    'goals against',
    'wins',
    'shutouts',
  ];

  const options = skaterOn ? skaterOptions : goalieOptions;

  const handleSelect = (value) => {
    onSelect(value);
    setModalVisible(false);
  };

  return (
    <View style={s.container}>
      <TouchableOpacity 
        style={s.btn} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={s.buttonText}>
          {selected || 'Select stat'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={s.modalContent} onPress={(e) => e.stopPropagation()}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.item, selected === item && s.itemActive]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.text, selected === item && s.textActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'relative',
  },
  btn: {
    backgroundColor: '#171717',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111',
    maxHeight: '50%',
    width: '70%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden'
  },
  item: {
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  itemActive: {
    backgroundColor: '#1a1a1a',
  },
  text: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  textActive: {
    color: 'white',
  },
});