import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Game from "../components/game";
import GameInfo from "../components/gameinfo"; // default export
import { useState, useEffect } from "react";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [gameVisible, setGameVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState("")

  const fetchGames = async () => {

    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/now`);
      const data = await response.json();
      // Flatten { gameWeek: [{ date, games: [...] }, ...] } => games[]
      const flattened = (data?.gameWeek ?? []).flatMap((d) => d?.games ?? []);
      setGames(flattened);
    } catch (e) {
      console.error("Error fetching games", e)
    } finally {
      setLoading(false)
    }

  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleGamePress = (id) => {
    setGameVisible(true);
    setSelectedGame(id)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
      {loading ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          style={{
            flex: 1,
            height: '100%',
            width: '100%',
            borderTopWidth: 1,
            borderColor: '#222'
          }}
          data={games ?? []}
          keyExtractor={(item, index) => item?.id?.toString?.() || item?.gameId?.toString?.() || index.toString()}
          renderItem={({ item, index }) => <Game game={item} index={index} onPress={() => handleGamePress(item.id)}/>}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{height: 50}} />}
          ListEmptyComponent={
            <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 40}}>
              <Text style={{color: "white", opacity: 0.8}}>No games found for this date.</Text>
            </View>
          }
        />
      )}
      {gameVisible && (
        <GameInfo
          visible={gameVisible}
          gameId={selectedGame}
          onClose={() => setGameVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}