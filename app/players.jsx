import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [showTeams, setShowTeams] = useState(false);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const date = `${yyyy}-${mm}-${dd}`;

      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await response.json();
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

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerText}>Games</Text>
        <View style={s.buttons}>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: "#161616",
  },
  header: {
    height: 65,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    paddingLeft: 10,
    fontSize: 18,
    color: 'white',
    fontWeight: 700,
  },
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
  list :{
    flex: 1
  }
})