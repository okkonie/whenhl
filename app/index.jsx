import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Game from "../components/game";
import GameStory from "../components/gamestory";
import Header from '../components/header';
import Loader from '../components/loader';

const Tab = createMaterialTopTabNavigator();

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pastSchedule, setPastSchedule] = useState([]);
  const [futureSchedule, setFutureSchedule] = useState([]);
  const [previousStartDate, setPreviousStartDate] = useState('');
  const [nextStartDate, setNextStartDate] = useState('');
  const [currentGame, setCurrentGame] = useState('');
  const [gameVisible, setGameVisible] = useState(false);
 
  const groupGamesByLocalDate = (games) => {
    const grouped = {};
    games.forEach(game => {
      const localDate = new Date(game.startTimeUTC).toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!grouped[localDate]) {
        grouped[localDate] = [];
      }
      grouped[localDate].push(game);
    });
    return grouped;
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const date = new Date(Date.now() - 259200000).toISOString().split('T')[0];

      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await response.json();
      
      setPreviousStartDate(data.previousStartDate);
      setNextStartDate(data.nextStartDate);
      
      const allGames = (data?.gameWeek ?? []).flatMap(day => day.games ?? []);
      
      const pastGames = allGames.filter(g => g.gameState === 'FINAL' || g.gameState === 'OFF');
      const futureGames = allGames.filter(g => g.gameState !== 'FINAL' && g.gameState !== 'OFF');

      const pastGrouped = groupGamesByLocalDate(pastGames);
      const futureGrouped = groupGamesByLocalDate(futureGames);

      const past = Object.entries(pastGrouped)
        .map(([title, data]) => ({ title, data: data.reverse() }))
        .reverse();
      const future = Object.entries(futureGrouped)
        .map(([title, data]) => ({ title, data }));

      setPastSchedule(past);
      setFutureSchedule(future);
    } catch (e) {
      console.error("Error fetching games", e);
    } finally {
      setLoading(false);
    }
  };

  const parseGames = (gameWeek) => {
    const allGames = (gameWeek ?? []).flatMap(day => day.games ?? []);
    
    const pastGames = allGames.filter(g => g.gameState === 'FINAL' || g.gameState === 'OFF');
    const futureGames = allGames.filter(g => g.gameState !== 'FINAL' && g.gameState !== 'OFF');

    const pastGrouped = groupGamesByLocalDate(pastGames);
    const futureGrouped = groupGamesByLocalDate(futureGames);

    const past = Object.entries(pastGrouped)
      .map(([title, data]) => ({ title, data: data.reverse() }));
    const future = Object.entries(futureGrouped)
      .map(([title, data]) => ({ title, data }));

    return { past, future };
  };

  const mergeSchedule = (existing, incoming, prepend = false) => {
    const merged = {};
    
    // Add existing sections
    existing.forEach(section => {
      merged[section.title] = [...section.data];
    });
    
    // Merge incoming sections
    incoming.forEach(section => {
      if (merged[section.title]) {
        if (prepend) {
          merged[section.title] = [...section.data, ...merged[section.title]];
        } else {
          merged[section.title] = [...merged[section.title], ...section.data];
        }
      } else {
        merged[section.title] = [...section.data];
      }
    });

    // Convert back to array, maintaining order
    const existingTitles = existing.map(s => s.title);
    const incomingTitles = incoming.map(s => s.title);
    const allTitles = prepend 
      ? [...incomingTitles.filter(t => !existingTitles.includes(t)), ...existingTitles]
      : [...existingTitles, ...incomingTitles.filter(t => !existingTitles.includes(t))];
    
    return allTitles.map(title => ({ title, data: merged[title] }));
  };

  const loadMorePast = useCallback(async () => {
    if (loadingMore || !previousStartDate) return;
    try {
      setLoadingMore(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${previousStartDate}`);
      const data = await response.json();
      const { past } = parseGames(data?.gameWeek);
      setPastSchedule(prev => mergeSchedule(prev, past.reverse(), false));
      setPreviousStartDate(data.previousStartDate);
    } catch (e) {
      console.error("Error loading more past games", e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, previousStartDate]);

  const loadMoreFuture = useCallback(async () => {
    if (loadingMore || !nextStartDate) return;
    try {
      setLoadingMore(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${nextStartDate}`);
      const data = await response.json();
      const { future } = parseGames(data?.gameWeek);
      setFutureSchedule(prev => mergeSchedule(prev, future, false));
      setNextStartDate(data.nextStartDate);
    } catch (e) {
      console.error("Error loading more future games", e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextStartDate]);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (!loading && !loadingMore && pastSchedule.length === 0 && previousStartDate) {
      loadMorePast();
    }
  }, [loading, loadingMore, pastSchedule, previousStartDate, loadMorePast]);

  useEffect(() => {
    if (!loading && !loadingMore && futureSchedule.length === 0 && nextStartDate) {
      loadMoreFuture();
    }
  }, [loading, loadingMore, futureSchedule, nextStartDate, loadMoreFuture]);

  const renderItem = useCallback(({ item }) => (
    <View>
      <Text style={s.sectionTitle}>{item.title}</Text>
      <View style={s.gameContainer}>
        {item.data.map((game, index) => (
          <Game 
            key={game.id || game.gameId || index} 
            game={game} 
            isFirst={index === 0} 
            onPress={() => { 
              setCurrentGame(game.id || game.gameId); 
              setGameVisible(true);
            }}
          />
        ))}
      </View>
    </View>
  ), []);

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'Games'} />
          <Tab.Navigator
            initialRouteName="Upcoming"
            screenOptions={{
              tabBarActiveTintColor: colors.text,
              tabBarInactiveTintColor: colors.text2,
              tabBarStyle: { backgroundColor: colors.background, height: 36 },
              tabBarIndicatorStyle: { backgroundColor: colors.text, height: 2 },
              tabBarLabelStyle: { fontWeight: '600', textTransform: 'none', fontSize: 12, marginTop: -8 },
            }}
            sceneContainerStyle={{ backgroundColor: colors.background }}
          >
            <Tab.Screen name="Past">
              {() => (
                <FlatList
                  style={[s.list, { backgroundColor: colors.background }]}
                  data={pastSchedule}
                  extraData={loadingMore}
                  keyExtractor={(item, index) => item.title + index}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    <View style={{height: 100, paddingTop: 10, alignItems: 'center'}}>
                      {loadingMore && <ActivityIndicator size="small" color={colors.text} />}
                    </View>
                  }
                  onEndReached={loadMorePast}
                  onEndReachedThreshold={0.5}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Upcoming">
              {() => (
                <FlatList
                  style={[s.list, { backgroundColor: colors.background }]}
                  data={futureSchedule}
                  extraData={loadingMore}
                  keyExtractor={(item, index) => item.title + index}
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    <View style={{height: 100, paddingTop: 10, alignItems: 'center'}}>
                      {loadingMore && <ActivityIndicator size="small" color={colors.text} />}
                    </View>
                  }
                  onEndReached={loadMoreFuture}
                  onEndReachedThreshold={0.5}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
          <GameStory visible={gameVisible} onClose={() => setGameVisible(false)} gameId={currentGame} />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  gameContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginHorizontal: 10,
    marginTop: 5
  },
  container: {
    flex: 1, 
    backgroundColor: colors.background,
  },
  list :{
    flex: 1
  },
  sectionTitle: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10,
    color: colors.text,
    fontSize: 15,
    fontWeight: 500
  },
  underline: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 2,
    bottom: 0,
  },
})