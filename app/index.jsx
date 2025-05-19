import Playoffs from '@/assets/playoffs';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native';
import colors from '../assets/colors';
import teamLogos from '../assets/logos';
import GameInfo from './gameinfo';
import './global.css';

const {width, height} = Dimensions.get('window')

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]); 
  const [showFavorites, setShowFavorites] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null); 
  const [playoffsOn, setPlayoffsOn] = useState(false);
  const [startDates, setStartDates] = useState({});
  const [playOffsVisible, setPlayoffsVisible] = useState(false);
  
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
    const localDate = new Date(utcDateString);
    const now = new Date();

    const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const target = normalize(localDate);
    const today = normalize(now);

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((target - today) / oneDay);

    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';

    const formattedDate = new Intl.DateTimeFormat('default', {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    }).format(localDate);

    return formattedDate;
  };

  const fetchGames = async (dateString) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${dateString}`);
      const data = await response.json();

      const current = dateString ? dateString : null
      const nextStart = data.nextStartDate ? data.nextStartDate : null;
      const previousStart = data.previousStartDate ? data.previousStartDate : null; 

      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      const playoffsOn =
        data.regularSeasonEndDate < formattedToday &&
        formattedToday < data.playoffEndDate;

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
              homeName: game.homeTeam?.commonName?.default ?? null,
              awayName: game.awayTeam?.commonName?.default ?? null,
              awayAbbrev: game.awayTeam?.abbrev ?? null,
              gameNumber: game.seriesStatus?.gameNumberOfSeries,
              seriesLeader:
                game.seriesStatus?.topSeedWins > game.seriesStatus?.bottomSeedWins
                  ? `${game.seriesStatus?.topSeedTeamAbbrev}`
                  : game.seriesStatus?.topSeedWins < game.seriesStatus?.bottomSeedWins
                  ? `${game.seriesStatus?.bottomSeedTeamAbbrev}`
                  : 'Tied',
              seriesScore:
                game.seriesStatus?.topSeedWins > game.seriesStatus?.bottomSeedWins
                  ? `${game.seriesStatus?.topSeedWins}-${game.seriesStatus?.bottomSeedWins}`
                  : `${game.seriesStatus?.bottomSeedWins}-${game.seriesStatus?.topSeedWins}`,
              startTimeUTC: game.startTimeUTC,
              localDate: convertToLocalDate(game.startTimeUTC),
              localTime:
                game.gameScheduleState === 'OK'
                  ? convertUTCToLocalTime(game.startTimeUTC)
                  : 'TBD',
            });
          });
        });
      }

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

      setPlayoffsOn(playoffsOn);
      setGames(sections);
      setStartDates({ next: nextStart, previous: previousStart, head: convertToLocalDate(current) + ' - ' + convertToLocalDate(nextStart) });
    } catch (e) {
      console.error('Error fetching games', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);
    const formattedTwoDaysAgo = twoDaysAgo.toISOString().split('T')[0];
    fetchGames(formattedTwoDaysAgo);
  }, []);


  const handleGamePress = (item) => {
    setSelectedGame(item);
    setShowGame(true);
  };

  const visibleGames = games.map(section => {
    const favoriteAbbrevs = favorites.map(team => team.abbrev);

    const filteredData = showFavorites
      ? section.data.filter(
          item =>
            favoriteAbbrevs.includes(item.homeAbbrev) ||
            favoriteAbbrevs.includes(item.awayAbbrev)
        )
      : section.data;

    return {
      ...section,
      data: filteredData,
    };
  }).filter(section => section.data.length > 0);
  
  return (
    <View className="bg-black flex-1">
      <View className='bg-neutral-900 rounded-b-3xl flex-row justify-evenly z-50 pb-3 w-full h-32 items-end top-0'>
        <TouchableOpacity 
          onPress={async () => {const newValue = !showFavorites; setShowFavorites(newValue); await AsyncStorage.setItem('showFavorites', JSON.stringify(newValue))}}
          className='items-center gap-2 w-1/5'
        > 
          <AntDesign name={showFavorites ? 'star' : 'staro'} color={showFavorites ? 'gold' : 'white'} size={height * 0.026} />
          <Text className='text-xs text-white font-extrabold'>favorites</Text>
        </TouchableOpacity>

        {playoffsOn && 
          <TouchableOpacity onPress={() => setPlayoffsVisible(true)} className='items-center gap-2  w-1/5'> 
            <AntDesign name='Trophy' color='white'  size={height * 0.026} />
            <Text className='text-xs text-white font-extrabold'>playoffs</Text>
          </TouchableOpacity>}
        
        <TouchableOpacity onPress={() => startDates.previous && fetchGames(startDates.previous)} className='items-center gap-2  w-1/5 '> 
          <AntDesign name='arrowleft' color={startDates.previous ? 'white' : 'grey'}  size={height * 0.026} />
          <Text className='text-xs text-white font-extrabold'>previous</Text>
        </TouchableOpacity>
          
        <TouchableOpacity onPress={() => startDates.next && fetchGames(startDates.next)} className='items-center gap-2  w-1/5'> 
          <AntDesign name='arrowright' color={startDates.next ? 'white' : 'grey'}  size={height * 0.026} />
          <Text className='text-xs text-white font-extrabold'>next</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center align-center gap-5">
          <ActivityIndicator size='small' color='white'/>
          <Text className="text-xs text-white font-medium text-center">Loading games</Text>
        </View>
      ) : (
        <>
          <GameInfo
            showGame={showGame}
            setShowGame={setShowGame}
            selectedGame={selectedGame} 
          />

          {playoffsOn && <Playoffs show={playOffsVisible} setShow={setPlayoffsVisible}/>}

          {showFavorites && favorites.length === 0 ? (
            <View className="flex-1 p-5 justify-center">
              <Text className="text-white font-medium text-md">Add favorites to sort only those games here!</Text>
              <TouchableOpacity onPress={() => router.navigate('/teams')}><Text className="text-blue-500 pt-3 font-medium text-xl underline">Teams</Text></TouchableOpacity>
            </View>
          ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={visibleGames}
            keyExtractor={(item) => item.title}
            renderItem={({ item: section }) => {
              const favoriteAbbrevs = favorites.map(team => team.abbrev);

              const filteredGames = showFavorites
                ? section.data.filter(
                    item =>
                      favoriteAbbrevs.includes(item.homeAbbrev) ||
                      favoriteAbbrevs.includes(item.awayAbbrev)
                  )
                : section.data;

              if (filteredGames.length === 0) {return} else {
                return (
                  <View className="w-full self-center border-neutral-500">
                    <Text className="text-white font-bold text-xl pl-6 pt-4 border-t border-neutral-800">{section.title}</Text>
                    <View className="flex-wrap flex-row px-4 pt-2 pb-4">
                      {filteredGames.map((item) => {
                        return (
                          <TouchableOpacity
                            key={item.id}
                            className= "justify-between items-center w-1/2 p-1"
                            onPress={() => handleGamePress(item)}
                          >
                            <View className={`flex-row justify-evenly items-center py-2 item-center w-full rounded-t-xl`} style={{ backgroundColor: colors[item.homeAbbrev] || colors.DEFAULT }}>
                              <Image
                                source={teamLogos[item.homeAbbrev] || teamLogos.DEFAULT}
                                style={{
                                  width: width * 0.13,
                                  height: width * 0.13,
                                  contentFit: 'contain',
                                }}
                              />
                              <Image
                                source={teamLogos[item.awayAbbrev] || teamLogos.DEFAULT}
                                style={{
                                  width: width * 0.13,
                                  height: width * 0.13,
                                  contentFit: 'contain',
                                }}
                              />
                            </View>
                            {item.gameState === "OFF" || item.gameState === "FINAL" ? (
                              <View className="justify-evenly w-full py-3 items-center flex-row bg-neutral-800 rounded-b-xl">
                                <Text className="text-white font-black text-xl">{item.homeScore}</Text>
                                <Text className="text-xs text-neutral-400 font-bold mt-1">{item.period}</Text>
                                <Text className="text-white font-black text-xl">{item.awayScore}</Text>
                              </View>
                            ) : item.gameState === "LIVE" ? (
                              <View className="justify-evenly w-full py-3 items-center flex-row bg-neutral-800 rounded-b-xl">
                                <Text className="text-white font-black text-xl">{item.homeScore}</Text>
                                <Text className="text-white font-extrabold text-xs rounded-md text-center px-2 py-1 bg-red-800">LIVE</Text>
                                <Text className="text-white font-black text-xl">{item.awayScore}</Text>
                              </View>
                            ) : (
                              <View className="justify-evenly w-full py-3 items-center flex-row bg-neutral-800 rounded-b-xl">
                                
                                {item.homeOdds && item.awayOdds && (
                                <Text 
                                  className={`px-1 rounded-sm font-extrabold text-xs 
                                  ${item.homeOdds <= item.awayOdds ? 'text-black' : 'text-neutral-400'}
                                  ${item.homeOdds <= item.awayOdds ? 'bg-neutral-400' : 'bg-transparent'}`}>
                                  {item.homeOdds}
                                </Text>
                                )}
                                <Text className="text-white font-extrabold text-xl">{item.localTime}</Text>
                                {item.homeOdds && item.awayOdds && (
                                  <Text 
                                    className={`px-1 rounded-sm font-extrabold text-xs 
                                    ${item.homeOdds >= item.awayOdds ? 'text-black' : 'text-neutral-400'}
                                    ${item.homeOdds >= item.awayOdds ? 'bg-neutral-400' : 'bg-transparent'}`}>
                                    {item.awayOdds}
                                  </Text>
                                )}
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ) 
              }
            }}
            ListEmptyComponent={
              <Text className="text-white font-medium text-lg text-center pt-8">no games found 🙁</Text>
            }
            ListHeaderComponent={<View style={{ height: height * 0.01 }} />}
            ListFooterComponent={<View style={{ height: height * 0.08 }} />}
            bounces={false}
          />
          )}

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

export default Home;