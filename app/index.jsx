import Octicons from '@expo/vector-icons/Octicons';
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Game from "../components/game";
import Header from '../components/header';
import Loader from '../components/loader';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);

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
      {loading ? <Loader /> : (
        <>
          <Header text={'Games'}>
            <TouchableOpacity activeOpacity={0.8} style={s.btn}>
              <Octicons name="star" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={s.btn}>
              <Octicons name="calendar" size={18} color="white" />
            </TouchableOpacity>
          </Header>
          <FlatList
            style={s.list}
            data={games}
            keyExtractor={(item, index) => item?.id?.toString() || item?.gameId?.toString() || index.toString()}
            renderItem={({ item }) => <Game game={item} />}
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
    backgroundColor: "#161616",
  },
  list :{
    flex: 1
  }
})