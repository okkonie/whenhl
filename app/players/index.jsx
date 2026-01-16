import { Octicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from '../../components/colors';
import Flag from "../../components/flag";
import Loader from "../../components/loader";
import PlayerStats from "./playerStats";
import TeamLogo from "../../components/teamLogo";

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

  const statCleaner = (value) => {
    if (selectedMode === 'toi') {
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (selectedMode === 'savePctg' || selectedMode === 'faceoffLeaders') {
      return (value * 100).toFixed(1) + '%';
    }
    if (selectedMode === 'goalsAgainstAverage') {
      return value.toFixed(2);
    }
    return value;
  }

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
        const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=10&q="${query}"`);
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
          style={s.modesListContainer}
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
        <>
          <FlatList 
            data={search ? searchResults : stats}
            keyExtractor={(item, index) => search ? `${item.playerId}-${index}` : `${item.id}-${selectedMode}`}
            contentContainerStyle={s.list}
            style={s.listStyle}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={s.playerItem}
                activeOpacity={0.7}
              >
                <View style={s.playerInfo}>
                  <Text style={s.rank}>{index+1}</Text>
                  <TeamLogo abbrev={item.teamAbbrev || item.lastTeamAbbrev} size={20} />
                  <Text style={s.playerName}>
                    {search ? item.name : `${item.firstName.default} ${item.lastName.default}`}
                  </Text>
                </View>
                {!search && (
                  <Text style={s.playerStat}>{statCleaner(item.value)}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
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
    borderRadius: 14,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: colors.text
  },
  modesList: {
    paddingBottom: 15,
    paddingHorizontal: 15,
    gap: 8,
  },
  modesListContainer: {
    flexGrow: 0
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
  listStyle: {
    flex: 1,
    marginHorizontal: 15,
  },
  list: {
    paddingBottom: 50,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8
  },
  rank: {
    color: colors.text2,
    width: 30,
    textAlign: 'right'
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  playerName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  playerTeam: {
    color: colors.text2,
    fontSize: 13
  },
  playerStat: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingRight: 20,
  }
});