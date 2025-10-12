import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import PlayerOptions from "../components/playerOptions";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Players() {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false)
  const [tempText, setTempText] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [skaterOn, setSkaterOn] = useState(true)
  const [season, setSeason] = useState('current')
  const [stats, setStats] = useState([])
  const [optionsVisible, setOptionsVisible] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const statType = skaterOn ? 'skater-stats-leaders' : 'goalie-stats-leaders';
        const response = await fetch(`https://api-web.nhle.com/v1/${statType}/${season}?limit=30`);
        const data = await response.json();
        setStats(data);

      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [season, skaterOn]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        {!searching ? (
          <>
            <Text style={s.headerText}>Top players</Text>
            <View style={s.buttons}> 
              <TouchableOpacity
                onPress={() => setOptionsVisible(true)}
                style={s.button}
                activeOpacity={0.5}
              >
                <Ionicons name="options" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setTempText(''); setSearching(true); }}
                style={s.button}
                activeOpacity={0.5}
              >
                <Ionicons name="search-sharp" size={24} color="white" />
              </TouchableOpacity>
            </View>
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
                setQuery(tempText.trim());
              }}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => { setSearching(false); setTempText(''); }}
              style={s.button}
              activeOpacity={0.5}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {!searching ? (
        <>
          <PlayerOptions visible={optionsVisible} onClose={() => setOptionsVisible(false)}/>
        </>

      ) : (
        <View></View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
  },
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
  button: {
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