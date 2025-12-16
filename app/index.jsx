import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Game from "../components/game";
import Header from '../components/header';
import Loader from '../components/loader';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [pastSchedule, setPastSchedule] = useState([]);
  const [futureSchedule, setFutureSchedule] = useState([]);
  const [page, setPage] = useState(1);
  const [filteredPast, setFilteredPast] = useState([]);
  const [filteredFuture, setFilteredFuture] = useState([]);
  const [favorites, setFavorites] = useState(false);
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const pagerRef = useRef(null);

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
      style={s.list}
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
      ListFooterComponent={<View style={{height: 50}} />}
    />
  );

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'GAMES'}>
            <TouchableOpacity activeOpacity={0.8} style={s.btn} onPress={() => setFavorites(!favorites)}>
              <Octicons name={favorites ? 'star-fill' : 'star'} size={18} color={favorites ? colors.yellow : colors.text} />
            </TouchableOpacity>
          </Header>
          <View style={s.selectorContainer}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[s.selectorBtn, page == 0 && s.selected]} 
              onPress={() => {
                setPage(0);
                pagerRef.current?.setPage(0);
              }}
            >
              <Text style={s.selectorText}>PAST</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[s.selectorBtn, page == 1 && s.selected]} 
              onPress={() => {
                setPage(1);
                pagerRef.current?.setPage(1);
              }}
            >
              <Text style={s.selectorText}>UPCOMING</Text>
            </TouchableOpacity>
          </View>
          <PagerView 
            ref={pagerRef}
            style={s.pagerView} 
            initialPage={1}
            onPageSelected={(e) => setPage(e.nativeEvent.position)}
          >
            <View key="0">
              {renderGameList(filteredPast)}
            </View>
            <View key="1">
              {renderGameList(filteredFuture)}
            </View>
          </PagerView>
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
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 3
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.background
  },
  selected: {
    borderColor: 'white',
  },
  selectorText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 500
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
    bottom: 0,
    height: 1,
    width: '50%',
    backgroundColor: colors.text,
  }
})