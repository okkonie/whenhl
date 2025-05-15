import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, SectionList, Text, TouchableOpacity, View } from 'react-native';
import teamLogos from '../../assets/logos';
import '../global.css';

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
      <Pressable className="w-full bg-neutral-800 rounded-lg py-1.5 ps-6 pe-2 mb-1.5 flex-row justify-between items-center" onPress={() => goToTeamInfo(item)}>
        <View className="flex-1 items-center flex-row justify-start gap-2">
          <Text className="text-white font-medium text-lg">{index + 1}.</Text>  
          <Image
            source={teamLogos[item.abbrev] || teamLogos.DEFAULT}
            style={{
              width: 45,
              height: 45,
              contentFit: 'contain',
            }}
          />
          <View>
            <Text className="text-white font-bold text-md">{item.placeName === 'NY Islanders' ? 'New York' : item.placeName === 'NY Rangers' ? 'New York' : item.placeName}</Text>
            <Text className="text-white font-bold text-md">{item.commonName === 'Utah Hockey Club' ? 'Hockey Club' : item.commonName}</Text>
          </View>
        </View>
  
        <View className="items-center flex-row justify-end">
          <Text className="text-white font-bold text-md">{item.points}p</Text>
          <TouchableOpacity
            className="p-4"
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
    <Text className="text-white text-lg font-bold mb-2 mt-3">{title}</Text>
  );

  return (
    <View className="flex-1 items-center justify-center bg-black px-4">
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <TouchableOpacity
              className="absolute h-[6%] aspect-square bottom-0 left-0 z-10"
              onPress={async () => {
                const nextSort = sortingCriteria === 'all' ? 'conference' : sortingCriteria === 'conference' ? 'division' : 'all';
                setSortingCriteria(nextSort);
                await AsyncStorage.setItem(SORTING_KEY, nextSort);
              }}
            > 
              <View className="items-end h-full w-full">
                <MaterialCommunityIcons name="sort" size={28} color='white' />
              </View>
            </TouchableOpacity>

            <SectionList
              sections={getGroupedData()}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              ListEmptyComponent={<Text className="text-white text-md font-bold mt-8">No teams found</Text>}
              ListHeaderComponent={<View style={{ height: height * 0.06 }} />}
              ListFooterComponent={<View style={{ height: height * 0.08 }} />}
              showsVerticalScrollIndicator={false}
            />

            <LinearGradient
              colors={['black', 'transparent']}
              locations={[0.2, 1]} 
              style={{
                position: 'absolute',
                top: -1,
                left: 0,
                right: 0,
                height: height * 0.06,
              }}
              pointerEvents="none" 
            />
            <LinearGradient
              colors={['transparent', 'black']}
              locations={[0.25, 0.85]} 
              style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                right: 0,
                height: height * 0.12,
              }}
              pointerEvents="none" 
            />
          </>
        )}
    </View>
  );
};

export default Teams;

