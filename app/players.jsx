import { Octicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import CustomModal from "../components/customModal";
import Flag from "../components/flag";
import Header from "../components/header";
import Loader from "../components/loader";
import Player from "../components/player";
import PlayerStats from "../components/playerStats";

const skaterModes = ['points', 'goals', 'assists', 'plusMinus', 'toi', 'goalsPp', 'faceoffLeaders', 'penaltyMins'];
const goalieModes = ['savePctg', 'goalsAgainstAverage', 'wins', 'shutouts'];

const statLabels = {
  points: 'Points',
  goals: 'Goals',
  assists: 'Assists',
  plusMinus: 'Plus minus',
  toi: 'Time on ice',
  goalsPp: 'PP goals',
  faceoffLeaders: 'Faceoff %',
  penaltyMins: 'Penalty minutes',
  savePctg: 'Save %',
  goalsAgainstAverage: 'Goals against avg',
  wins: 'Wins',
  shutouts: 'Shutouts',
};

export default function Players() {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [skaterStats, setSkaterStats] = useState({});
  const [goalieStats, setGoalieStats] = useState({});
  const [search, setSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playerStatsVisible, setPlayerStatsVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedTeamAbbrev, setSelectedTeamAbbrev] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [skaterRes, goalieRes] = await Promise.all([
        fetch('https://api-web.nhle.com/v1/skater-stats-leaders/current?limit=100'),
        fetch('https://api-web.nhle.com/v1/goalie-stats-leaders/current?limit=100')
      ]);
      const skaterData = await skaterRes.json();
      const goalieData = await goalieRes.json();
      setSkaterStats(skaterData);
      setGoalieStats(goalieData);
    } catch (e) {
      console.error('Error fetching stats', e);
    } finally {
      setLoading(false);
    }
  };

  const getPlayers = (mode) => {
    if (skaterModes.includes(mode)) {
      return skaterStats[mode] || [];
    }
    return goalieStats[mode] || [];
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setModalVisible(true);
  };

  const searchTimeout = useRef(null);

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
        const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=100&q=${encodeURIComponent(query)}`);
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

  const openPlayerStats = (playerId, teamAbbrev) => {
    setSelectedPlayerId(playerId);
    setSelectedTeamAbbrev(teamAbbrev);
    setPlayerStatsVisible(true);
  };

  const closePlayerStats = () => {
    setPlayerStatsVisible(false);
    setSelectedPlayerId(null);
    setSelectedTeamAbbrev(null);
  };

  const allModes = [...skaterModes, ...goalieModes];

  const renderSection = useCallback(({ item: mode }) => (
    <View>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{statLabels[mode]}</Text>
        <TouchableOpacity onPress={() => openModal(mode)} activeOpacity={0.7} style={s.moreBtn}>
          <Text style={s.moreBtnText}>See more</Text>
          <Octicons name="chevron-right" size={15} color={colors.text2} style={{paddingTop: 2}}/>
        </TouchableOpacity>
      </View>
      <View style={s.playersContainer}>
        {getPlayers(mode).slice(0, 5).map((player, index) => (
          <Player 
            key={player.player?.id || index} 
            player={player} 
            rank={index + 1} 
            mode={mode} 
            isLast={index === 4}
            onPress={() => openPlayerStats(player.id, player.teamAbbrev)}
          />
        ))}
      </View>
    </View>
  ), [skaterStats, goalieStats]);

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          {search ? (
            <View style={s.searchContainer}>
              <View style={s.searchInputContainer}>
                <TextInput
                  style={s.searchInput}
                  placeholder="Search players..."
                  placeholderTextColor={colors.text2}
                  value={searchQuery}
                  onChangeText={searchPlayers}
                  autoFocus
                />
                <TouchableOpacity onPress={closeSearch} style={s.closeSearchBtn}>
                  <Octicons name="x" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                style={s.list}
                data={searchResults}
                keyExtractor={(item) => item.playerId.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={s.searchResultItem} 
                    onPress={() => openPlayerStats(item.playerId, item.lastTeamAbbrev)}
                    activeOpacity={0.7}
                  >
                    <View style={s.searchResultNameContainer}>
                      <Flag country={item.birthCountry} />
                      <Text style={s.searchResultName}>{item.name}</Text>
                    </View>
                    <Text style={s.searchResultTeam}>{item.lastTeamAbbrev}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={searchQuery.length >= 2 && <Text style={s.emptyText}>No players found</Text>}
                ListFooterComponent={<View style={{height: 50}}/>}
              />
            </View>
          ): (
            <>
              <Header text={'Players'}> 
                <TouchableOpacity style={s.btn} activeOpacity={0.8} onPress={() => setSearch(true)}>
                  <Octicons name="search" color={colors.text} size={20}/>
                </TouchableOpacity>
              </Header>
              <FlatList
                style={s.list}
                data={allModes}
                keyExtractor={(item) => item}
                renderItem={renderSection}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View style={{ height: 55 }} />}
              />
            </>
          )}

          <CustomModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={modalMode ? statLabels[modalMode] : ''}
            loading={false}
          >
            {(modalMode ? getPlayers(modalMode) : []).map((item, index) => (
              <Player
                key={item.player?.id?.toString() || index.toString()}
                player={item}
                rank={index + 1}
                mode={modalMode}
                onPress={() => openPlayerStats(item?.id, item?.teamAbbrev)}
              />
            ))}
          </CustomModal>

          <PlayerStats 
            visible={playerStatsVisible} 
            playerId={selectedPlayerId}
            teamAbbrev={selectedTeamAbbrev}
            onClose={closePlayerStats} 
          />
        </> 
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colors.background,
  },
  btn:{
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1
  },
  modalList: {
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreBtnText: {
    color: colors.text2,
    fontSize: 14,
  },
  playersContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginHorizontal: 10,
    paddingHorizontal: 15,
  },
  modalContainer: {
    position: 'absolute',
    width: '100%',
    height: '94%',
    bottom: 0,
    backgroundColor: colors.card,
    borderRadius: 15
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 800,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 20,
    height: 50,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 16,
  },
  closeSearchBtn: {
    padding: 5,
  },  
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginTop: 3,
    backgroundColor: colors.card,
    borderRadius: 5,
  },
  searchResultNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  searchResultName: {
    color: colors.text,
    fontSize: 14,
    flexShrink: 1,
  },
  searchResultTeam: {
    color: colors.text2,
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    color: colors.text2,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});