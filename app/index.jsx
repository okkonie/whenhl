import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, FlatList, StatusBar, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from 'expo-router'; 
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import teamLogos from './logos';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]); 
  const [showFavorites, setShowFavorites] = useState(false);
  const [gameInfo, setGameInfo] = useState([]);
  const [showGame, setShowGame] = useState(false);
  
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

    return formattedTime.replace(/^0/, ''); // Remove leading zero if present
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

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
  
        const response = await fetch(`https://api-web.nhle.com/v1/schedule/${getDay()}`);
  
        const data = await response.json();

        const allGames = new Map();
  
        if (data.gameWeek) {
          Object.values(data.gameWeek).forEach((day) => {
            const date = day.date; // Extract the date from the object
            
            day.games.forEach((game) => {
              if (!allGames.has(game.id)) {
                allGames.set(game.id, {
                  ...game,
                  date, // Assign the extracted date to the game
                  localDate: convertToLocalDate(game.startTimeUTC),
                  localTime: convertUTCToLocalTime(game.startTimeUTC),
                });
              }
            });
          });
        };
  
        const sortedGames = Array.from(allGames.values()).sort(
          (a, b) => new Date(a.startTimeUTC) - new Date(b.startTimeUTC)
        );
  
        setGames(sortedGames);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const fetchGame = async (item) => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/score/${item.date}`, { signal });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let gameInfo = {}; 

      if (item.gameState === "OFF" || item.gameState === "FINAL" || item.gameState === "LIVE") {
        if (data.games) { 
          const game = data.games.find(g => String(g.id) === String(item.id));
          if (game) {
            gameInfo = {
              state: item.gameState,
              homeAbbrev: item.homeTeam.abbrev,
              awayAbbrev: item.awayTeam.abbrev,
              homeScore: game.homeTeam.score,
              awayScore: game.awayTeam.score,
              prd: game.periodDescriptor.periodType,
              homeSOG: game.homeTeam?.sog || 0,
              awaySOG: game.awayTeam?.sog || 0,
              goals: game.goals?.map(goal => ({
                goalNumber: goal.goalsToDate,
                scorerName: goal.name?.default,
                homeScore: goal.homeScore,
                awayScore: goal.awayScore,
                assists: goal.assists.map(assist => ({
                  assistName: assist.name.default,
                  assistNumber: assist.assistsToDate,
                }))
              })) || [], 
            };
          }
        }
      }

      if (item.gameState === "FUT") {
        if (data.games) { 
          const game = data.games.find(g => String(g.id) === String(item.id));
          if (game) {
            gameInfo = {
              state: item.gameState,
              homeAbbrev: item.homeTeam.abbrev,
              place: item.homeTeam.placeName.default,
              awayAbbrev: item.awayTeam.abbrev,
              time: item.localTime,
              date: item.localDate,
              homeRec: game.homeTeam?.record || 0,
              awayRec: game.awayTeam?.record || 0,
              venue: game.venue.default,
            };
          }
        }
      }

      setGameInfo(gameInfo);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching stats:', error);
      }
    }
  
    return () => controller.abort();
  };
  
  const filteredGames = showFavorites && favorites.length > 0
    ? games
        .filter(game => {
          const homeAbbrev = game.homeTeam?.abbrev;
          const awayAbbrev = game.awayTeam?.abbrev;
          return favorites.some(fav => fav.abbrev === homeAbbrev || fav.abbrev === awayAbbrev);
        })
        .sort((a, b) => new Date(a.startTimeUTC) - new Date(b.startTimeUTC))
    : games;
  
  const renderItem = ({ item, index }) => {
    const isFirstOfDay = index === 0 || item.localDate !== filteredGames[index - 1]?.localDate;

    const homeOddsExist = item.homeTeam?.odds?.[0]?.value !== undefined && item.homeTeam?.odds?.[0]?.value > 1 && item.homeTeam?.odds?.[0]?.value < 20;
    
    if (homeOddsExist) {
      const sum = item.homeTeam?.odds?.[0]?.value + item.awayTeam?.odds?.[0]?.value
      awayOdds = ((item.homeTeam?.odds?.[0]?.value * 100) / (parseFloat(item.awayTeam?.odds?.[0]?.value) + parseFloat(item.homeTeam?.odds?.[0]?.value))).toFixed(0);
      homeOdds = 100 - awayOdds;
    }
  
    const lowerOddsStyle = homeOddsExist && homeOdds > awayOdds
      ? styles.lowerOdd
      : styles.higherOdd;
  
    const higherOddsStyle = homeOddsExist && homeOdds < awayOdds
      ? styles.lowerOdd
      : styles.higherOdd;
      
    return (
      <View>
        {isFirstOfDay && <Text style={styles.dayHeader}>{item.localDate}</Text>}
          <Pressable style={styles.gameItem} 
            onPress={async () => {
              await fetchGame(item);
              setShowGame(true);
            }}
          >
            <Image
              source={teamLogos[item.homeTeam.abbrev] || teamLogos.DEFAULT}
              style={styles.image}
            />
            {item.gameState === "OFF" || item.gameState === "FINAL" ? (
              <View style={styles.offGameContainer}>
                <Text style={styles.score}>{item.homeTeam.score} - {item.awayTeam.score}</Text>
                <Text style={styles.period}>{item.periodDescriptor.periodType}</Text>
              </View>
            ) : item.gameState === "LIVE" ? (
              <View style={styles.liveGameContainer}>
                <Text style={[styles.liveScore]}>{item.homeTeam.score}</Text>
                <Text style={styles.liveText}>LIVE</Text>
                <Text style={[styles.liveScore]}>{item.awayTeam.score}</Text>
              </View>
            ) : (
              <View style={styles.futGameContainer}>
                <Text style={styles.dateText}>{item.localTime}</Text>

                {homeOddsExist && (
                  <View style={styles.oddsContainer}>
                      <Text style={[styles.oddsText, lowerOddsStyle]}>
                        {homeOdds}%
                      </Text>
                      <Text style={[styles.oddsText, higherOddsStyle]}>
                        {awayOdds}%
                      </Text>
                  </View>
                )}
              </View>
            )}
            <Image
              source={teamLogos[item.awayTeam.abbrev] || teamLogos.DEFAULT}
              style={styles.image}
            />
          </Pressable>
      </View>
    );
  };

  const getItemLayout = (data, index) => {
    const ITEM_HEIGHT = 90; 
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={async () => {
          const newShowFavorites = !showFavorites;
          setShowFavorites(newShowFavorites);
          await AsyncStorage.setItem('showFavorites', JSON.stringify(newShowFavorites));
        }}
      >
        {showFavorites ? (
          <Ionicons name="heart-dislike" size={24} color="white" />
        ) : (
          <Ionicons name="heart" size={24} color="white" />
        )}
      </TouchableOpacity>
      
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            <FlatList
              data={filteredGames}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              getItemLayout={getItemLayout}
              ListHeaderComponent={<View style={{ height: 30 }} />}
              ListFooterComponent={<View style={{ height: 60 }} />}
            />
            <LinearGradient
              colors={['transparent', 'black']}
              locations={[0.2, 0.85]} 
              style={styles.bottomGradient}
              pointerEvents="none" 
            />
            <Modal
              animationType="slide"
              transparent={true}
              visible={showGame}
              onRequestClose={() => setShowGame(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {gameInfo.state !== "FUT" ? (
                    <>
                      <View style={styles.row}>
                        <Image
                          source={teamLogos[gameInfo.homeAbbrev] || teamLogos.DEFAULT}
                          style={styles.image}
                        />
                        <View>
                          <Text style={styles.score}>{gameInfo.homeScore} - {gameInfo.awayScore}</Text>
                          <Text style={styles.period}>{gameInfo.prd}</Text>
                        </View>
                        <Image
                          source={teamLogos[gameInfo.awayAbbrev] || teamLogos.DEFAULT}
                          style={styles.image}
                        />
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>{gameInfo.homeSOG}</Text>
                        <Text style={styles.text}>SOG</Text>
                        <Text style={styles.text}>{gameInfo.awaySOG}</Text>
                      </View>
                      <ScrollView nestedScrollEnabled={true} style={{ maxHeight: '80%', width: '90%', marginTop: 20 }}>
                        {gameInfo.goals?.length > 0 ? (
                          gameInfo.goals.map((goal, index) => (
                            <View key={index} style={styles.goalRow}>
                              <View style={{ flex: 4 }}>
                                <Text style={[styles.goalScorer, { textAlign: 'left' }]}>{goal.scorerName} ({goal.goalNumber})</Text>
                                <Text style={[styles.goalScorer, { color: 'grey', textAlign: 'left', marginBottom: 8 }]}>
                                  {goal.assists?.length > 0
                                    ? goal.assists.map(assist => `${assist.assistName} (${assist.assistNumber})`).join(' & ')
                                    : 'no assists'}
                                </Text>
                              </View>
                              <Text style={[styles.text, { textAlign: 'right', flex: 1, alignSelf: 'center' }]}>{goal.homeScore} - {goal.awayScore}</Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.text}>No goals recorded</Text>
                        )}
                      </ScrollView>
                    </>
                  ) : (
                    <>
                    <View style={styles.row}>
                      <Image
                        source={teamLogos[gameInfo.homeAbbrev] || teamLogos.DEFAULT}
                        style={styles.image}
                      />
                      <View>
                        <Text style={styles.dateText}>{gameInfo.time}</Text>
                        <Text style={styles.period}>{gameInfo.date}</Text>
                      </View>
                      <Image
                        source={teamLogos[gameInfo.awayAbbrev] || teamLogos.DEFAULT}
                        style={styles.image}
                      />
                    </View>
                    <View style={[styles.row, {paddingVertical: 20}]}>
                      <Text style={styles.text}>{gameInfo.homeRec}</Text>
                      <Text style={styles.text}>record</Text>
                      <Text style={styles.text}>{gameInfo.awayRec}</Text>
                    </View>
                    <View style={{justifyContent: 'space-between', flexDirection: 'row', marginTop: 10, width: '85%', paddingTop: 15, paddingBottom: 30}}>
                      <Text style={styles.goalScorer}>location:</Text>
                      <Text style={styles.goalScorer}>{gameInfo.venue} @ {gameInfo.place}</Text>
                    </View>
                    </>
                  )}
                  <TouchableOpacity onPress={() => setShowGame(false)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
    contentFit: 'contain',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 150,
  },
  favoriteButton: {
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
  dayHeader: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
    padding: 7,
    margin: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 15,
  },
  gameItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
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
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  futGameContainer: {
    alignItems: 'center',
    width: '50%',
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
    marginHorizontal: 0,
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
    gap: 5,
  },
  oddsText: {
    paddingHorizontal: 3,
    borderRadius: 2,
    backgroundColor: '#C4C4C4',
    color: 'black',
    fontSize: 10,
    fontWeight: '800',
  },
  lowerOdd: {
    backgroundColor: '#C4C4C4',
    color: 'black',
  },
  higherOdd: {
    color: '#C4C4C4',
    backgroundColor: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '90%',
    borderBottomColor: 'grey',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 10,
  },
  goalRow: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  goalScorer: {
    fontWeight: '500',
    textAlign: 'center',
    color: 'white',
    fontSize: 12,
  },
});

export default Home;