import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game } from "../components/game"
import { useState, useEffect } from "react";
import {StatusBar} from 'react-native';
console.log('statusBarHeight: ', StatusBar.currentHeight);

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);

  const fetchGames = async () => {

    const now = new Date();
    now.setDate(now.getDate() - 2);
    const TwodaysAgo = now.toISOString().split('T')[0];

    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${TwodaysAgo}`);
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


  return (
    <SafeAreaView className="flex-1 bg-black p-3" edges={["top"]}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" />
          <Text className="text-white mt-2">Loading…</Text>
        </View>
      ) : (
        <FlatList
          className="flex-1 w-full"
          data={games ?? []}
          keyExtractor={(item, index) => item?.id?.toString?.() || item?.gameId?.toString?.() || index.toString()}
          renderItem={({ item, index }) => <Game game={item} index={index} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-white/80">No games found for this date.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}