import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Game from "../components/game";
import GameInfo from "../components/gameinfo"; // default export
import { useState, useEffect } from "react";
import Entypo from '@expo/vector-icons/Entypo';

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [gameVisible, setGameVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [currentDate, setCurrentDate] = useState(() => {
    // default to 2 days ago in YYYY-MM-DD format
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [nextStartDate, setNextStartDate] = useState(null);
  const [previousStartDate, setPreviousStartDate] = useState(null);

  const fetchGames = async (date = currentDate) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await response.json();
      // Flatten { gameWeek: [{ date, games: [...] }, ...] } => games[]
      const flattened = (data?.gameWeek ?? []).flatMap((d) => d?.games ?? []);
      setGames(flattened);
      
      setNextStartDate(data?.nextStartDate ?? null);
      setPreviousStartDate(data?.previousStartDate ?? null);
      setCurrentDate(date);
    } catch (e) {
      console.error("Error fetching games", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch for the default date (2 days ago)
    fetchGames(currentDate);
  }, []);

  const handleGamePress = (game, labels) => {
    setGameVisible(true);
    setSelectedGame(game);
    setSelectedLabels(labels);
  };

  return (
    <SafeAreaView style={ s.container }>
      <View style={s.header}>
        <Text style={s.headerText}>
          Games
        </Text>
        <View style={s.buttons}>
          <TouchableOpacity
            onPress={() => previousStartDate && fetchGames(previousStartDate)}
            disabled={!previousStartDate}
            style={[s.navButton, !previousStartDate && s.navButtonDisabled]}
          >
            <Entypo name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => nextStartDate && fetchGames(nextStartDate)}
            disabled={!nextStartDate}
            style={[s.navButton, !nextStartDate && s.navButtonDisabled]}
          >
            <Entypo name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          style={s.list}
          data={games ?? []}
          keyExtractor={(item, index) => item?.id?.toString?.() || item?.gameId?.toString?.() || index.toString()}
          renderItem={({ item, index }) => (
            <Game
              game={item}
              index={index}
              onPress={handleGamePress}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 50 }} />}
        />
      )}
      {gameVisible && (
        <GameInfo
          visible={gameVisible}
          game={selectedGame}
          dateLabel={selectedLabels.dateLabel}
          timeLabel={selectedLabels.timeLabel}
          onClose={() => setGameVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#111",
  },
  header: {
    height: 60,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 700,
  },
  buttons: {
    flexDirection: 'row'
  },
  navButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loader: {
    flex: 1, alignItems: "center", justifyContent: "center"
  },
  list :{
    flex: 1,
    height: "100%",
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#222",
  }
})