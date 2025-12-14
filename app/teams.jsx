import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Header from "../components/header";
import Loader from '../components/loader';
import Team from '../components/team';

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
              <Octicons name="sort-desc" size={20} color={colors.text}/>
            </TouchableOpacity>
          </Header>
          <FlatList 
            style={s.list}
            data={groupedStandings()}
            keyExtractor={(item, index) => item.title + index}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{height: 50}}/>}
            renderItem={({ item }) => (
              <View>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>{item.title}</Text>
                </View>
                <View style={s.teamsContainer}>
                {item.data.map((team, index) => (
                  <Team 
                    key={team.teamAbbrev.default} 
                    item={team} 
                    index={index} 
                    isFavorite={favoriteTeams.includes(team.teamAbbrev.default)}
                    onToggleFavorite={() => toggleFavorite(team.teamAbbrev.default)}
                  />
                ))}
                </View>
              </View>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  teamsContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 5
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingTop: 20,
    paddingBottom: 10
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 500
  },
});