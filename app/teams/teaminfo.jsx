import PlayerStats from '@/assets/playerstats';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import getFlagEmoji from '../../assets/getflag';
import teamLogos from '../../assets/logos';
import '../global.css';

const {width, height } = Dimensions.get('window')

const TeamInfoScreen = () => {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [futGames, setFutGames] = useState([]);
  const [showRoster, setShowRoster] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [teamStats, setTeamStats] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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
          id: forward.id,
          country: getFlagEmoji(forward.birthCountry)
        });
      });

      data.defensemen.forEach((defenseman) => {
        fetchedRoster.defensemen.push({
          name: defenseman.firstName.default + ` ` + defenseman.lastName.default,
          number: defenseman.sweaterNumber,
          pos: defenseman.positionCode,
          id: defenseman.id,
          country: getFlagEmoji(defenseman.birthCountry)
        });
      });

      data.goalies.forEach((goalie) => {
        fetchedRoster.goalies.push({
          name: goalie.firstName.default + ` ` + goalie.lastName.default,
          number: goalie.sweaterNumber,
          pos: goalie.positionCode,
          id: goalie.id,
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
        scheduleState: game.gameScheduleState,
        startTime: game.startTimeUTC,
        opponent: game.homeTeam.abbrev === params.abbr ? game.awayTeam.abbrev : game.homeTeam.abbrev,
        opponentName: game.homeTeam.abbrev === params.abbr ? game.awayTeam.commonName.default : game.homeTeam.commonName.default,
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
            conference: team.conferenceName,
            conferenceRank: team.conferenceSequence,
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
    <View className='flex-1 bg-black items-center'>
      <View 
        className='bg-neutral-900 rounded-b-3xl flex-row justify-evenly z-50 w-full items-end p-3'
        style={{height: height * 0.14}}
      >
        <View className='flex-row items-center'>
          <TouchableOpacity 
            className='items-center justify-center border-r border-neutral-400 my-4 px-4'
            onPress={() => router.back()}
          >
            <Entypo name="chevron-left" size={30} color="white"/>
          </TouchableOpacity>
          <View className='flex-row items-center justify-between flex-1 rounded-lg px-5 py-2'>
            <Text className='text-white text-xl font-bold'>{params.name}</Text>
            <Image
              source={teamLogos[params.abbr] || teamLogos.DEFAULT}
              style={{
                height: 50,
                width: 50,
                contentFit: 'contain'
              }}
            />
          </View>
        </View>
      </View>
      {loading ? (
        <View className="flex-1 justify-center align-center gap-5">
          <ActivityIndicator size='small' color='white'/>
          <Text className="text-xs text-white font-medium text-center">Looking for team</Text>
        </View>
      ) : (
        <>
          <ScrollView style={{flex: 1}} contentContainerClassName='items-center px-3 pt-4' bounces={false} showsVerticalScrollIndicator={false}>
              <Pressable 
                className='w-full p-4 rounded-lg mb-2 bg-neutral-900' 
                onPress={() => setShowSchedule(true)} 
              >
                <Text className='text-white font-semibold'>Recent games</Text>
                <View className='w-full flex-row justify-between py-4 border-b border-neutral-400'>
                  {(pastGames ?? []).slice(-7).map((game, index) => (
                    <View 
                      key={index}
                      className={`items-center justify-center w-[12%] py-2 rounded-md ${game.result === 'W' ? 'bg-green-600' : 'bg-red-700'}`}
                    >
                      <Text className='text-white font-extrabold text-xs'>{game.opponent}</Text>
                    </View>
                  ))}
                </View>

                <Text className='text-white font-semibold pt-4'>Upcoming games</Text>
                <View className='w-full flex-row justify-between pt-4 pb-2'>
                  {(futGames ?? []).slice(0, 3).map((game, index) => (
                    <View key={index} className='bg-neutral-800 w-[30%] py-1 rounded-xl items-center justify-center'>
                      <Image
                        source={teamLogos[game.opponent] || teamLogos.DEFAULT}
                        style={{
                          height: 45,
                          width: 45,
                          contentFit: 'contain',
                        }}
                      />
                      <Text className='text-white text-sm font-semibold pt-1'>
                        {game.scheduleState === 'OK' ? futDateFormat2.format(new Date(game.startTime)) : 'TBD'}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text className='text-neutral-400 font-light text-xs text-center pt-2'>tap for more</Text>
              </Pressable>

              <Modal animationType="slide" transparent={true} visible={showSchedule} onRequestClose={() => setShowSchedule(false)}>
                <View className="flex-1 justify-end items-center" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
                  <View className="items-center h-full w-full bg-neutral-900 rounded-t-2xl elevation-lg shadow-black">
                    <View className='items-center justify-between flex-row w-full px-5 h-16 border-b border-neutral-400'>
                      <Text className="text-white text-lg font-bold">Schedule</Text>
                      <TouchableOpacity onPress={() => setShowSchedule(false)} className='pl-5 h-full items-center justify-center'>
                        <Ionicons name="close" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} className='flex-1 px-4 py-4'>
                      {(() => {
                        const past = (pastGames ?? []).filter(game => game.result); 
                        const future = (futGames ?? []).filter(game => !game.result); 
                        
                        return (
                          <>
                            <View className='flex-wrap flex-row'>
                              {past.map((item, idx) => {
                                const date = new Date(item.startTime);
                                const formattedDate = pastDate.format(date);
                                return (
                                  <View key={idx} className='p-1.5 w-1/5'>
                                    <View className={'px-1 py-0.5'}>
                                      <View className={`${item.result === 'W' ? 'bg-green-600' : 'bg-red-700'} rounded-md`}>
                                        <Text className='text-white text-xs font-bold p-1 text-center'>
                                          {item.opponent}
                                        </Text>
                                      </View>
                                      <Text className='text-white text-xs text-center font-semibold py-1'>
                                        {formattedDate}
                                      </Text>
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                            {future.map((item, idx) => {
                              const date = new Date(item.startTime);
                              const formattedDate = futDateFormat.format(date);
                              return (
                                <View key={`fut-${idx}`} className='px-2 py-1'>
                                  <View className='w-full flex-row justify-between items-center bg-neutral-800 rounded-lg p-3'>
                                    <View className='flex-row gap-4 items-center'>
                                      <Image 
                                        style={{
                                          width: 30,
                                          height: 30,
                                          contentFit: 'contain',
                                        }}
                                        source={teamLogos[item.opponent]}
                                      />
                                      <Text className='text-white text-md text-center font-semibold'>{item.opponentName}</Text>
                                    </View>
                                    <Text className='text-white text-md text-center font-semibold'>{item.scheduleState === 'OK' ? formattedDate : 'TBD'}</Text>
                                  </View>
                                </View>
                              );
                            })}
                          </>
                        );
                      })()}
                      <View  className='h-8'/>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
              
              <View className='w-full bg-neutral-900 p-4 rounded-lg mb-2'>
                <Text className='text-white font-bold w-full border-b border-neutral-400 pb-2'>Team stats</Text>
                <View className='flex-row'>
                  <View className='pr-1 w-1/2 pt-4'>
                    <View className='bg-neutral-800 px-3 py-2 rounded-lg flex-row gap-2'>
                      <Text className="text-white font-black text-3xl">{teamStats?.rank}.</Text>
                      <View className='items-start justify-center'>
                        <Text className='text-white text-sm font-medium'>in {teamStats?.division}</Text>
                        <Text className='text-white text-sm font-medium'>division</Text>
                      </View>
                    </View>
                  </View>
                  <View className='pl-1 w-1/2 pt-4'>
                    <View className='bg-neutral-800 px-3 py-2 rounded-lg flex-row gap-2'>
                      <Text className="text-white font-black text-3xl">{teamStats?.conferenceRank}.</Text>
                      <View className='items-start justify-center'>
                        <Text className='text-white text-sm font-medium'>in {teamStats?.conference}</Text>
                        <Text className='text-white text-sm font-medium'>conference</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text className='text-white font-bold text-base mt-4 pb-3 pl-1'>Home</Text>
                <View className='w-full flex-row gap-1'>
                  <View 
                    style={{width: `${teamStats?.homeWins / (teamStats?.homeWins + teamStats?.homeLosses) * 100}%`}} 
                    className='border border-green-400 rounded-l-lg h-8 self-start justify-center'
                  >
                      <Text className='text-white text-sm font-bold pl-3'>{teamStats?.homeWins} wins</Text>
                  </View>
                  <View className='border-red-500 border rounded-r-lg flex-1 h-8 self-start justify-center'>
                      <Text className='text-white text-sm font-bold self-end pr-3'>{teamStats?.homeLosses} losses</Text>
                  </View>
                </View>

                <Text className='text-white font-bold text-base mt-4 pb-3 pl-1'>Road</Text>
                <View className='w-full flex-row gap-1'>
                  <View 
                    style={{width: `${teamStats?.roadWins / (teamStats?.roadWins + teamStats?.roadLosses) * 100}%`}} 
                    className='border border-green-400 rounded-l-lg h-8 self-start justify-center'
                  >
                      <Text className='text-white text-sm font-bold pl-3'>{teamStats?.roadWins} wins</Text>
                  </View>
                  <View className='border-red-500 border rounded-r-lg flex-1 h-8 self-start justify-center'>
                      <Text className='text-white text-sm font-bold self-end pr-3'>{teamStats?.roadLosses} losses</Text>
                  </View>
                </View>

                <Text className='text-white font-bold text-base mt-4 pb-3 pl-1'>Goals per game</Text>
                <View className='w-full flex-row gap-1'>
                  <View 
                    style={{width: `${teamStats?.goals / (teamStats?.goals + teamStats?.goalAgainst) * 100}%`}} 
                    className='border border-green-400 rounded-l-lg h-8 self-start justify-center'
                  >
                      <Text className='text-white text-sm font-bold pl-3'>{teamStats?.gfpg} for</Text>
                  </View>
                  <View className='border-red-500 border rounded-r-lg flex-1 h-8 self-start justify-center'>
                      <Text className='text-white text-sm font-bold self-end pr-3'>{teamStats?.gapg} against</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity className='w-full bg-neutral-900 p-4 rounded-lg mb-2 flex-row justify-between items-center' onPress={() => setShowRoster(true)}>
                <Text className='text-white text-xl font-bold'>Roster</Text>
                <MaterialCommunityIcons name="dots-grid" size={28} color="white" />
              </TouchableOpacity>

              <Modal
                visible={showRoster}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowRoster(false)}
              >
                <View className="flex-1 justify-end items-center" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
                  <View className="items-center h-full w-full bg-neutral-900 rounded-t-2xl elevation-lg shadow-black">
                    <View className='items-center justify-between flex-row w-full px-5 h-16 border-b border-neutral-400'>
                      <Text className="text-white text-lg font-bold">Roster</Text>
                      <TouchableOpacity onPress={() => setShowRoster(false)} className='pl-5 h-full items-center justify-center'>
                        <Ionicons name="close" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} className='flex-1 w-full'>
                      <View className='flex-1 w-full px-7'>
                        <Text className='text-white text-lg font-bold pb-2 pt-4 ml-2'>Forwards</Text>
                        {(roster?.forwards ?? []).map((player, index) => (
                          <TouchableOpacity 
                          key={index} 
                          className='my-1 px-3 py-2 flex-row justify-between bg-neutral-800 rounded-lg'
                          onPress={() => {
                            const selected = {id: player.id, abbr: params.abbr};
                            setShowStats(true);
                            setSelectedPlayer(selected)
                          }}>
                            <Text className='text-white text-md font-medium'>{player.country} {player.name}</Text>
                            <Text className='text-white text-md font-medium'>#{player.number}</Text>
                          </TouchableOpacity>
                        ))}
                        <Text className='text-white text-lg font-bold pb-2 pt-4 ml-2'>Defensemen</Text>
                        {(roster?.defensemen ?? []).map((player, index) => (
                          <TouchableOpacity 
                          key={index} 
                          className='my-1 px-3 py-2 flex-row justify-between bg-neutral-800 rounded-lg'
                          onPress={() => {
                            const selected = {id: player.id, abbr: params.abbr};
                            setShowStats(true);
                            setSelectedPlayer(selected)
                          }}>
                            <Text className='text-white text-md font-medium'>{player.country} {player.name}</Text>
                            <Text className='text-white text-md font-medium'>#{player.number}</Text>
                          </TouchableOpacity>
                        ))}
                        <Text className='text-white text-lg font-bold pb-2 pt-4 ml-2'>Goalies</Text>
                        {(roster?.goalies ?? []).map((player, index) => (
                          <TouchableOpacity 
                          key={index} 
                          className='my-1 px-3 py-2 flex-row justify-between bg-neutral-800 rounded-lg'
                          onPress={() => {
                            const selected = {id: player.id, abbr: params.abbr};
                            setShowStats(true);
                            setSelectedPlayer(selected)
                          }}>
                            <Text className='text-white text-md font-medium'>{player.country} {player.name}</Text>
                            <Text className='text-white text-md font-medium'>#{player.number}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View className='h-8' />
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            <View style={{height: height * 0.08}}/>
          </ScrollView>

          {showStats && <PlayerStats showStats={showStats} setShowStats={setShowStats} playerId={selectedPlayer.id} abbr={selectedPlayer.abbr}/>}

          <LinearGradient
            colors={['transparent', 'black']}
            locations={[0, 1]} 
            style={{
              position: 'absolute',
              bottom: height * 0.05,
              left: 0,
              right: 0,
              height: height * 0.03,
            }}
            pointerEvents="none" 
          />
          <LinearGradient
            colors={['black', 'transparent']}
            locations={[0, 1]} 
            style={{
              position: 'absolute',
              top: height * 0.12,
              left: 0,
              right: 0,
              height: height * 0.03,
            }}
            pointerEvents="none" 
          />
        </>
      )}
    </View>
  );
};

export default TeamInfoScreen;