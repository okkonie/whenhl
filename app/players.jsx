import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Entypo from "@expo/vector-icons/Entypo";

export default function Players() {
  const [searching, setSearching] = useState(false)
  const [tempText, setTempText] = useState('')
  const [query, setQuery] = useState('')

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        {!searching ? (
          <>
            <Text style={s.headerText}>Players</Text>
            <TouchableOpacity
              onPress={() => { setTempText(''); setSearching(true); }}
              style={s.searchButton}
            >
              <Entypo name="magnifying-glass" size={24} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={s.searchInput}
              placeholder="Search players..."
              placeholderTextColor="#888"
              value={tempText}
              onChangeText={setTempText}
              returnKeyType="search"
              onSubmitEditing={() => {
                // commit the search query but keep the search input open
                setQuery(tempText.trim());
              }}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => { setSearching(false); setTempText(''); }}
              style={s.searchButton}
            >
              <Entypo name="cross" size={24} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#111",
    flex:1,
  },
  header: {
    height: 60,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#222'
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 700,
  },
  searchButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  }
  ,
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 6,
  }
})