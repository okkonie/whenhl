import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import teamLogos from '../assets/logos';

const { width, height } = Dimensions.get('window');

const GameInfo = ({ showGame, setShowGame, selectedGame }) => {
  const [gameInfo, setGameInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchGame = async () => {
      if (!selectedGame) return;

      const controller = new AbortController();
      const signal = controller.signal;

      try {

        setLoading(true);
        const response = await fetch(`https://api-web.nhle.com/v1/score/${selectedGame.date}`, { signal });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let gameInfo = {};

        if (selectedGame.gameState !== 'FUT') {
          if (data.games) {
            const game = data.games.find((g) => String(g.id) === String(selectedGame.id));
            if (game) {
              gameInfo = {
                homeScore: game.homeTeam.score,
                awayScore: game.awayTeam.score,
                prd: game.periodDescriptor.periodType,
                homeSOG: game.homeTeam?.sog || 0,
                awaySOG: game.awayTeam?.sog || 0,
                goals: game.goals?.map((goal) => ({
                  goalNumber: goal.goalsToDate,
                  scorerName: goal.name?.default,
                  homeScore: goal.homeScore,
                  awayScore: goal.awayScore,
                  assists: goal.assists.map((assist) => ({
                    assistName: assist.name.default,
                    assistNumber: assist.assistsToDate,
                  })),
                })) || [],
              };
            }
          }
        }
        if (selectedGame.gameState === 'FUT') {
          if (data.games) {
            const game = data.games.find((g) => String(g.id) === String(selectedGame.id));
            if (game) {
              gameInfo = {
                homeRec: game.homeTeam.record,
                awayRec: game.awayTeam.record,
                venue: game.venue.default,
                teamLeaders: game.teamLeaders?.map(leader => ({
                  firstName: leader.firstName.default,
                  lastName: leader.lastName.default,
                  playerTeam: leader.teamAbbrev,
                  category: leader.category,
                  value: leader.value,
                })),
              };
            }
          }
        }
        setGameInfo(gameInfo); 
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setLoading(false); 
      }

      return () => controller.abort();
    };

    if (showGame && selectedGame) {
      fetchGame();
    }
  
    return () => controller.abort();
  }, [showGame, selectedGame]);
  
  return (
    <Modal animationType="slide" transparent={true} visible={showGame} onRequestClose={() => setShowGame(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setShowGame(false)} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : (
            <>
              {selectedGame.gameState !== 'FUT' ? (
                <View>
                  <View style={[styles.row, { height: height * 0.1 }]}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{selectedGame.homeAbbrev}</Text>
                      <Image source={teamLogos[selectedGame.homeAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Text style={styles.score}>{gameInfo.homeScore} - {gameInfo.awayScore}</Text>
                      <Text style={styles.period}>{gameInfo.prd}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center'}}>
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{selectedGame.awayAbbrev}</Text>
                      <Image source={teamLogos[selectedGame.awayAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                    </View>
                  </View>
                  <View style={[styles.row, { height: height * 0.04 }]}>
                    <Text style={styles.goalScorer}>{gameInfo.homeSOG}</Text>
                    <Text style={styles.goalScorer}>SOG</Text>
                    <Text style={styles.goalScorer}>{gameInfo.awaySOG}</Text>
                  </View>
                  <ScrollView style={{ maxHeight: height * 0.42 }} showsVerticalScrollIndicator={false}>
                    {gameInfo.goals?.length > 0 && (
                      gameInfo.goals.map((goal, index) => (
                        <View key={index} style={styles.goalRow}>
                          <View style={{gap: 5}}>
                          <Text style={styles.goalScorer}>{goal.scorerName} ({goal.goalNumber})</Text>
                          {goal.assists.length > 0 && (
                            <Text style={styles.goalAssists}>{goal.assists.map((assist) => assist.assistName + ' (' + assist.assistNumber + ')').join(', ')}</Text>
                          )}
                          </View>
                          <Text style={styles.goalScore}>{goal.homeScore} - {goal.awayScore}</Text>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>
              ) : (
                <View>
                  <View style={styles.row}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{selectedGame.homeAbbrev}</Text>
                      <Image source={teamLogos[selectedGame.homeAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Text style={styles.score}>{selectedGame.localTime}</Text>
                      <Text style={styles.period}>{selectedGame.localDate}</Text>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{selectedGame.awayAbbrev}</Text>
                      <Image source={teamLogos[selectedGame.awayAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.goalScorer}>{gameInfo.homeRec}</Text>
                    <Text style={styles.goalScorer}>record</Text>
                    <Text style={styles.goalScorer}>{gameInfo.awayRec}</Text>
                  </View>
                  {selectedGame.homeOdds && (
                    <View style={styles.row}>
                      <Text style={styles.goalScorer}>{selectedGame.homeOdds}</Text>
                      <Text style={styles.goalScorer}>odds</Text>
                      <Text style={styles.goalScorer}>{selectedGame.awayOdds}</Text>
                    </View>
                  )}
                  
                  {gameInfo.teamLeaders && (
                    <>
                      <Text style={[styles.goalScorer, {marginBottom: 10, textAlign:'center'}]}>team leaders</Text>
                      <View style={styles.row}>
                      <View style={{flexDirection: 'column', maxWidth: width * 0.39, overflow: 'hidden', gap: 5}}>
                        {gameInfo.teamLeaders.map((leader, index) =>
                          leader.playerTeam === selectedGame.homeAbbrev ? (
                            <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: 'grey', borderRadius: 5, padding: 5}}>
                              <View>
                                <Text style={[styles.goalScorer, {fontSize: 12}]}>{leader.firstName}</Text>
                                <Text style={[styles.goalScorer, {fontSize: 12}]}>{leader.lastName}</Text>
                              </View>
                              <View style={{alignItems: 'flex-end'}}>
                                <Text style={[styles.goalScorer, {fontSize: 18}]}>{leader.value}</Text>
                                <Text style={[styles.goalScorer, {fontSize: 10}]}>{leader.category}</Text>
                              </View>
                            </View>
                          ) : null
                        )}
                      </View>
                      <View style={{flexDirection: 'column', maxWidth: width * 0.35, overflow: 'hidden', gap: 5}}>
                        {gameInfo.teamLeaders.map((leader, index) =>
                          leader.playerTeam === selectedGame.awayAbbrev ? (
                            <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: 'grey', borderRadius: 5, padding: 5}}>
                              <View>
                                <Text style={[styles.goalScorer, {fontSize: 12}]}>{leader.firstName}</Text>
                                <Text style={[styles.goalScorer, {fontSize: 12}]}>{leader.lastName}</Text>
                              </View>
                              
                              <View style={{alignItems: 'flex-end'}}>
                                <Text style={[styles.goalScorer, {fontSize: 18}]}>{leader.value}</Text>
                                <Text style={[styles.goalScorer, {fontSize: 10}]}>{leader.category}</Text>
                              </View>
                            </View>
                          ) : null
                        )}
                      </View>
                      </View>
                    </>
                  )}
                  <View style={styles.row}>
                    <Text style={[styles.goalScorer, {fontSize: 12}]}>location:</Text>
                    <Text style={[styles.goalScorer, {fontSize: 12}]}>{gameInfo.venue} @ {selectedGame.place}</Text>

                  </View>
                </View>
            )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width * 0.16,
    height: width * 0.16,
    contentFit: 'contain',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContent: {
    alignItems: 'center',
    height: 0.7 * height,
    width: width,
    backgroundColor: '#242424',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    alignItems: 'center',
    elevation: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: width * 0.05,
    height: height * 0.1,
  },
  row: {
    width: 0.8 * width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    paddingBottom: 15,
    borderColor: '#ccc',
  },
  goalRow: {
    alignItems:'center',
    width: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  score: {
    fontWeight: 900,
    color: 'white',
    fontSize: 24,
  },
  period: {
    fontWeight: 600,
    color: '#ccc',
    fontSize: 14,
  },
  goalScorer: {
    fontWeight: 700,
    color: 'white',
    fontSize: 14,
  },
  goalAssists: {
    fontWeight: 600,
    color: '#ccc',
    fontSize: 12,
  },
  goalScore: { 
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'right',
    fontWeight: 600,
    color: 'white',
    fontSize: 14,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});

export default GameInfo;
