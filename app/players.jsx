import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import SeasonDropdown from "../components/seasonDropDown";
import StatsDropdown from "../components/statsDropDown";
import AntDesign from '@expo/vector-icons/AntDesign';
import { SvgUri } from "react-native-svg";
import PlayerModal from "../components/playerModal";

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
  const [playerModalVisible, setPlayerModalVisible] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)

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

  useEffect(() => {
    const fetchResults = async (query) => {
      try {
        setLoading(true)
        const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=30&q="${query}"`);
        const data = await response.json();
        setResults(data)
      } catch (error) {
        console.error('Failed to fetch results:', error)
      } finally {
        setLoading(false)
      };
    };
    query !== '' && fetchResults(query);
  }, [query])

  const getWhatStats = () => {
    if (skaterOn) {
      if (skaterSort === 'points') {return stats?.points}
      if (skaterSort === 'goals') {return stats?.goals}
      if (skaterSort === 'assists') {return stats?.assists}
      if (skaterSort === '+/-') {return stats?.plusMinus}
      if (skaterSort === 'time on ice') {return stats?.toi}
      if (skaterSort === 'pp goals') {return stats?.goalsPp}
      if (skaterSort === 'faceoff%') {return stats?.faceoffLeaders}
      if (skaterSort === 'penalty mins') {return stats?.penaltyMins}
    } else {
      if (goalieSort === 'save%') {return stats?.savePctg}
      if (goalieSort === 'goals against') {return stats?.goalsAgainstAverage}
      if (goalieSort === 'wins') {return stats?.wins}
      if (goalieSort === 'shutouts') { return stats?.shutouts}
    };
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        {!searching ? (
          <>
            <Text style={s.headerText}>Top players</Text>
            <TouchableOpacity
              onPress={() => { setTempText(''); setSearching(true); }}
              style={s.button}
              activeOpacity={0.5}
            >
              <Ionicons name="search-sharp" size={24} color="white" />
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
      
      {!searching && (
        <View style={s.dropdownContainer}>
          <TouchableOpacity style={s.toggle} onPress={() => {setSkaterOn(!skaterOn)}} activeOpacity={0.7}>
            <AntDesign name="swap" size={18} color="white" />
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
      )}

      <FlatList 
        style={s.list}
        showsVerticalScrollIndicator={false}
        data={searching ? results : getWhatStats()}
        keyExtractor={(item, index) => item.playerId?.toString() || item.id?.toString() || index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={s.playerItem} 
            activeOpacity={0.8}
            onPress={() => {
              const id = searching ? item.playerId : item.id;
              setSelectedPlayerId(id);
              setPlayerModalVisible(true);
            }}
          >

            {!searching && <Text style={s.playerRank}>{index + 1}</Text>}
            {item.teamAbbrev && (
              <View style={{width: 25, height: 25}}>
                <SvgUri width={25} height={25} uri={`https://assets.nhle.com/logos/nhl/svg/${item.teamAbbrev}_dark.svg`} />
              </View>
            )}
            <Text style={s.playerName}>
              {item.name || `${item.firstName?.default || ''} ${item.lastName?.default || ''}`.trim()}
            </Text>
            {searching && item.teamAbbrev && (
              <Text style={s.playerTeam}>{item.teamAbbrev}</Text>
            )}
            {!searching && (
              <Text style={s.playerStat}>
                {(() => {
                  let displayValue = item.value;
                  
                  if (skaterSort === 'time on ice' && typeof displayValue === 'number') {
                    displayValue = displayValue / 60;
                  }
                  
                  if (typeof displayValue === 'number' && !Number.isInteger(displayValue)) {
                    return displayValue.toFixed(2);
                  }
                  
                  return displayValue;
                })()}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{height: 50}}/>}
        ListEmptyComponent={
          searching && query ? (
            <View style={s.emptyContainer}>
              <Text style={s.emptyText}>No players found</Text>
            </View>
          ) : null
        }
      />

      <PlayerModal 
        visible={playerModalVisible}
        onClose={() => setPlayerModalVisible(false)}
        playerId={selectedPlayerId}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  list: {
    flex: 1,
  },
  dropdownContainer: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#222'
  },
  toggle: {
    flexDirection: 'column',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
    width: 90,
    padding: 3,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row'
  },
  toggleText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontWeight: 700
  },
  label: {
    color: '#b0b0b0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
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
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderColor: "#181818"
  },
  playerRank: {
    color: '#b0b0b0',
    fontSize: 14,
    width: 30,
  },
  playerName: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
    paddingLeft: 15
  },
  playerTeam: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  playerStat: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  }
})