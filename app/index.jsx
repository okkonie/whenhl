import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Game } from "../components/game"
import { useState, useEffect } from "react";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#080808' }}>
      {loading ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : (
        <FlatList
          style={{
            flex: 1,
            height: '100%',
            width: '100%',
            padding: 8,
            borderTopWidth: 1,
            borderTopColor: '#1c1c1e'
          }}
          data={games ?? []}
          keyExtractor={(item, index) => item?.id?.toString?.() || item?.gameId?.toString?.() || index.toString()}
          renderItem={({ item, index }) => <Game game={item} index={index} />}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{height: 60}} />}
          ListEmptyComponent={
            <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 40}}>
              <Text style={{color: "white", opacity: 0.8}}>No games found for this date.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}