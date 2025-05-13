import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import '../app/global.css';

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

const SeasonDropdown = ({ season, setSeason, setModalVisible, modalVisible }) => {
  const seasons = generateSeasons();

  const handleSelect = (selected) => {
    setSeason(selected);
    setModalVisible(false);
  };

  return (
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <Pressable className='flex-1 justify-center items-center' style={{backgroundColor: 'rgba(0,0,0,0.7)'}} onPress={() => setModalVisible(false)}>
          <View className='bg-neutral-800 rounded-xl p-3' style={{maxHeight: '70%', width: '70%'}}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={seasons}
              ListFooterComponent={<View className='h-4' />}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className='border-b border-neutral-500 px-4 py-3'
                  onPress={() => handleSelect(item)} 
                >
                  <Text className='text-white font-bold text-sm'>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
  );
};

export default SeasonDropdown;
