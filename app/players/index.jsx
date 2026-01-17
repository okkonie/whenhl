import { Octicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from '../../components/colors';
import Loader from "../../components/loader";
import PlayerStats from "./playerStats";
import TeamLogo from "../../components/teamLogo";
import Flag from "../../components/flag";
import CategoryTop from "./categoryTop";

const skaterModes = ['points', 'goals', 'assists', 'plusMinus', 'toi', 'goalsPp', 'faceoffLeaders', 'penaltyMins'];
const goalieModes = ['savePctg', 'goalsAgainstAverage', 'wins', 'shutouts'];

const statLabels = {
  points: 'POINTS',
  goals: 'GOALS',
  assists: 'ASSISTS',
  plusMinus: 'PLUS MINUS',
  toi: 'TOI',
  goalsPp: 'PP GOALS',
  faceoffLeaders: 'FACEOFF%',
  penaltyMins: 'PENALTY MINS',
  savePctg: 'SAVE%',
  goalsAgainstAverage: 'GAA',
  wins: 'WINS',
  shutouts: 'SHUTOUTS',
};

export default function Players() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [skaterStats, setSkaterStats] = useState({});
  const [goalieStats, setGoalieStats] = useState({});
  const [stats, setStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerTeam, setSelectedPlayerTeam] = useState(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const searchInputRef = useRef(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [skaterResponse, goalieResponse] = await Promise.all([
        fetch(`https://api-web.nhle.com/v1/skater-stats-leaders/20252026/2?limit=5`),
        fetch(`https://api-web.nhle.com/v1/goalie-stats-leaders/20252026/2?limit=5`)
      ]);
      
      const skaterData = await skaterResponse.json();
      const goalieData = await goalieResponse.json();
      
      setSkaterStats(skaterData);
      setGoalieStats(goalieData);
    } catch (e) {
      console.error('Error fetching stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCleaner = (mode, value) => {
    if (mode === 'toi') {
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (mode === 'savePctg' || mode === 'faceoffLeaders') {
      return (value * 100).toFixed(1) + '%';
    }
    if (mode === 'goalsAgainstAverage') {
      return value.toFixed(2);
    }
    return value;
  }

  const searchPlayers = async (query) => {
    try {
      const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=30&q=${query}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (e) {
      console.error('Error searching players', e);
    }
  };

  const closeSearch = () => {
    setSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const allModes = [...skaterModes, ...goalieModes];

  const getStatsForMode = (mode) => {
    if (goalieModes.includes(mode)) {
      return goalieStats[mode] || [];
    }
    return skaterStats[mode] || [];
  };

  return (
    <SafeAreaView style={s.container}>
      
      <View style={[s.searchContainer, { top: insets.top + 10 }]}>
        
        <View style={s.search}>
          <TextInput 
            ref={searchInputRef}
            style={s.input}
            placeholder="Search..."
            placeholderTextColor={colors.text2}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchPlayers(searchQuery)}
            onFocus={() => setSearch(true)}
          />
          <TouchableOpacity onPress={() => search && closeSearch()} disabled={!search}>
            <Octicons name={search ? "x" : "search"} size={22} color={colors.text2} />
          </TouchableOpacity>
        </View>

        {search && searchResults.length > 0 && (
          <ScrollView style={s.searchResultsContainer} showsVerticalScrollIndicator={false}>
            {searchResults.map((item) => (
              <TouchableOpacity 
                key={`${item.playerId}-search`}
                style={s.searchItem}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedPlayer(item.playerId);
                  setSelectedPlayerTeam(item.teamAbbrev || item.lastTeamAbbrev);
                  setStats(true);
                  closeSearch();
                }}
              >
                <View style={s.playerInfo}>
                  <Flag country={item.birthCountry}/>
                  <Text style={s.playerName}>{item.name}</Text>
                </View>
                <TeamLogo abbrev={item.teamAbbrev || item.lastTeamAbbrev} size={24} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {loading ? <Loader /> : (
        <ScrollView 
          style={s.scrollView}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
            {allModes.map((mode) => {
              const modeStats = getStatsForMode(mode);
              if (modeStats.length === 0) return null;
              
              return (
                <View key={mode} style={s.categoryContainer}>
                  <TouchableOpacity 
                    style={s.categoryButton} 
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedCategory(mode);
                      setCategoryModal(true);
                    }}
                  >
                    <Text style={s.categoryLabel}>{statLabels[mode]}</Text>
                    <Text style={s.more}>MORE {`>`}</Text>
                  </TouchableOpacity>
                  {modeStats.map((item, index) => (
                    <TouchableOpacity 
                      key={`${item.id}-${mode}-${index}`}
                      style={s.playerItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedPlayer(item.id);
                        setSelectedPlayerTeam(item.teamAbbrev);
                        setStats(true);
                      }}
                    >
                      <View style={s.playerInfo}>
                        <Text style={s.rank}>{index+1}</Text>
                        <TeamLogo abbrev={item.teamAbbrev} size={24} />
                        <Text style={s.playerName}>
                          {`${item.firstName.default} ${item.lastName.default}`}
                        </Text>
                      </View>
                      <Text style={s.playerStat}>{statCleaner(mode, item.value)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
        </ScrollView>
      )}
      <PlayerStats 
        visible={stats} 
        playerId={selectedPlayer}
        teamAbbrev={selectedPlayerTeam}
        onClose={() => setStats(false)}
      />
      <CategoryTop
        visible={categoryModal}
        category={selectedCategory}
        onClose={() => setCategoryModal(false)}
        onPlayerPress={(playerId, teamAbbrev) => {
          setSelectedPlayer(playerId);
          setSelectedPlayerTeam(teamAbbrev);
          setCategoryModal(false);
          setStats(true);
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  searchContainer: {
    flex: 1,
    position: 'absolute',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    zIndex: 10,
    left: 15,
    right: 15,
    shadowColor: '#000',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    maxHeight: '60%'
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
  input: {
    flex: 1,
    color: colors.text
  },
  searchResultsContainer: {
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 50,
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    paddingTop: 8,
    marginTop: 4,
    paddingHorizontal: 15,
  },
  categoryLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 500,
  },
  more: {
    color: colors.text2,
    fontSize: 12,
    fontWeight: 500,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderRadius: 12,
    borderColor: colors.border,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12
  },
  rank: {
    color: colors.text2,
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
    fontWeight: '400'
  },
  playerTeam: {
    color: colors.text2,
    fontSize: 13
  },
  playerStat: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  }
});