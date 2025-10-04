import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Game from "../components/game";
import GameInfo from "../components/gameinfo"; // default export
import { useState, useEffect } from "react";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [gameVisible, setGameVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState({});

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/now`);
      const data = await response.json();
      // Flatten { gameWeek: [{ date, games: [...] }, ...] } => games[]
      const flattened = (data?.gameWeek ?? []).flatMap((d) => d?.games ?? []);
      setGames(flattened);
    } catch (e) {
      console.error("Error fetching games", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleGamePress = (game, labels) => {
    setGameVisible(true);
    setSelectedGame(game);
    setSelectedLabels(labels);
  };

  return (
    <SafeAreaView style={ s.container }>
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
    flex: 1, backgroundColor: "#111"
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