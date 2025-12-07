import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      const d = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const date = `${yyyy}-${mm}-${dd}`;

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
              <Octicons name={favorites ? 'star-fill' : 'star'}size={18} color={favorites ? "#FFD700" : "white"} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={s.btn}>
              <Octicons name="calendar" size={18} color="white" />
            </TouchableOpacity>
          </Header>
          <SectionList
            style={s.list}
            sections={games}
            keyExtractor={(item, index) => item?.id?.toString() || item?.gameId?.toString() || index.toString()}
            renderItem={({ item }) => <Game game={item} />}
            renderSectionHeader={({ section: { title } }) => (
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{title}</Text>
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
  btn: { 
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1, 
    backgroundColor: "#111",
  },
  list :{
    flex: 1
  },
  sectionHeader: {
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 500
  }
})