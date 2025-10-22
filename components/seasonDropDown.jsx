import React from 'react';
import {FlatList, Modal, Pressable, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const generateSeasons = () => {
  const now = new Date();
  const baseYear = now.getMonth() > 7 ? now.getFullYear() + 1 : now.getFullYear();
  const seasons = [];

  for (let y = baseYear; y >= 1918; y--) {
    const startYear = y - 1;
    const endYear = y;
    const keyBase = `${startYear}${endYear}`;

    seasons.push(
      {
        label: `${startYear}-${endYear.toString().slice(-2)} post`,
        key: `${keyBase}/3`
      },
      {
        label: `${startYear}-${endYear.toString().slice(-2)} reg`,
        key: `${keyBase}/2`
      }
    );
  }

  return seasons;
};

export default function SeasonDropdown({ season, setSeason, setModalVisible, modalVisible }) {
  const seasons = generateSeasons();

  const handleSelect = (selected) => {
    setSeason(selected);
    setModalVisible(false);
  };

  return (
    <View style={s.container}>
      <TouchableOpacity 
        style={s.btn} 
        onPress={() => setModalVisible(!modalVisible)}
        activeOpacity={0.7}
      >
        <Text style={s.buttonText}>
          {season?.label}
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
              showsVerticalScrollIndicator={false}
              data={seasons}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    s.item,
                    season?.key === item.key && s.itemActive
                  ]}
                  onPress={() => handleSelect(item)} 
                  activeOpacity={0.7}
                >
                  <Text style={[
                    s.text,
                    season?.key === item.key && s.textActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
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
    alignItems: 'center'
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
})