import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import teamLogos from '../assets/logos';
import GameInfo from './gameinfo';
import "./global.css";


const {width, height} = Dimensions.get('window')

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]); 
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null); 
  
  useFocusEffect(
    React.useCallback(() => {
      const loadFavorites = async () => {
        try {
          const storedFavorites = await AsyncStorage.getItem('favorites');
          if (storedFavorites) {
            const parsedFavorites = JSON.parse(storedFavorites);
            setFavorites(parsedFavorites);
          }
          const storedShowFavorites = await AsyncStorage.getItem('showFavorites');
          if (storedShowFavorites !== null) {
            setShowFavorites(JSON.parse(storedShowFavorites));
          }
        } catch (error) {
          console.error('Error loading from AsyncStorage:', error);
        }
      };

      loadFavorites();

      return () => {};
    }, []) 
  );

  const convertUTCToLocalTime = (utcDateString) => {
    const date = new Date(utcDateString);
    let formattedTime = new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    }).format(date);

    return formattedTime.replace(/^0/, ''); 
  };

  const convertToLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    return new Intl.DateTimeFormat('default', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  };

  const getDay = () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date.toISOString().split('T')[0];
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${getDay()}`);
      const data = await response.json();
  
      const fetchedGames = [];
  
      if (data.gameWeek) {
        Object.values(data.gameWeek).forEach(day => {
          day.games.forEach(game => {
            const homeOdd = game.homeTeam?.odds?.find(odd => odd.providerId === 3);
            const awayOdd = game.awayTeam?.odds?.find(odd => odd.providerId === 3);

            fetchedGames.push({
              date: day.date,
              id: game.id,
              gameState: game.gameState,
              place: game.homeTeam.placeName.default,
              homeOdds: homeOdd ? homeOdd.value : null,
              awayOdds: awayOdd ? awayOdd.value : null,
              homeScore: game.homeTeam?.score ?? null,
              awayScore: game.awayTeam?.score ?? null,
              period: game.periodDescriptor?.periodType ?? null,
              homeAbbrev: game.homeTeam?.abbrev ?? null,
              awayAbbrev: game.awayTeam?.abbrev ?? null,
              startTimeUTC: game.startTimeUTC,
              
              localDate: convertToLocalDate(game.startTimeUTC),
              localTime: game.gameScheduleState === 'OK' ? convertUTCToLocalTime(game.startTimeUTC) : 'TBD',
            });
          });
        });
      };

      const groupedGamesByTime = fetchedGames.reduce((acc, game) => {
        const time = game.localDate;
        if (!acc[time]) {
          acc[time] = [];
        }
        acc[time].push(game);
        return acc;
      }, {});
  
      const sections = Object.entries(groupedGamesByTime).map(([time, games]) => ({
        title: time,
        data: games,
      }));
      setGames(sections);

    } catch (e) {
      console.error('Error fetching games', e);
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    fetchGames();
  }, []);  

  const handleGamePress = (item) => {
    setSelectedGame(item);
    setShowGame(true);
  };
    
  const renderItem = ({ item, index }) => {

    const lowerOddsStyle = item.homeOdds < item.awayOdds
      ? styles.lowerOdd
      : styles.higherOdd;
  
    const higherOddsStyle = item.homeOdds > item.awayOdds
      ? styles.lowerOdd
      : styles.higherOdd;
      
    return (
      <TouchableOpacity
        key={index}
        className="bg-neutral-800 rounded-2xl mb-2 flex-row justify-between items-center self-center w-5/6 py-4 px-10"
        onPress={() => handleGamePress(item)}
      >
        <Image
          source={teamLogos[item.homeAbbrev] || teamLogos.DEFAULT}
          style={styles.image}
        />
        {item.gameState === "OFF" || item.gameState === "FINAL" ? (
          <View className="justify-center items-center">
            <Text className="text-white font-black text-xl">{item.homeScore} - {item.awayScore}</Text>
            <Text style={styles.period}>{item.period}</Text>
          </View>
        ) : item.gameState === "LIVE" ? (
          <View className="justify-between items-center flex-row w-1/3">
            <Text className="text-white font-black text-xl">{item.homeScore}</Text>
            <Text className="text-white font-extrabold text-xs rounded-md text-center px-2 py-1 bg-red-800">LIVE</Text>
            <Text className="text-white font-black text-xl">{item.awayScore}</Text>
          </View>
        ) : (
          <View className="justify-center items-center flex-col gap-2">
            <Text className="text-white font-black text-xl">{item.localTime}</Text>
            {item.homeOdds && item.awayOdds && (
              <View className="flex-row justify-center gap-1">
                <Text className="px-1 rounded-sm color-black font-extrabold text-xs" style={lowerOddsStyle}>
                  {item.homeOdds.toFixed(2)}
                </Text>
                <Text className="px-1 rounded-sm color-black font-extrabold text-xs" style={higherOddsStyle}>
                  {item.awayOdds.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}
        <Image
          source={teamLogos[item.awayAbbrev] || teamLogos.DEFAULT}
          style={styles.image}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-black flex-1">
      {loading ? (
        <View className="flex-1 justify-center align-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <>
          <GameInfo
            showGame={showGame}
            setShowGame={setShowGame}
            selectedGame={selectedGame} 
          />
          <TouchableOpacity
            className="absolute h-[6%] aspect-square bottom-0 left-0 z-10"
            onPress={async () => {const newValue = !showFavorites; setShowFavorites(newValue); await AsyncStorage.setItem('showFavorites', JSON.stringify(newValue)); }}
          > 
            <View className="items-end h-full w-full">
              <AntDesign name={showFavorites ? 'star' : 'staro'} color={showFavorites ? 'gold' : 'white'} size={28} />
            </View>
          </TouchableOpacity>

          <SectionList
            sections={games}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
                <Text className="text-white font-extrabold text-2xl w-[95%] self-center text-center py-2 m-2 bg-gradient-to-r bg-neutral-900 rounded-xl">{title}</Text>
            )}
            ListEmptyComponent={<Text className="text-white font-bold text-lg text-center">no games</Text>}
            ListHeaderComponent={<View style={{ height: height * 0.05 }} />}
            ListFooterComponent={<View style={{ height: height * 0.11 }} />}
            bounces={false}
          />
          <LinearGradient
            colors={['black', 'transparent']}
            locations={[0.2, 1]} 
            style={styles.topGradient}
            pointerEvents="none" 
          />
          <LinearGradient
            colors={['transparent', 'black']}
            locations={[0.25, 0.85]} 
            style={styles.bottomGradient}
            pointerEvents="none" 
          />
        </>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  headerContainer: {
    width: width,
    alignItems: 'center',
    padding: height * 0.02,
    borderColor: 'white',
    zIndex: 2000,
  },
  headerText: {
    fontSize: 25,
    color: 'white',
    fontWeight: 900,
  },
  sortButton: {
    position: 'absolute',
    bottom: height * 0.02,
    left: width * 0.05,
    padding: 5,
    zIndex: 10,
  },
  image: {
    width: width * 0.12,
    height: width * 0.12,
    contentFit: 'contain',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: height * 0.12,
  },
  topGradient: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: height * 0.06,
  },
  gameItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.008,
    paddingVertical: height * 0.02,
    width: width * 0.9,
    paddingHorizontal: width * 0.07,
    alignSelf: 'center',
    backgroundColor: '#242424',
    borderRadius: width * 0.03,
  },
  period: {
    color: '#C4C4C4',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  lowerOdd: {
    backgroundColor: '#ccc',
    color: 'black',
  },
  higherOdd: {
    color: '#C4C4C4',
    backgroundColor: 'transparent',
  },
});

export default Home;