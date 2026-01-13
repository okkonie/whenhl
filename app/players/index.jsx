import { Octicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from '../../components/colors';
import Flag from "../../components/flag";
import Loader from "../../components/loader";
import PlayerStats from "./playerStats";

const skaterModes = ['points', 'goals', 'assists', 'plusMinus', 'toi', 'goalsPp', 'faceoffLeaders', 'penaltyMins'];
const goalieModes = ['savePctg', 'goalsAgainstAverage', 'wins', 'shutouts'];

const statLabels = {
  points: 'POINTS',
  goals: 'GOALS',
  assists: 'ASSISTS',
  plusMinus: '+/-',
  toi: 'TOI',
  goalsPp: 'PP GOALS',
  faceoffLeaders: 'FACEOFF%',
  penaltyMins: 'PENALTY MINS',
  savePctg: 'SAVE%',
  goalsAgainstAverage: 'GAA',
  wins: 'WINS',
  shutouts: 'SHOUTOUTS',
};

export default function Players() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMode, setSelectedMode] = useState('points');
  const [stats, setStats] = useState([]);

  const api = "https://api-web.nhle.com/v1/skater-stats-leaders/current?";

  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);

  const fetchStats = async (mode) => {
    setLoading(true);
    try {
      const isGoalie = goalieModes.includes(mode);
      const endpoint = isGoalie 
        ? `https://api-web.nhle.com/v1/goalie-stats-leaders/20252026/2?categories=${mode}&limit=100`
        : `https://api-web.nhle.com/v1/skater-stats-leaders/20252026/2?categories=${mode}&limit=100`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      setStats(data[mode] || []);
    } catch (e) {
      console.error('Error fetching stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedMode);
  }, [selectedMode]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        searchInputRef.current?.blur();
        closeSearch();
      };
    }, [])
  );

  const searchPlayers = (query) => {
    setSearchQuery(query);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=10&q=${query}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (e) {
        console.error('Error searching players', e);
      }
    }, 300);
  };

  const closeSearch = () => {
    setSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const allModes = [...skaterModes, ...goalieModes];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.search}>
        <TextInput 
          ref={searchInputRef}
          style={s.input}
          placeholder="Search..."
          placeholderTextColor={colors.text2}
          value={searchQuery}
          onChangeText={searchPlayers}
          onFocus={() => setSearch(true)}
        />
        <TouchableOpacity onPress={closeSearch}>
          <Octicons name={search ? "x" : "search"} size={22} color={colors.text2} />
        </TouchableOpacity>
      </View>
      {!search && (
        <FlatList 
          data={allModes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={s.modesList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[s.modeButton, selectedMode === item && s.modeButtonActive]}
              onPress={() => setSelectedMode(item)}
              activeOpacity={0.8}
            >
              <Text style={[s.modeButtonText, selectedMode === item && s.modeButtonTextActive]}>
                {statLabels[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
      {loading ? <Loader /> : (
        <FlatList 
          data={search ? searchResults : stats}
          keyExtractor={(item, index) => search ? `${item.playerId}-${index}` : `${item.id}-${selectedMode}`}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={s.playerItem}
              onPress={() => openPlayerStats(item.playerId, item.teamAbbrev)}
              activeOpacity={0.7}
            >
              <View style={s.playerInfo}>
                <Text style={s.playerName}>
                  {search ? item.name : `${item.firstName.default} ${item.lastName.default}`}
                </Text>
                <Text style={s.playerTeam}>
                  {item.teamAbbrev || item.teamAbbr}
                </Text>
              </View>
              {!search && (
                <Text style={s.playerStat}>{item.value}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  search: {
    marginTop: 20,
    marginHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
    backgroundColor: colors.card,
    borderRadius: 8
  },
  input: {
    flex: 1,
    color: colors.text
  },
  modesList: {
    paddingHorizontal: 15,
    height: 60,
    paddingTop: 15,
    gap: 8
  },
  modeButton: {
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.text
  },
  modeButtonText: {
    color: colors.text2,
    fontSize: 12,
    fontWeight: 500
  },
  modeButtonTextActive: {
    color: colors.background
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 20
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10
  },
  playerInfo: {
    flex: 1
  },
  playerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  playerTeam: {
    color: colors.text2,
    fontSize: 13
  },
  playerStat: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700'
  }
});