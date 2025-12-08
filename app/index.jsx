import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Game from "../components/game";
import Header from '../components/header';
import Loader from '../components/loader';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [games, setGames] = useState([]);
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
      const date = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await response.json();
      const sections = (data?.gameWeek ?? []).map((day) => ({
        title: new Date(day.date + 'T00:00:00').toLocaleDateString('default', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        data: day.games ?? []
      })).filter(s => s.data.length > 0);
      setSchedule(sections);
      setGames(sections);
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
    if (favorites) {
      const filtered = schedule.map(section => ({
        ...section,
        data: section.data.filter(game => 
          favoriteTeams.includes(game.awayTeam.abbrev) || 
          favoriteTeams.includes(game.homeTeam.abbrev)
        )
      })).filter(section => section.data.length > 0);
      setGames(filtered);
    } else {
      setGames(schedule);
    }
  }, [favorites, favoriteTeams, schedule]);

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'GAMES'}>
            <TouchableOpacity activeOpacity={0.8} style={s.btn} onPress={() => setFavorites(!favorites)}>
              <Octicons name={favorites ? 'star-fill' : 'star'} size={18} color={favorites ? colors.yellow : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={s.btn}>
              <Octicons name="calendar" size={18} color="white" />
            </TouchableOpacity>
          </Header>
          <FlatList
            style={s.list}
            data={games}
            keyExtractor={(item, index) => item.title + index}
            renderItem={({ item }) => (
              <View style={s.gameContainer}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>{item.title}</Text>
                </View>
                {item.data.map((game, index) => (
                  <Game key={game.id || game.gameId || index} game={game} />
                ))}
              </View>
            )}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{height: 50}} />}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  gameContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 5
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
  sectionHeader: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 500
  }
})