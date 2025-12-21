import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Game from "../components/game";
import Header from '../components/header';
import Loader from '../components/loader';

const Tab = createMaterialTopTabNavigator();

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [pastSchedule, setPastSchedule] = useState([]);
  const [futureSchedule, setFutureSchedule] = useState([]);
  const [filteredPast, setFilteredPast] = useState([]);
  const [filteredFuture, setFilteredFuture] = useState([]);
  const [favorites, setFavorites] = useState(false);
  const [favoriteTeams, setFavoriteTeams] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favoriteTeams');
      if (stored) {
        setFavoriteTeams(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      const date = new Date(Date.now() - 259200000).toISOString().split('T')[0];

      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await response.json();
      
      const past = [];
      const future = [];

      (data?.gameWeek ?? []).forEach((day) => {
        const title = new Date(day.date + 'T00:00:00').toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
        const dayGames = day.games ?? [];
        
        const pastGames = dayGames.filter(g => g.gameState === 'FINAL' || g.gameState === 'OFF');
        const futureGames = dayGames.filter(g => g.gameState !== 'FINAL' && g.gameState !== 'OFF');

        if (pastGames.length > 0) {
          past.push({ title, data: pastGames.reverse() });
        }
        if (futureGames.length > 0) {
          future.push({ title, data: futureGames });
        }
      });

      setPastSchedule(past.reverse());
      setFutureSchedule(future);
    } catch (e) {
      console.error("Error fetching games", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    const filterGames = (source) => {
      if (favorites) {
        return source.map(section => ({
          ...section,
          data: section.data.filter(game => 
            favoriteTeams.includes(game.awayTeam.abbrev) || 
            favoriteTeams.includes(game.homeTeam.abbrev)
          )
        })).filter(section => section.data.length > 0);
      }
      return source;
    };

    setFilteredPast(filterGames(pastSchedule));
    setFilteredFuture(filterGames(futureSchedule));
  }, [favorites, favoriteTeams, pastSchedule, futureSchedule]);

  const renderGameList = (data) => (
    <FlatList
      style={[s.list, { backgroundColor: colors.background }]}
      data={data}
      keyExtractor={(item, index) => item.title + index}
      renderItem={({ item }) => (
        <View>
          <Text style={s.sectionTitle}>{item.title}</Text>
          <View style={s.gameContainer}>
            {item.data.map((game, index) => (
              <Game key={game.id || game.gameId || index} game={game} isFirst={index === 0} />
            ))}
          </View>
        </View>
      )}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={<View style={{height: 55}} />}
    />
  );

  const PastScreen = () => renderGameList(filteredPast);
  const UpcomingScreen = () => renderGameList(filteredFuture);

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'Games'}>
            <TouchableOpacity activeOpacity={0.8} style={s.btn} onPress={() => setFavorites(!favorites)}>
              <Octicons name={favorites ? 'star-fill' : 'star'} size={18} color={favorites ? colors.yellow : colors.text} />
            </TouchableOpacity>
          </Header>
          <Tab.Navigator
            initialRouteName="Upcoming"
            screenOptions={{
              tabBarActiveTintColor: colors.text,
              tabBarInactiveTintColor: colors.text2,
              tabBarStyle: { backgroundColor: colors.background },
              tabBarIndicatorStyle: { backgroundColor: colors.text },
              tabBarLabelStyle: { fontWeight: '600', textTransform: 'none', fontSize: 12 },
            }}
            sceneContainerStyle={{ backgroundColor: colors.background }}
          >
            <Tab.Screen name="Past" component={PastScreen}/>
            <Tab.Screen name="Upcoming" component={UpcomingScreen} />
          </Tab.Navigator>
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
  btn: { 
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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