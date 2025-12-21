import { Octicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Header from "../components/header";
import Loader from "../components/loader";
import Player from "../components/player";
import StatMode from "../components/statMode";

const skaterModes = ['points', 'goals', 'assists', 'plusMinus', 'toi', 'goalsPp', 'faceoffLeaders', 'penaltyMins'];
const goalieModes = ['savePctg', 'goalsAgainstAverage', 'wins', 'shutouts'];

export default function Players() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('points');
  const [modalVisible, setModalVisible] = useState(false);
  const [skaterStats, setSkaterStats] = useState({});
  const [goalieStats, setGoalieStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [skaterRes, goalieRes] = await Promise.all([
        fetch('https://api-web.nhle.com/v1/skater-stats-leaders/current?limit=100'),
        fetch('https://api-web.nhle.com/v1/goalie-stats-leaders/current?limit=100')
      ]);
      const skaterData = await skaterRes.json();
      const goalieData = await goalieRes.json();
      setSkaterStats(skaterData);
      setGoalieStats(goalieData);
    } catch (e) {
      console.error('Error fetching stats', e);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlayers = () => {
    if (skaterModes.includes(mode)) {
      return skaterStats[mode] || [];
    }
    return goalieStats[mode] || [];
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'Players'}>
            <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7} style={s.btn}>
              <Octicons name="arrow-switch" size={20} color={colors.text}/>
            </TouchableOpacity>
          </Header>
          <FlatList
            style={s.list}
            data={getCurrentPlayers()}
            keyExtractor={(item, index) => item.player?.playerId?.toString() || index.toString()}
            renderItem={({ item, index }) => (
              <Player player={item} rank={index + 1} mode={mode} />
            )}
            showsVerticalScrollIndicator={false}
          />
          <StatMode mode={mode} setMode={handleModeChange} onClose={() => setModalVisible(false)} visible={modalVisible}/>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colors.background,
  },
  header: {
    height: 65,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
  list :{
    flex: 1
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
})