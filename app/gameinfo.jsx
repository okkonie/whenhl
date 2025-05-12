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
        const response = await fetch(`https://api-web.nhle.com/v1/gamecenter/${selectedGame.id}/landing`, { signal });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let gameInfo = {};

        if (selectedGame.gameState !== 'FUT') {
          gameInfo = {
            homeScore: data.homeTeam.score,
            awayScore: data.awayTeam.score,
            prd: data.periodDescriptor.periodType,
            homeSOG: data.homeTeam?.sog || 0,
            awaySOG: data.awayTeam?.sog || 0,
            goals: data.summary?.scoring?.flatMap((period) =>
              period.goals.map((goal) => ({
                team: goal.teamAbbrev?.default,
                goalNumber: goal.goalsToDate,
                scorerName: goal.name?.default,
                team: goal.teamAbbrev?.default,
                homeScore: goal.homeScore,
                awayScore: goal.awayScore,
                period: period.periodDescriptor.number,
                time: goal.timeInPeriod,
                strength: goal.strength,
                shotType: goal.shotType,
                assists: goal.assists.map((assist) => ({
                  assistName: assist.lastName.default,
                  assistNumber: assist.assistsToDate,
                })),
                highlightClip: goal.highlightClipSharingUrl,
              }))
            ) || [],
          };
        }

        if (selectedGame.gameState === 'FUT') {
          const homeGoalies = data.matchup.goalieComparison.homeTeam.leaders.filter(
            (leader) => typeof leader.gamesPlayed === 'number'
          );

          const topHomeGoalie = homeGoalies.length
            ? homeGoalies.reduce((max, leader) =>
                leader.gamesPlayed > max.gamesPlayed ? leader : max
              )
            : null;

          const awayGoalies = data.matchup.goalieComparison.awayTeam.leaders.filter(
            (leader) => typeof leader.gamesPlayed === 'number'
          );

          const topAwayGoalie = awayGoalies.length
            ? awayGoalies.reduce((max, leader) =>
                leader.gamesPlayed > max.gamesPlayed ? leader : max
              )
            : null;

          gameInfo = {
            homeRec: data.homeTeam.record,
            awayRec: data.awayTeam.record,
            venue: data.venue.default + ' @ ' + data.venueLocation.default,
            skaterLeaders: data.matchup.skaterComparison.leaders.map((category) => ({
              category: category.category,
              homeLeader: category.homeLeader.name.default,
              homeValue: category.homeLeader.value,
              awayLeader: category.awayLeader.name.default,
              awayValue: category.awayLeader.value,
            })),
            homeGoalie: topHomeGoalie.name.default,
            homeGoalieGaa: topHomeGoalie.gaa,
            homeGoalieGp: topHomeGoalie.gamesPlayed,
            homeGoalieSv: topHomeGoalie.savePctg,
            awayGoalie: topAwayGoalie.name.default,
            awayGoalieGp: topAwayGoalie.gamesPlayed,
            awayGoalieGaa: topAwayGoalie.gaa,
            awayGoalieSv: topAwayGoalie.savePctg,
          };
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
          <View className='items-center justify-between flex-row w-full px-5 h-16'>
            <Text className="text-white text-lg font-bold">
              {selectedGame?.gameNumber && selectedGame?.seriesLeader && selectedGame?.seriesScore 
              ? `Game ${selectedGame.gameNumber} (${selectedGame.seriesLeader} ${selectedGame.seriesScore})` 
              : 'Game Details'}
            </Text>
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
              <View className="flex-row justify-between w-full border-b border-neutral-500 pb-4 mt-2">
                <View className="items-center px-4 pb-1 rounded-xl w-1/3 ml-3" style={{backgroundColor: colors[selectedGame?.homeAbbrev]}}>
                  <Image source={teamLogos[selectedGame?.homeAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                  <Text className='text-white font-bold text-sm'>{selectedGame?.homeName}</Text>
                </View>
                {selectedGame?.gameState !== 'FUT' ? (
                  <View className="flex-col items-center justify-center gap-2">
                    <Text className='text-white font-extrabold text-2xl'>{gameInfo.homeScore} - {gameInfo.awayScore}</Text>
                    <Text className='text-neutral-400 font-bold text-sm'>{gameInfo.prd}</Text>
                  </View>
                ) : (
                  <View className="flex-col items-center justify-center gap-2">
                    <Text className='text-white font-extrabold text-2xl'>{selectedGame?.localTime}</Text>
                    <Text className='text-neutral-400 font-bold text-sm'>{selectedGame?.localDate}</Text>
                  </View>
                )}
                <View className="items-center px-4 pb-1 rounded-xl w-1/3 mr-3" style={{backgroundColor: colors[selectedGame?.awayAbbrev]}}>
                  <Image source={teamLogos[selectedGame?.awayAbbrev] || teamLogos.DEFAULT} style={styles.image} />
                  <Text className='text-white font-medium text-sm'>{selectedGame?.awayName}</Text>
                </View>
              </View>

              <View className="flex-1">

                {selectedGame?.gameState !== 'FUT' ? (
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between w-full py-3 px-7 border-b border-neutral-500">
                      <Text className="text-white font-extrabold text-lg">{gameInfo.homeSOG}</Text>
                      <Text className="text-white font-extrabold text-md">SOG</Text>
                      <Text className="text-white font-extrabold text-lg">{gameInfo.awaySOG}</Text>
                    </View>
                    <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
                      {gameInfo.goals?.length > 0 && (
                        gameInfo.goals.map((goal, index) => {
                          const isHomeGoal = goal.team === selectedGame.homeAbbrev;

                          return isHomeGoal ? (
                            <View key={index} className="flex-row w-full items-center mb-2 rounded-xl px-1">
                              <View className="px-3.5 py-1.5 rounded-lg items-center justify-center" style={{backgroundColor: colors[selectedGame.homeAbbrev]}}>
                                <Text className="text-white font-bold text-lg">{goal.homeScore}</Text>
                              </View>
                              <View className='px-4'>
                                <Text className="text-white font-bold text-md">
                                  {goal.scorerName}
                                </Text>
                                {goal.assists.length > 0 && (
                                  <Text className="text-neutral-400 font-medium text-sm">
                                    {goal.assists
                                      .map((assist) => `${assist.assistName}`)
                                      .join(', ')}
                                  </Text>
                                )}
                              </View>
                            </View>
                          ) : (
                            <View key={index} className="flex-row w-full items-center self-end justify-end mb-2 rounded-xl px-1">
                              <View className='px-4 items-end'>
                                <Text className="text-white font-bold text-md">
                                  {goal.scorerName}
                                </Text>
                                {goal.assists.length > 0 && (
                                  <Text className="text-neutral-400 font-medium text-sm">
                                    {goal.assists
                                      .map((assist) => `${assist.assistName}`)
                                      .join(', ')}
                                  </Text>
                                )}
                              </View>
                              <View className="px-3.5 py-1.5 rounded-lg items-center justify-center" style={{backgroundColor: colors[selectedGame.awayAbbrev]}}>
                                <Text className="text-white font-bold text-lg">{goal.awayScore}</Text>
                              </View>
                            </View>
                          );
                        })
                      )}
                    </ScrollView>
                    <View className='h-4'/>
                  </View>
                ) : (
                  <View>
                    <View className="flex-row items-center justify-between w-full py-3 px-7 border-b border-neutral-500">
                      <Text className="text-white font-extrabold text-lg">{gameInfo.homeRec}</Text>
                      <Text className="text-white font-extrabold text-md">record</Text>
                      <Text className="text-white font-extrabold text-lg">{gameInfo.awayRec}</Text>
                    </View>
                    {selectedGame?.homeOdds && (
                      <View className="flex-row items-center justify-between w-full py-3 px-7 border-b border-neutral-500">
                        <Text className="text-white font-extrabold text-lg">{selectedGame.homeOdds}</Text>
                        <Text className="text-white font-extrabold text-md">odds</Text>
                        <Text className="text-white font-extrabold text-lg">{selectedGame.awayOdds}</Text>
                      </View>
                    )}
                  
                    {gameInfo.skaterLeaders && (
                        
                        <View className="flex-col items-center justify-between w-full py-3 px-5 border-b border-neutral-500">
                          <Text className="text-white w-full font-extrabold text-md my-2">Team leaders</Text>
                          <View className="flex-col w-full justify-between">
                            {gameInfo.skaterLeaders.map((category, index) =>
                              <View key={index} className="flex-row justify-between w-full gap-2">
                                <View className="w-1/2 px-3 py-1 mb-2 rounded-lg justify-between flex-row items-center" style={{backgroundColor: colors[selectedGame.homeAbbrev]}}>
                                  <Text className="text-white text-md font-bold">{category.homeLeader}</Text>
                                  <View className="items-end">
                                    <Text className="text-white text-xl font-bold">{category.homeValue}</Text>
                                    <Text className="text-white text-sm font-bold">{category.category}</Text>
                                  </View>
                                </View>
                                <View className="w-1/2 px-3 py-1 mb-2 rounded-lg justify-between flex-row items-center" style={{backgroundColor: colors[selectedGame.awayAbbrev]}}>
                                  <Text className="text-white text-md font-bold">{category.awayLeader}</Text>
                                  <View className="items-end">
                                    <Text className="text-white text-xl font-bold">{category.awayValue}</Text>
                                    <Text className="text-white text-sm font-bold">{category.category}</Text>
                                  </View>
                                </View>
                              </View>
                            )}
                            <View className='flex-row gap-2'>
                            <View className="w-1/2 px-3 py-1 mb-2 rounded-lg justify-between flex-row items-center" style={{backgroundColor: colors[selectedGame.homeAbbrev]}}>
                              <Text className="text-white text-md font-bold">{gameInfo.homeGoalie}</Text>
                              <View className="items-end">
                                <Text className="text-white text-xl font-bold">{(gameInfo.homeGoalieSv * 100).toFixed(1)}</Text>
                                <Text className="text-white text-sm font-bold">save%</Text>
                              </View>
                            </View>
                            <View className="w-1/2 px-3 py-1 mb-2 rounded-lg justify-between flex-row items-center" style={{backgroundColor: colors[selectedGame.awayAbbrev]}}>
                              <Text className="text-white text-md font-bold">{gameInfo.awayGoalie}</Text>
                              <View className="items-end">
                                <Text className="text-white text-xl font-bold">{(gameInfo.awayGoalieSv * 100).toFixed(1)}</Text>
                                <Text className="text-white text-sm font-bold">save%</Text>
                              </View>
                            </View>
                            </View>
                          </View>
                        </View>
                    )}
                    <View className="flex-row items-center justify-between w-full py-3 px-7 border-b border-neutral-500">
                      <Text className="text-white font-extrabold text-sm">location:</Text>
                      <Text className="text-white font-extrabold text-sm">{gameInfo.venue}</Text>
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
});

export default GameInfo;
