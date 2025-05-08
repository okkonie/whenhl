import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import getFlagEmoji from '../../assets/getflag';
import teamLogos from '../../assets/logos';
const {width, height } = Dimensions.get('window')

const TeamInfoScreen = () => {
  const params = useGlobalSearchParams();
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [futGames, setFutGames] = useState([]);
  const [showRoster, setShowRoster] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [teamStats, setTeamStats] = useState([]);

  const pastDate = new Intl.DateTimeFormat('default', {  day: 'numeric', month: 'numeric' });
  const futDateFormat = new Intl.DateTimeFormat('default', { weekday: 'short', day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' });
  const futDateFormat2 = new Intl.DateTimeFormat('default', { weekday: 'short', hour: 'numeric', minute: 'numeric' });

  const fetchRoster = async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/roster/${params.abbr}/current`, { signal });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let fetchedRoster = {
        forwards: [],
        defensemen: [],
        goalies: [],
      };

      data.forwards.forEach((forward) => {
        fetchedRoster.forwards.push({
          name: forward.firstName.default + ` ` + forward.lastName.default,
          number: forward.sweaterNumber,
          pos: forward.positionCode,
          country: getFlagEmoji(forward.birthCountry)
        });
      });

      data.defensemen.forEach((defenseman) => {
        fetchedRoster.defensemen.push({
          name: defenseman.firstName.default + ` ` + defenseman.lastName.default,
          number: defenseman.sweaterNumber,
          pos: defenseman.positionCode,
          country: getFlagEmoji(defenseman.birthCountry)
        });
      });

      data.goalies.forEach((goalie) => {
        fetchedRoster.goalies.push({
          name: goalie.firstName.default + ` ` + goalie.lastName.default,
          number: goalie.sweaterNumber,
          pos: goalie.positionCode,
          country: getFlagEmoji(goalie.birthCountry)
        });
      });

      setRoster(fetchedRoster);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching roster:', error);
      }
    }

    return () => controller.abort();
  };

  const fetchSchedule = async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${params.abbr}/now`, { signal });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      let pastGames = [];
      let futGames = [];
  
      pastGames = data.games
      .filter((game) => game.gameState === 'OFF')
      .map((game) => ({
        id: game.id,
        startTime: game.startTimeUTC,
        opponent: game.homeTeam.abbrev === params.abbr ? game.awayTeam.abbrev : game.homeTeam.abbrev,
        homeTeam: game.homeTeam.abbrev,
        homeScore: game.homeTeam.score, 
        awayScore: game.awayTeam.score, 
        result: game.homeTeam.abbrev === params.abbr
          ? game.homeTeam.score > game.awayTeam.score ? 'W' : 'L'
          : game.awayTeam.score > game.homeTeam.score ? 'W' : 'L'
      }));

      futGames = data.games
      .filter((game) => game.gameState === 'FUT')
      .map((game) => ({
        startTime: game.startTimeUTC,
        opponent: game.homeTeam.abbrev === params.abbr ? game.awayTeam.abbrev : game.homeTeam.abbrev,
        homeTeam: game.homeTeam.abbrev,
      }));
  
      setPastGames(pastGames);
      setFutGames(futGames);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching schedule:', error);
      }
    }
  
    return () => controller.abort();
  };

  const fetchStats = async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/standings/now`, { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const teamStats = {};

      data.standings.forEach((team) => {
        if (team.teamAbbrev.default === params.abbr) {
          Object.assign(teamStats, {
            gamesPlayed: team.gamesPlayed,
            points: team.points,
            goals: team.goalFor,
            goalAgainst: team.goalAgainst,
            homeLosses: team.homeLosses + team.homeOtLosses,
            homeWins: team.homeWins,
            roadLosses: team.roadLosses + team.roadOtLosses,
            roadWins: team.roadWins,
            division: team.divisionName,
            rank: team.divisionSequence,
            gapg: parseFloat((team.goalAgainst / team.gamesPlayed).toFixed(2)),
            gfpg: parseFloat((team.goalFor / team.gamesPlayed).toFixed(2)),
          });
        }
      });

      setTeamStats(teamStats);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching stats:', error);
      }
    }
  
    return () => controller.abort();
  };

  useEffect(() => {
    if (params.abbr) {
      setLoading(true);
  
        Promise.all([fetchRoster(), fetchSchedule(), fetchStats()])
          .then(() => {
            setLoading(false);
          })
          .catch((error) => {
          console.error('Error fetching data:', error);
          setLoading(false);
        });
    }
  }, [params.abbr]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size='large' color='white' />
        </View>
      ) : (
        <>
        <ScrollView showsVerticalScrollIndicator={false} style={{top: height * 0.05, width: width, maxHeight: height * 0.86}} contentContainerStyle={{alignItems: 'center'}}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{params.name}</Text>
            <Image
              source={teamLogos[params.abbr] || teamLogos.DEFAULT}
              style={styles.image}
            />
          </View>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setShowSchedule(true)} 
          >
            <View style={styles.buttonContent}>
              <Text style={styles.gamesText}>Recent games</Text>
              <View style={styles.resultsContainer}>
                {(pastGames ?? []).slice(-7).map((game, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.resultBox, 
                      { backgroundColor: game.result === 'W' ? '#26ad5f' : '#b35b5b' }
                    ]}
                  >
                    <Text style={styles.resultText}>{game.result}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.gamesText}>Upcoming games</Text>
              <View style={styles.upcomingGamesContainer}>
                {(futGames ?? []).slice(0, 3).map((game, index) => (
                  <View key={index} style={styles.upcomingGame}>
                    <Image
                      source={teamLogos[game.opponent] || teamLogos.DEFAULT}
                      style={styles.image}
                    />
                    <Text style={styles.gameText}>
                      {futDateFormat2.format(new Date(game.startTime))}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.modalHint}>click for more</Text>
            </View>
          </TouchableOpacity>

          <Modal
            visible={showSchedule}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowSchedule(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowSchedule(false)}>
                  <AntDesign name='close' size={24} color='white' />
                </TouchableOpacity>
                <View style={{height: 20}}/>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {(() => {
                    const past = (pastGames ?? []).filter(game => game.result); 
                    const future = (futGames ?? []).filter(game => !game.result); 

                    const chunkedPast = [];
                    for (let i = 0; i < past.length; i += 5) {
                      chunkedPast.push(past.slice(i, i + 5));
                    }

                    return (
                      <>
                        {chunkedPast.map((group, groupIdx) => (
                          <View key={`past-${groupIdx}`} style={styles.gameRow}>
                            {group.map((item, idx) => {
                              const date = new Date(item.startTime);
                              const formattedDate = pastDate.format(date);
                              const bgColor = item.result === 'W' ? '#26ad5f' : '#b35b5b';
                              return (
                                <View key={idx} style={{alignItems: 'center', width: 52, margin: 4, backgroundColor: bgColor, borderRadius: 5}}>
                                  <Text style={[styles.gameOppText, { backgroundColor: bgColor, fontSize: 11, fontWeight: 800 }]}>
                                    {item.opponent}
                                  </Text>
                                  <Text style={styles.gameOppDate}>
                                    {formattedDate}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        ))}

                        {future.map((item, idx) => {
                          const date = new Date(item.startTime);
                          const formattedDate = futDateFormat.format(date);
                          return (
                            <View key={`fut-${idx}`} style={{marginVertical: 10, flexDirection: 'row', width: 250, alignSelf: 'center'}}>
                              <Text style={styles.gameOppText}>{item.opponent}</Text>
                              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={styles.gameDateText}>{formattedDate}</Text>
                              </View>
                            </View>
                          );
                        })}
                      </>
                    );
                  })()}
                </ScrollView>
              </View>
            </View>
          </Modal>
          
          <View style={styles.button}>
            <Text style={styles.buttonText}>Team stats</Text>
            <View style={styles.row}>
              <Text style={styles.gameText}>{teamStats?.rank}. in {teamStats?.division} division</Text>
              <Text style={styles.gameText}>{teamStats?.points}p / {teamStats?.gamesPlayed}g</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.gameText}>Total wins / losses</Text>
              <Text style={styles.gameText}>{teamStats?.roadWins + teamStats?.homeWins} / {teamStats?.roadLosses + teamStats?.homeLosses}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.gameText}>Home</Text>
              <Text style={styles.gameText}>{teamStats?.homeWins} / {teamStats?.homeLosses}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.gameText}>Road</Text>
              <Text style={styles.gameText}>{teamStats?.roadWins} / {teamStats?.roadLosses}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.gameText}>Goals for</Text>
              <Text style={styles.gameText}>{teamStats?.goals} ({teamStats?.gfpg})</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.gameText}>Goals against</Text>
              <Text style={styles.gameText}>{teamStats?.goalAgainst} ({teamStats?.gapg})</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setShowRoster(true)}>
            <Text style={styles.buttonText}>Roster</Text>
          </TouchableOpacity>

          <Modal
            visible={showRoster}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowRoster(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowRoster(false)}>
                  <AntDesign name='close' size={24} color='white' />
                </TouchableOpacity>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.rosterContainer}>
                    <Text style={styles.columnHeader}>Forwards</Text>
                    {(roster?.forwards ?? []).map((player, index) => (
                      <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center'}}>
                        <Text style={styles.playerText}>{player.country} {player.name}</Text>
                        <Text style={styles.playerText}>#{player.number}</Text>
                      </View>
                    ))}
                    <Text style={styles.columnHeader}>Defensemen</Text>
                    {(roster?.defensemen ?? []).map((player, index) => (
                      <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center'}}>
                        <Text style={styles.playerText}>{player.country} {player.name}</Text>
                        <Text style={styles.playerText}>#{player.number}</Text>
                      </View>
                    ))}
                    <Text style={styles.columnHeader}>Goalies</Text>
                    {(roster?.goalies ?? []).map((player, index) => (
                      <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center'}}>
                        <Text style={styles.playerText}>{player.country} {player.name}</Text>
                        <Text style={styles.playerText}>#{player.number}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
          </ScrollView>

          <LinearGradient
            colors={['transparent', 'black']}
            locations={[0.2, 0.85]} 
            style={styles.bottomGradient}
            pointerEvents="none" 
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 50,
    width: 50,
    contentFit: 'contain',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.75,
    marginTop: 15,
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'black',
    flex: 1,
    borderWidth: 1,
  },
  header: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#242424',
    marginTop: 20,
    marginBottom: height * 0.01,
    width: width * 0.9,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#242424',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    width: width * 0.9,
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  buttonText: {
    fontWeight: 500,
    color: 'white',
    fontSize: 16,
  },
  rosterContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  columnHeader: {
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderColor: 'white',
    alignSelf: 'center',
    width: '80%',
    fontWeight: '700',
    color: 'white',
    fontSize: 14,
    marginVertical: 7,
  },
  playerText: {
    color: 'white',
    fontSize: 12,
    marginVertical: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  resultBox: {
    width: 30,
    height: 30,
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  resultText: {
    color: 'white',
    fontWeight: 900,
  },
  upcomingGamesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gameText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 500,
  },
  scoreContainer: {
    position: 'absolute',
    left: '53%',
  },
  gameOppText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  gameOppDate: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    margin: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  gameScoreText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  gameDateText: {
    textAlign: 'right',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
  gameRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    width: 300,
  },
  gamesText: {
    fontWeight: '500',
    color: 'white',
    fontSize: 14,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: '#242424',
    maxHeight: height * 0.92,
    padding: 20,
    borderTopStartRadius: 15,
    borderTopEndRadius: 15,
    flex: 1,
    elevation: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: width * 0.05,
  },
  modalHint: {
    fontWeight: '300',
    color: 'grey', 
    textAlign: 'center', 
    width: '100%', 
    marginTop: 5, 
    fontSize: 12,
  },
});

export default TeamInfoScreen;