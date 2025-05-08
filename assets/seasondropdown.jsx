import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { height, width } = Dimensions.get('window');

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
        label: `${startYear}-${endYear.toString().slice(-2)} playoffs`,
        key: `${keyBase}/3`
      },
      {
        label: `${startYear}-${endYear.toString().slice(-2)} regular season`,
        key: `${keyBase}/2`
      }
    );
  }

  return seasons;
};

const SeasonDropdown = ({ season, setSeason }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const seasons = generateSeasons();

  const handleSelect = (selected) => {
    setSeason(selected);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.text2}>{season.label}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={seasons}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)} 
                >
                  <Text style={styles.text}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default SeasonDropdown;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#242424',
    marginHorizontal: 3,
    height: height * 0.035,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text:  {
    fontWeight: '600',
    color: 'white',
    fontSize: 14,
  },
  text2: {
    fontWeight: '600',
    color: 'white',
    fontSize: 12,
  },
  modalContent: {
    width: width * 0.6,
    maxHeight: height * 0.7,
    backgroundColor: '#242424',
    borderRadius: 15,
    padding: 10,
  },
  item: {
    paddingVertical: 10,
    borderBottomColor: 'grey',
     borderBottomWidth: 1,
  },
});
