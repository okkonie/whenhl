import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Game from "../components/game";
import Teams from "../components/teams";
import { useState, useEffect } from "react";
import Octicons from '@expo/vector-icons/Octicons';

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
          <TouchableOpacity activeOpacity={0.8}>
            <Octicons name="star" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTeams(true)} activeOpacity={0.8}>
            <Octicons name="list-ordered" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}>
            <Octicons name="calendar" size={20} color="white" />
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
          data={games}
          keyExtractor={(item, index) => item?.id?.toString() || item?.gameId?.toString() || index.toString()}
          renderItem={({ item }) => <Game game={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      {showTeams && (
        <Teams visible={showTeams} favorites={null} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  buttons: {
    gap: 30,
    alignItems: 'center',
    flexDirection: 'row'
  },
  container: {
    flex: 1, 
    backgroundColor: "#161616",
  },
  header: {
    height: 80,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
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