import PlayerStats from '@/assets/playerstats';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import colors from '../assets/colors';
import teamLogos from '../assets/logos';
import './global.css';

const { width, height } = Dimensions.get('window');

const GameInfo = ({ showGame, setShowGame, selectedGame }) => {
  const [gameInfo, setGameInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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
        const periods = {};

        (data.summary?.scoring || []).forEach((period) => {
          const periodNumber = period.periodDescriptor.number;
          const periodType = period.periodDescriptor.periodType;

          if (!periods[periodNumber]) {
            periods[periodNumber] = {
              type: periodType,
              events: [],
            };
          }

          (period.goals || []).forEach((goal) => {
            const event = {
              type: 'goal',
              time: goal.timeInPeriod,
              team: goal.teamAbbrev?.default,
              goalNumber: goal.goalsToDate,
              player: goal.name?.default,
              homeScore: goal.homeScore,
              awayScore: goal.awayScore,
              assists: goal.assists.map((assist) => ({
                assistName: assist.name?.default,
                assistNumber: assist.assistsToDate,
              })),
            };

            periods[periodNumber].events.push(event);
          });
        });

        (data.summary?.penalties || []).forEach((period) => {
          const periodNumber = period.periodDescriptor.number;
          const periodType = period.periodDescriptor.periodType;

          if (!periods[periodNumber]) {
            periods[periodNumber] = {
              type: periodType,
              events: [],
            };
          }

          (period.penalties || []).forEach((penalty) => {
            const event = {
              type: 'penalty',
              time: penalty.timeInPeriod,
              duration: penalty.duration,
              player: penalty.committedByPlayer?.default,
              team: penalty.teamAbbrev?.default,
              desc: penalty.descKey,
            };

            periods[periodNumber].events.push(event);
          });
        });

        for (const period in periods) {
          periods[period].events.sort((a, b) => {
            const [minA, secA] = a.time.split(':').map(Number);
            const [minB, secB] = b.time.split(':').map(Number);
            return minA * 60 + secA - (minB * 60 + secB);
          });
        }

        gameInfo = {
          homeScore: data.homeTeam.score,
          awayScore: data.awayTeam.score,
          prd: data.periodDescriptor.periodType,
          homeSOG: data.homeTeam?.sog || 0,
          awaySOG: data.awayTeam?.sog || 0,
          allEvents: Object.entries(periods).map(([period, { type, events }]) => ({
            period: Number(period),
            type,
            periodEvents: events,
          })),
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
              homeLeaderId: category.homeLeader.playerId,
              homeValue: category.homeLeader.value,
              awayLeader: category.awayLeader.name.default,
              awayLeaderId: category.awayLeader.playerId,
              awayValue: category.awayLeader.value,
              homeHeadShot: category.homeLeader.headshot,
              awayHeadShot: category.awayLeader.headshot,
            })),
            homeGoalie: topHomeGoalie.name.default,
            homeGoalieId: topHomeGoalie.playerId,
            homeGoalieHeadShot: topHomeGoalie.headshot,
            homeGoalieSv: topHomeGoalie.savePctg,
            awayGoalie: topAwayGoalie.name.default,
            awayGoalieId: topAwayGoalie.playerId,
            awayGoalieHeadShot: topAwayGoalie.headshot,
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

  const LeaderIteam = ({team, headshot, name, value, id}) => {
    return (
      <TouchableOpacity 
        className="w-1/2 px-1 pb-2" 
        onPress={() => {
          const selected = {id: id, abbr: team};
          setShowStats(true);
          setSelectedPlayer(selected);
        }}
      >
        <View className='p-1 rounded-xl justify-between flex-row items-center bg-neutral-800 gap-3'>
          <View className='rounded-lg overflow-hidden h-14 w-14' style={{backgroundColor: colors[team]}}>
            <Image 
              style={{width: '100%', height: '100%', contentFit: 'contain'}}
              source={headshot}
            />
          </View>
          <View className='flex-1 pr-2 '>
            <Text className="text-white text-md font-medium pb-0.5 border-b border-neutral-700">{value}</Text>
            <Text className="text-white text-xs font-medium pt-1">{name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <>
    <Modal animationType="slide" transparent={true} visible={showGame} onRequestClose={() => setShowGame(false)}>
      <View className="flex-1 justify-end items-center" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
        <View className="items-center h-5/6 w-full bg-neutral-900 rounded-t-2xl elevation-lg shadow-black">
          <View className='items-center justify-between flex-row w-full px-5 h-16 border-b border-neutral-400'>
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
            <View className="flex-1 justify-center align-center gap-5">
                <ActivityIndicator size='small' color='white'/>
                <Text className="text-xs text-white font-medium text-center">Loading game</Text>
              </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row justify-between w-full border-b border-neutral-700 py-4">
                <TouchableOpacity 
                  className="items-center px-4 pb-1 rounded-xl w-1/3 ml-3" 
                  style={{backgroundColor: colors[selectedGame?.homeAbbrev]}}
                  onPress={() => {
                    setShowGame(false);
                    router.push({ pathname: 'teams/teaminfo', 
                    params: { abbr: selectedGame.homeAbbrev, name: selectedGame.homeFullName }
                  })}}
                >
                  <Image source={teamLogos[selectedGame?.homeAbbrev] || teamLogos.DEFAULT} style={{width: width * 0.16, height: width * 0.16, contentFit: 'contain'}} />
                  <Text className='text-white font-medium text-sm'>{selectedGame?.homeName}</Text>
                </TouchableOpacity>
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
                <TouchableOpacity 
                  className="items-center px-4 pb-1 rounded-xl w-1/3 mr-3" 
                  style={{backgroundColor: colors[selectedGame?.awayAbbrev]}}
                  onPress={() => {
                    setShowGame(false);
                    router.push({ pathname: 'teams/teaminfo', 
                    params: { abbr: selectedGame.awayAbbrev, name: selectedGame.awayFullName }
                  })}}
                >
                  <Image source={teamLogos[selectedGame?.awayAbbrev] || teamLogos.DEFAULT} style={{width: width * 0.16, height: width * 0.16, contentFit: 'contain'}} />
                  <Text className='text-white font-medium text-sm'>{selectedGame?.awayName}</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                {selectedGame?.gameState !== 'FUT' ? (
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between w-full py-3 px-7 border-b border-neutral-700">
                      <Text className="text-white font-extrabold text-lg">{gameInfo.homeSOG}</Text>
                      <Text className="text-white font-extrabold text-md">shots on goal</Text>
                      <Text className="text-white font-extrabold text-lg">{gameInfo.awaySOG}</Text>
                    </View>
                    <View className="flex-1 px-3 py-4">
                      {gameInfo.allEvents && (
                        gameInfo.allEvents.map((event, index) => (
                          <>
                            <View key={index + "p"} className='w-full flex-row py-1 px-3 rounded-md bg-neutral-800'>
                              <Text className='text-white font-bold text-md'>
                                {event.type === 'REG' ? 'period ' + event.period : event.type}
                              </Text>
                            </View>
                            <View className='w-full py-2 px-4'>
                              {event.periodEvents.map((periodEvent, index) => (
                                <View key={index} className={`${periodEvent.team === selectedGame.homeAbbrev ? 'flex-row' : 'flex-row-reverse'} py-2 items-center gap-3`}>
                                  <View 
                                    style={{backgroundColor: periodEvent.team === selectedGame.homeAbbrev ? colors[selectedGame.homeAbbrev] : colors[selectedGame.awayAbbrev]}}
                                    className='px-2 py-1 rounded flex-row gap-2 items-center'
                                  >
                                    <MaterialCommunityIcons name={`${periodEvent.type === 'goal' ? 'hockey-puck' : 'whistle'}`} color='white' size={13}/>
                                    <Text className='text-white font-semibold text-sm'>
                                      {periodEvent.type === 'goal' ? periodEvent.homeScore + " - " + periodEvent.awayScore
                                      : periodEvent.duration}
                                    </Text>
                                  </View>
                                  <View className={`${periodEvent.team === selectedGame.awayAbbrev ? 'items-end' : ''}`}>
                                    <Text className='text-white font-semibold text-sm'>{periodEvent.player}</Text>

                                    {(periodEvent.desc || (periodEvent.assists?.length > 0)) && (
                                      <Text className='text-neutral-400 font-semibold text-xs'>
                                        {periodEvent.type === 'goal'
                                          ? periodEvent.assists
                                              .map(assist => `${assist.assistName} (${assist.assistNumber})`)
                                              .join(', ')
                                          : periodEvent.desc.replace(/\s*-\s*/g, ' ')}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              ))}
                            </View>
                          </>
                        ))
                      )}
                    </View>
                  </View>

                ) : (

                  <View>

                    <View className="flex-row items-center justify-between w-full py-4 px-7 border-b border-neutral-700">
                      <Text className="text-white font-bold text-md">{gameInfo.homeRec}</Text>
                      <Text className="text-white font-bold text-md">record</Text>
                      <Text className="text-white font-bold text-md">{gameInfo.awayRec}</Text>
                    </View>
                  
                    {gameInfo.skaterLeaders && (
                      <View className="flex-col items-center justify-between w-full py-3 px-3 border-b border-neutral-700">
                        <Text className="text-white w-full font-bold text-md my-2 pl-2">Team leaders</Text>
                        <View className="flex-col w-full justify-between">
                          {gameInfo.skaterLeaders.map((category, index) =>
                            <View key={index} className="flex-row justify-between w-full">
                              <LeaderIteam team={selectedGame.homeAbbrev} id={category.homeLeaderId} headshot={category.homeHeadShot} name={category.homeLeader} value={category.homeValue + ' ' + category.category}/>
                              <LeaderIteam team={selectedGame.awayAbbrev} id={category.awayLeaderId} headshot={category.awayHeadShot} name={category.awayLeader} value={category.awayValue + ' ' + category.category}/>
                            </View>
                          )}
                          <View className="flex-row justify-between w-full">
                            <LeaderIteam team={selectedGame.homeAbbrev} id={gameInfo.homeGoalieId} headshot={gameInfo.homeGoalieHeadShot} name={gameInfo.homeGoalie} value={(gameInfo.homeGoalieSv * 100).toFixed(1) + ' sv%'}/>
                            <LeaderIteam team={selectedGame.awayAbbrev} id={gameInfo.awayGoalieId} headshot={gameInfo.awayGoalieHeadShot} name={gameInfo.awayGoalie} value={(gameInfo.awayGoalieSv * 100).toFixed(1) + ' sv%'}/>
                          </View>
                          
                        </View>
                      </View>
                    )}

                    {selectedGame?.homeOdds && (
                      <View className="flex-row items-center justify-between w-full py-4 px-7 border-b border-neutral-700">
                        <Text className="text-white font-bold text-md">{selectedGame.homeOdds}</Text>
                        <Text className="text-white font-bold text-sm">odds</Text>
                        <Text className="text-white font-bold text-md">{selectedGame.awayOdds}</Text>
                      </View>
                    )}

                    <View className="flex-row items-center justify-between w-full py-4 px-7 border-b border-neutral-700">
                      <Text className="text-white font-bold text-sm">location:</Text>
                      <Text className="text-white font-bold text-sm">{gameInfo.venue}</Text>
                    </View>

                  </View>
                )}
              </View>
              <View className='h-8'/>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
    {showStats && <PlayerStats showStats={showStats} setShowStats={setShowStats} playerId={selectedPlayer.id} abbr={selectedPlayer.abbr}/>}
    </>
  );
};

export default GameInfo;
