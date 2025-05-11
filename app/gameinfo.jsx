import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../assets/colors';
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
      <View className="flex-1 justify-end items-center bg-transparent">
        <View className="items-center h-5/6 w-full bg-neutral-800 rounded-t-2xl elevation-lg shadow-black">
          <View className='items-center justify-between flex-row w-full px-5 h-14'>
            <Text className="text-white text-lg font-extrabold">Game Details</Text>

          <TouchableOpacity onPress={() => setShowGame(false)} className='pl-5 h-full items-center justify-center'>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          </View>
          {loading ? (
            <View className='flex-1 justify-center items-center'>
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : (
            <>
              <View className="flex-row justify-between w-full border-b border-neutral-500 pb-4">
                <View className="items-center px-4 pb-1 rounded-xl w-1/3 ml-3" style={{backgroundColor: colors[selectedGame.homeAbbrev]}}>
                  <Image source={teamLogos[selectedGame.homeAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                  <Text className='text-white font-bold text-sm'>{selectedGame.homeName}</Text>
                </View>
                {selectedGame.gameState !== 'FUT' ? (
                  <View className="flex-col items-center justify-center gap-2">
                    <Text className='text-white font-extrabold text-xl'>{gameInfo.homeScore} - {gameInfo.awayScore}</Text>
                    <Text className='text-neutral-400 font-bold text-sm'>{gameInfo.prd}</Text>
                  </View>
                ) : (
                  <View className="flex-col items-center justify-center gap-2">
                    <Text className='text-white font-extrabold text-xl'>{selectedGame.localTime}</Text>
                    <Text className='text-neutral-400 font-bold text-sm'>{selectedGame.localDate}</Text>
                  </View>
                )}
                <View className="items-center px-4 pb-1 rounded-xl w-1/3 mr-3" style={{backgroundColor: colors[selectedGame.awayAbbrev]}}>
                  <Image source={teamLogos[selectedGame.awayAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                  <Text className='text-white font-medium text-sm'>{selectedGame.awayName}</Text>
                </View>
              </View>
              <View>
              {selectedGame.gameState !== 'FUT' ? (
                <View>
                  <View className="flex-row justify-between w-full py-3 px-5 border-b border-neutral-500">
                    <Text className="text-white font-extrabold text-lg">{gameInfo.homeSOG}</Text>
                    <Text className="text-white font-extrabold text-lg">SOG</Text>
                    <Text className="text-white font-extrabold text-lg">{gameInfo.awaySOG}</Text>
                  </View>
                  <ScrollView className="max-h-full p-5" showsVerticalScrollIndicator={false}>
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
                    <View className='h-96' />
                  </ScrollView>
                </View>
              ) : (
                <View>
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
                    <View>
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
                  </View>
                  )}
                  <View style={styles.row}>
                    <Text style={[styles.goalScorer, {fontSize: 12}]}>location:</Text>
                    <Text style={[styles.goalScorer, {fontSize: 12}]}>{gameInfo.venue} @ {selectedGame.place}</Text>

                  </View>
                </View>
              )}
              </View>
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
