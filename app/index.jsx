import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import teamLogos from '../assets/logos';
import GameInfo from './gameinfo';


const {width, height} = Dimensions.get('window')

const Home = () => {
  const [games, setGames] = useState({});
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
  
      setGames(groupedGamesByTime); 
  
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
      <View>
        <TouchableOpacity
          key={index}
          style={styles.gameItem}
          onPress={() => handleGamePress(item)}
        >
          <Image
            source={teamLogos[item.homeAbbrev] || teamLogos.DEFAULT}
            style={styles.image}
          />
          {item.gameState === "OFF" || item.gameState === "FINAL" ? (
            <View style={styles.offGameContainer}>
              <Text style={styles.score}>{item.homeScore} - {item.awayScore}</Text>
              <Text style={styles.period}>{item.period}</Text>
            </View>
          ) : item.gameState === "LIVE" ? (
            <View style={styles.liveGameContainer}>
              <Text style={styles.liveScore}>{item.homeScore}</Text>
              <Text style={styles.liveText}>LIVE</Text>
              <Text style={styles.liveScore}>{item.awayScore}</Text>
            </View>
          ) : (
            <View style={styles.futGameContainer}>
              <Text style={styles.dateText}>{item.localTime}</Text>
              {item.homeOdds && item.awayOdds && (
                <View style={styles.oddsContainer}>
                  <Text style={[styles.oddsText, lowerOddsStyle]}>
                    {item.homeOdds}
                  </Text>
                  <Text style={[styles.oddsText, higherOddsStyle]}>
                    {item.awayOdds}
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
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <View style={{ flex: 1 }}>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
          style={styles.sortButton}
          onPress={async () => {
            const newValue = !showFavorites;
            setShowFavorites(newValue);
            await AsyncStorage.setItem('showFavorites', JSON.stringify(newValue));
          }}
        >
          <AntDesign name={showFavorites ? 'star' : 'staro'} color={showFavorites ? 'gold' : 'white'} size={28} />
        </TouchableOpacity>

        <ScrollView 
          horizontal 
          pagingEnabled 
          style={{ flex: 1 }}
          contentOffset={{ x: 2 * Dimensions.get('window').width, y: 0 }} 
          onScroll={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const index = Math.floor(contentOffsetX / Dimensions.get('window').width);
            setCurrentIndex(index);
          }}
        >
          {Object.keys(games).map((time, index) => {
            const filteredGames = showFavorites && favorites.length > 0
              ? games[time].filter(game => favorites.some(fav => fav.abbrev === game.homeAbbrev || fav.abbrev === game.awayAbbrev))
              : games[time];

            return (
              <View key={time} style={{ width: Dimensions.get('window').width }}>

                <FlatList
                  data={filteredGames}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderItem}
                  ListHeaderComponent={<View style={{ height: height * 0.13 }} />}
                  ListEmptyComponent={<Text style={styles.dateText}>no games</Text>}
                  ListFooterComponent={<View style={{ height: height * 0.11 }} />}
                  bounces={false}
                />

                <LinearGradient
                  colors={['black', 'transparent']}
                  locations={[0.4, 0.8 ]} 
                  style={styles.topGradient}
                  pointerEvents="none" 
                />

                <View style={styles.headerContainer}>
                  <Text style={styles.headerText}>{time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <LinearGradient
          colors={['transparent', 'black']}
          locations={[0.25, 0.85]} 
          style={styles.bottomGradient}
          pointerEvents="none" 
        />
        </>
      )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  headerContainer: {
    width: width,
    position: 'absolute',
    alignItems: 'center',
    marginTop: height * 0.07,
    paddingBottom: height * 0.02,
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
    height: height * 0.17,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
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
  dateText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  liveGameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '30%',
    justifyContent: 'space-between',
  },
  offGameContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  futGameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 10,
  },
  liveText: {
    color: 'white',
    backgroundColor: 'red',
    fontSize: 10,
    padding: 5,
    fontWeight: 800,
    borderRadius: 3,
    textAlign: 'center',
  },
  liveScore: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  score: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    paddingHorizontal: 6,
  },
  period: {
    color: '#C4C4C4',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderColor: '#ccc',
    borderRadius: 5,
    gap: 5,
  },
  oddsText: {
    paddingHorizontal: 3,
    borderRadius: 2,
    backgroundColor: '#ccc',
    color: 'black',
    fontSize: 9,
    fontWeight: '800',
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