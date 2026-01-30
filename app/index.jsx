import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View, TextInput } from "react-native";
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../components/colors';
import Game from "../components/game";
import Loader from '../components/loader';
import { Octicons } from '@expo/vector-icons';
import Standings from './standings';

const Tab = createMaterialTopTabNavigator();

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pastSchedule, setPastSchedule] = useState([]);
  const [futureSchedule, setFutureSchedule] = useState([]);
  const [previousStartDate, setPreviousStartDate] = useState("");
  const [nextStartDate, setNextStartDate] = useState("");
  const [seasonStart, setSeasonStart ] = useState("");
  const [seasonEnd, setSeasonEnd ] = useState("");
  const [playoffStart, setPlayoffStart ] = useState("");
  const [standingsVisible, setStandingsVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const date = new Date(Date.now() - 259200000).toISOString().split('T')[0];

      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await response.json();

      setPreviousStartDate(data.previousStartDate);
      setNextStartDate(data.nextStartDate);
      setSeasonStart(data.preSeasonStartDate);
      setSeasonEnd(data.playoffEndDate);
      setPlayoffStart(data.regularSeasonEndDate);

      const allGames = (data?.gameWeek ?? []).flatMap(day => day.games ?? []);

      setPastSchedule(allGames.filter(g => g.gameState === 'FINAL' || g.gameState === 'OFF').reverse());
      setFutureSchedule(allGames.filter(g => g.gameState !== 'FINAL' && g.gameState !== 'OFF'));
    } catch (e) {
      console.error("Error fetching games", e);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMorePast = useCallback(async () => {
    if (loadingMore || !previousStartDate) return;
    try {
      setLoadingMore(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${previousStartDate}`);
      const data = await response.json();
      const games = (data?.gameWeek ?? []).flatMap(day => day.games ?? []).reverse();
      setPastSchedule(prev => [...prev, ...games]);
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
      const games = (data?.gameWeek ?? []).flatMap(day => day.games ?? []);
      setFutureSchedule(prev => [...prev, ...games]);
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
    <Game 
      key={item.id} 
      game={item} 
    />
  ), []);

  return (
    <SafeAreaView style={s.container}>
        {loading ? <Loader /> : (
          <>
            {standingsVisible && <Standings visible={standingsVisible} setVisible={setStandingsVisible}/>}
            <Tab.Navigator
              initialRouteName="UPCOMING"
              screenOptions={{
                tabBarActiveTintColor: colors.text,
                tabBarInactiveTintColor: colors.text2,
                tabBarStyle: { backgroundColor: colors.background, height: 40},
                tabBarIndicatorStyle: { backgroundColor: colors.text, height: 1 },
                tabBarLabelStyle: { fontWeight: '700', textTransform: 'none', fontSize: 12, paddingBottom: 5 },
              }}
            >
              <Tab.Screen name="PAST">
                {() => (
                  <FlatList
                    style={s.list}
                    data={pastSchedule}
                    extraData={loadingMore}
                    keyExtractor={(item, index) => (item.id || item.gameId || index).toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingTop: 10}}
                    ListFooterComponent={
                      <View style={{height: 100, paddingTop: 10, alignItems: 'center'}}>
                        {loadingMore && <ActivityIndicator size="small" color={colors.text} />}
                      </View>
                    }
                    onEndReached={seasonStart < previousStartDate ? loadMorePast : null}
                    onEndReachedThreshold={0.5}
                  />
                )}
              </Tab.Screen>
              <Tab.Screen name="UPCOMING">
                {() => (
                  <FlatList
                    style={s.list}
                    data={futureSchedule}
                    extraData={loadingMore}
                    keyExtractor={(item, index) => (item.id || item.gameId || index).toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingTop: 10}}
                    ListFooterComponent={
                      <View style={{alignItems: 'center', paddingTop: 10, paddingBottom: 50,}}>
                        {loadingMore && <ActivityIndicator size="small" color={colors.text} />}
                      </View>
                    }
                    onEndReached={seasonEnd > nextStartDate ? loadMoreFuture : null}
                    onEndReachedThreshold={0.5}
                  />
                )}
              </Tab.Screen>
            </Tab.Navigator>
          </>
        )}
        <KeyboardAvoidingView style={s.bottomBar} behavior="padding" keyboardVerticalOffset={10}>
          {searchVisible && (
            <TextInput 
              style={s.search}
              placeholder='Search players...'
              placeholderTextColor={colors.text2}
              autoFocus
              color={colors.text}
              cursorColor={colors.text}
              onBlur={() => setSearchVisible(false)}
            />
          )}
          <View style={s.bottomButtons}>
            {!searchVisible && 
              <TouchableOpacity style={s.bottomButton} onPress={() => setStandingsVisible(true)} activeOpacity={0.8}>
                <Octicons name="trophy" size={20} color={colors.text}/>
              </TouchableOpacity>
            }
            <TouchableOpacity style={s.bottomButton} onPress={() => setSearchVisible(!searchVisible)} activeOpacity={0.8}>
              <Octicons name={searchVisible ? "x" : "search"} size={20} color={colors.text}/>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  container: {
    flex: 1, 
    backgroundColor: colors.background,
  },
  list :{
    backgroundColor: colors.background,
    flex: 1
  },
  kb: {
    flex: 1,
  },
  bottomBar: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 15,
    zIndex: 50,
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    gap: 5,
    padding: 5,
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border
  },
  search: {
    flex: 1,
    alignItems: 'center',
    height: 55,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border
  },
  bottomButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    height: 45,
    width: 45
  }
})