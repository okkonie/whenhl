import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import teamLogos from '../../assets/logos';

const { width, height } = Dimensions.get('window')

const SORTING_KEY = 'sortingCriteria'

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortingCriteria, setSortingCriteria] = useState('conference');
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
          const placeName = team.placeName.default;
          const commonName = team.teamCommonName.default;
          const division = team.divisionName;
          const gamesPlayed = team.gamesPlayed;
          const teamAbbrev = team.teamAbbrev.default || 'N/A';
          const teamName = team.teamName.default || 'Unknown Team';
          const points = typeof team.points === 'number' ? team.points : 'N/A';

          if (teamAbbrev !== 'N/A' && teamName !== 'Unknown Team' && points !== 'N/A') {
            fetchedTeams.push({
              placeName: placeName,
              commonName: commonName,
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

  const toggleFavorite = async (team) => {
    const isFavorite = favorites.some(fav => fav.abbrev === team.abbrev);
    const updatedFavorites = isFavorite
      ? favorites.filter(fav => fav.abbrev !== team.abbrev)
      : [...favorites, team];

    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

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
  
  const renderItem = ({ item, index }) => {  
    const isFavorite = favorites.some(fav => fav.abbrev === item.abbrev);
  
    const goToTeamInfo = (item) => {
      router.push({
        pathname: 'teams/teaminfo',
        params: { abbr: item.abbrev, name: item.name, points: item.points, gp: item.gp, logo: item.logo },
      });
    };
  
    return (
      <Pressable style={styles.teamItem} onPress={() => goToTeamInfo(item)}>
        <View style={styles.leftContainer}>
          <Text style={styles.teamText}>{index + 1}.</Text>  
            <Image
              source={teamLogos[item.abbrev] || teamLogos.DEFAULT}
              style={styles.image}
            />
            <View>
            <Text style={styles.teamText}>{item.placeName}</Text>
            <Text style={styles.teamText}>{item.commonName}</Text>
          </View>
        </View>
  
        <View style={styles.rightContainer}>
          <Text style={styles.teamText}>{item.points}p</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
          >
            {isFavorite ? 
              <AntDesign name="star" size={20} color={'gold'} /> : 
              <AntDesign name="staro" size={20} color={'white'} />
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

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={async () => {
                const nextSort = sortingCriteria === 'all' ? 'conference' : sortingCriteria === 'conference' ? 'division' : 'all';
                setSortingCriteria(nextSort);
                await AsyncStorage.setItem(SORTING_KEY, nextSort);
              }}
            >
              <MaterialCommunityIcons name="sort" size={28} color='white' />
            </TouchableOpacity>

            <SectionList
              sections={getGroupedData()}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              ListEmptyComponent={<Text style={styles.teamText}>No teams found</Text>}
              ListHeaderComponent={<View style={{ height: 40 }} />}
              ListFooterComponent={<View style={{ height: 80 }} />}
              showsVerticalScrollIndicator={false}
            />

            <LinearGradient
              colors={['transparent', 'black']}
              locations={[0.2, 0.85]} 
              style={styles.bottomGradient}
              pointerEvents="none" 
            />
            <LinearGradient
              colors={['black', 'transparent']}
              locations={[0, 0.5]}
              style={styles.topGradient}
              pointerEvents="none"
            />
          </>
        )}
      </View>
  
    </View>
  );
};

export default Teams;


const styles = StyleSheet.create({
  teamItem: {
    backgroundColor: '#242424',
    marginBottom: height * 0.008,
    borderRadius: 15,
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  favoriteButton: {
    padding: 20,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
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
    height: 120,
  },
  topGradient: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 100,
  },
  sortButton: {
    position: 'absolute',
    bottom: height * 0.02,
    left: width * 0.05,
    padding: 5,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  teamText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 5,
  },
  pText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  sectionHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 900,
    paddingVertical: 10
  }
});
