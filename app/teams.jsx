import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, StatusBar, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons, Octicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import teamLogos from './logos';

const SORTING_KEY = 'sortingCriteria'

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortingCriteria, setSortingCriteria] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api-web.nhle.com/v1/standings/now');
        const data = await response.json();

        let fetchedTeams = [];
        data.standings.forEach((team) => {
          const conference = team.conferenceName;
          const division = team.divisionName;
          const gamesPlayed = team.gamesPlayed;
          const teamAbbrev = team.teamAbbrev.default || 'N/A';
          const teamName = team.teamName.default || 'Unknown Team';
          const points = typeof team.points === 'number' ? team.points : 'N/A';

          if (teamAbbrev !== 'N/A' && teamName !== 'Unknown Team' && points !== 'N/A') {
            fetchedTeams.push({
              name: teamName,
              points: points,
              abbrev: teamAbbrev,
              gp: gamesPlayed,
              conference: conference,
              division: division,
            });
          }
        });

        setTeams(fetchedTeams);

        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }

        const storedSorting = await AsyncStorage.getItem(SORTING_KEY);
        if (storedSorting) {
          setSortingCriteria(storedSorting);
        }

      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const getGroupedData = () => {
    if (sortingCriteria === 'conference') {
      const eastern = teams.filter(team => team.conference === 'Eastern').sort((a, b) => b.points - a.points);
      const western = teams.filter(team => team.conference === 'Western').sort((a, b) => b.points - a.points);
      return [
        { title: 'Eastern conference', data: eastern },
        { title: 'Western conference', data: western }
      ];
    } else if (sortingCriteria === 'division') {
      const divisions = ['Atlantic', 'Metropolitan', 'Central', 'Pacific'];
      return divisions.map(division => ({
        title: `${division}`,
        data: teams.filter(team => team.division === division).sort((a, b) => b.points - a.points),
      }));
    } else {
      return [{ title: 'All Teams', data: teams.sort((a, b) => b.points - a.points) }];
    }
  };

  const toggleFavorite = async (team) => {
    const isFavorite = favorites.some(fav => fav.abbrev === team.abbrev);
    const updatedFavorites = isFavorite
      ? favorites.filter(fav => fav.abbrev !== team.abbrev)
      : [...favorites, team];

    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const renderItem = ({ item, index }) => {  
    const isFavorite = favorites.some(fav => fav.abbrev === item.abbrev);
  
    const goToTeamInfo = (item) => {
      router.push({
        pathname: './teaminfo',
        params: { abbr: item.abbrev, name: item.name, points: item.points, gp: item.gp, logo: item.logo },
      });
    };
  
    return (
      <Pressable style={styles.teamItem} onPress={() => goToTeamInfo(item)}>
        <View style={styles.leftContainer}>
          {/* ✅ Make sure index is inside a <Text> component */}
          <Text style={styles.rankText}>{index + 1}.</Text>  
  
          <Image
            source={teamLogos[item.abbrev] || teamLogos.DEFAULT}
            style={styles.image}
          />
          <Text style={styles.teamText}>{item.name}</Text>
        </View>
  
        <View style={styles.rightContainer}>
          <Text style={styles.ptsText}>{item.points}p</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
          >
            {isFavorite ? 
              <Ionicons name="heart" size={26} color={'white'} /> : 
              <Ionicons name="heart-outline" size={26} color={'white'} />
            }
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <SectionList
              sections={getGroupedData()}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              ListEmptyComponent={<Text style={styles.teamText}>No teams found</Text>}
              ListHeaderComponent={<View style={{ height: 30 }} />}
              ListFooterComponent={<View style={{ height: 70 }} />}
            />
            <LinearGradient
              colors={['transparent', 'black']}
              locations={[0.2, 0.85]} 
              style={styles.bottomGradient}
              pointerEvents="none" 
            />
          </>
        )}
      </View>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={async () => {
          const nextSort = sortingCriteria === 'all' ? 'conference' : sortingCriteria === 'conference' ? 'division' : 'all';
          setSortingCriteria(nextSort);
          await AsyncStorage.setItem(SORTING_KEY, nextSort); // 💾 Save to AsyncStorage
        }}
      >
        {sortingCriteria === 'all' ? <Octicons name="sort-desc" size={24} color="white" style={{ transform: [{ scale: 0.90 }] }}/>
        : sortingCriteria === 'conference' ? <Octicons name="sort-desc" size={24} color="white" style={{ transform: [{ scale: 0.95 }] }} /> 
        : <Octicons name="sort-desc" size={24} color="white" style={{ transform: [{ scale: 1 }] }} />
        }
      </TouchableOpacity>
    </View>
  );
};

export default Teams;


const styles = StyleSheet.create({
  sectionHeader: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  image: {
    width: 40,
    height: 40,
    contentFit: 'contain',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 150,
  },
  sortButton: {
    backgroundColor: 'black',
    borderColor: 'white',
    borderWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: '5%',
    padding: '3%',
    borderRadius: '50%',
    bottom: '2%',
    zIndex: 10,
    elevation: 10, 
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: 'white',
    marginVertical: 8,
    borderRadius: 15,
  },
  leftContainer: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', 
  },
  pointsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  teamText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  rankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  ptsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  gpText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 15,
  },
});
