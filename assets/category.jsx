import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import '.././app/global.css';

const Category = ({skaterOn, skaterSort, goalieSort, setSkaterSort, setGoalieSort, modalVisible, setModalVisible}) => {

  const skaterSorts = ['points', 'goals', 'assists', '+/-', 'time on ice', 'pp goals', 'faceoff%', 'penalty mins']
  const goalieSorts = ['save%', 'goals against', 'wins', 'shutouts']

  const handleSelect = (item) => {
    skaterOn ? setSkaterSort(item) : setGoalieSort(item)
    setModalVisible(false)
  }

  return (
    <Modal visible={modalVisible} transparent={true} animationType="fade">
      <Pressable className='flex-1 justify-center items-center' style={{backgroundColor: 'rgba(0,0,0,0.7)'}} onPress={() => setModalVisible(false)}>
        <View className='bg-neutral-800 rounded-xl p-3 max-h-2/3' style={{maxHeight: '70%', width: '70%'}}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={skaterOn ? skaterSorts : goalieSorts}
            ListFooterComponent={<View className="h-4" />}
            renderItem={({ item }) => (
              <TouchableOpacity
                className='border-b border-neutral-500 px-4 py-3'
                onPress={() => handleSelect(item)} 
              >
                <Text className='text-white font-bold text-sm'>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

export default Category;