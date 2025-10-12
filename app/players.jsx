import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import SeasonDropdown from "../components/seasonDropDown";
import StatsDropdown from "../components/statsDropDown";

export default function Players() {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false)
  const [tempText, setTempText] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [skaterOn, setSkaterOn] = useState(true)
  const [season, setSeason] = useState({"key": "current", "label": "current"})
  const [stats, setStats] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [statsModalVisible, setStatsModalVisible] = useState(false)
  const [skaterSort, setSkaterSort] = useState('points')
  const [goalieSort, setGoalieSort] = useState('save%')

  useEffect(() => {
    const fetchStats = async () => {
      if (!season?.key) return;
      
      try {
        setLoading(true)
        const statType = skaterOn ? 'skater-stats-leaders' : 'goalie-stats-leaders';
        const response = await fetch(`https://api-web.nhle.com/v1/${statType}/${season.key}?limit=30`);
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
          <View style={s.dropdownContainer}>
            <TouchableOpacity style={[s.toggle, {justifyContent: skaterOn ? 'flex-start' : 'flex-end'}]} onPress={() => {setSkaterOn(!skaterOn)}} activeOpacity={0.7}>
              <Text style={s.toggleText}>{skaterOn ? 'skater' : 'goalie'}</Text>
            </TouchableOpacity>

            <SeasonDropdown 
              season={season}
              setSeason={setSeason}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
            />
            <StatsDropdown
              skaterOn={skaterOn}
              selected={skaterOn ? skaterSort : goalieSort}
              onSelect={(val) => skaterOn ? setSkaterSort(val) : setGoalieSort(val)}
              modalVisible={statsModalVisible}
              setModalVisible={setStatsModalVisible}
            />
          </View>
        </>

      ) : (
        <View></View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  dropdownContainer: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderColor: '#222'
  },
  toggle: {
    flexDirection: 'column',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
    width: 70,
    padding: 3
  },
  toggleText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
    padding: 5,
    borderRadius: 5,
  },
  label: {
    color: '#b0b0b0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#222'
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
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 6,
  }
})