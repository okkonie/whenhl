import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import Header from "../components/header";
import Loader from '../components/loader';

export default function Teams() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState('division');
  const [favoriteTeams, setFavoriteTeams] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoriteTeams');
      if (stored) {
        setFavoriteTeams(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  };

  const toggleFavorite = async (teamAbbrev) => {
    try {
      let newFavorites;
      if (favoriteTeams.includes(teamAbbrev)) {
        newFavorites = favoriteTeams.filter(t => t !== teamAbbrev);
      } else {
        newFavorites = [...favoriteTeams, teamAbbrev];
      }
      setFavoriteTeams(newFavorites);
      await AsyncStorage.setItem('favoriteTeams', JSON.stringify(newFavorites));
    } catch (e) {
      console.error("Failed to save favorite", e);
    }
  };
  
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api-web.nhle.com/v1/standings/now");
        const data = await response.json();
        setStandings(data.standings);
      } catch (error) {
        console.error("Error fetching standings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const groupedStandings = () => {
    if (!standings || standings.length === 0) return [];

    if (groupBy === 'all') {
      return [{
        title: 'League',
        data: standings
      }];
    }

    const groups = {};
    standings.forEach(team => {
      const key = groupBy === 'division' ? team.divisionName : team.conferenceName;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(team);
    });

    return Object.keys(groups).map(key => ({
      title: key,
      data: groups[key]
    }));
  };

  const toggleGrouping = () => {
    setGroupBy(prev => {
      if (prev === 'division') return 'conference';
      if (prev === 'conference') return 'all';
      return 'division';
    });
  };

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'STANDINGS'}>
            <TouchableOpacity onPress={toggleGrouping} activeOpacity={0.7} style={s.btn}>
              <Octicons name="sort-desc" size={20} color="white"/>
            </TouchableOpacity>
          </Header>
          <SectionList 
            style={s.list}
            sections={groupedStandings()}
            keyExtractor={(item, index) => item?.teamName?.default || index.toString()}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{height: 50}}/>}
            renderSectionHeader={({ section: { title } }) => (
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{title}</Text>
              </View>
            )}
            renderItem={({ item, index }) => 
              <View style={s.teamRow}>
                <View style={s.teamLeft}>
                  <View style={s.rank}>
                    <Text style={s.rankText}>{index + 1}</Text>
                  </View>
                  <View style={s.team}>
                    <View style={s.svgPlace}>
                      <SvgUri 
                        width={40} 
                        height={30} 
                        uri={`https://assets.nhle.com/logos/nhl/svg/${item.teamAbbrev.default}_dark.svg`} 
                      />
                    </View>
                    <View>
                      <Text style={s.teamName}>{item.placeName.default.startsWith('NY') ? 'New York' : item.placeName.default}</Text>
                      <Text style={s.teamName}>{item.teamCommonName.default}</Text>
                    </View>
                  </View>
                </View>
                <View style={s.teamRight}>
                  <Text style={s.teamPoints}>{item.points}</Text>
                  <TouchableOpacity style={s.favBtn} onPress={() => toggleFavorite(item.teamAbbrev.default)}>
                    <Octicons 
                      name={favoriteTeams.includes(item.teamAbbrev.default) ? "star-fill" : "star"} 
                      color={favoriteTeams.includes(item.teamAbbrev.default) ? "#FFD700" : "#aaa"} 
                      size={16} 
                      activeOpacity={0.8} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgPlace: {
    width: 40,
    height: 30
  },
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 500
  },
  teamRow: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginVertical: 3,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#171717',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  rank: {
    width: 18,
  },
  rankText: {
    color: "#aaa",
    textAlign: 'right',
  },
  teamName: {
    color: 'white',
    fontSize: 13,
  },
  teamPoints: {
    color: 'white',
    fontSize: 14,
    fontWeight: 600
  },
  score: {
    color: "#aaa",
    fontSize: 11,
    paddingTop: 2,
  },
  favBtn: {
    padding: 8,
    borderRadius: 5,
  }
});