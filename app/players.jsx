import { Octicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Header from "../components/header";
import Loader from "../components/loader";
import Player from "../components/player";

const { width, height } = Dimensions.get('window');

const skaterModes = ['points', 'goals', 'assists', 'plusMinus', 'toi', 'goalsPp', 'faceoffLeaders', 'penaltyMins'];
const goalieModes = ['savePctg', 'goalsAgainstAverage', 'wins', 'shutouts'];

const statLabels = {
  points: 'Points',
  goals: 'Goals',
  assists: 'Assists',
  plusMinus: 'Plus Minus',
  toi: 'Time on Ice',
  goalsPp: 'Power Play Goals',
  faceoffLeaders: 'Faceoff %',
  penaltyMins: 'Penalty Minutes',
  savePctg: 'Save %',
  goalsAgainstAverage: 'Goals Against Avg',
  wins: 'Wins',
  shutouts: 'Shutouts',
};

export default function Players() {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState(null);
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

  const getPlayers = (mode) => {
    if (skaterModes.includes(mode)) {
      return skaterStats[mode] || [];
    }
    return goalieStats[mode] || [];
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setModalVisible(true);
  };

  const allModes = [...skaterModes, ...goalieModes];

  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'Players'} />
          <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
            {allModes.map((mode) => (
              <View key={mode}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>{statLabels[mode]}</Text>
                  <TouchableOpacity onPress={() => openModal(mode)} activeOpacity={0.7} style={s.moreBtn}>
                    <Text style={s.moreBtnText}>See more</Text>
                    <Octicons name="chevron-right" size={14} color={colors.text2} />
                  </TouchableOpacity>
                </View>
                <View style={s.playersContainer}>
                  {getPlayers(mode).slice(0, 5).map((player, index) => (
                    <Player key={player.player?.playerId || index} player={player} rank={index + 1} mode={mode} isLast={index === 4} />
                  ))}
                </View>
              </View>
            ))}
            <View style={{ height: 50 }} />
          </ScrollView>

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <SafeAreaView style={s.modalContainer}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{modalMode ? statLabels[modalMode] : ''}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={s.closeBtn}>
                  <Octicons name="x" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                style={s.list}
                data={modalMode ? getPlayers(modalMode) : []}
                keyExtractor={(item, index) => item.player?.playerId?.toString() || index.toString()}
                renderItem={({ item, index }) => (
                  <Player player={item} rank={index + 1} mode={modalMode} />
                )}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </Modal>
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
  list: {
    flex: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreBtnText: {
    color: colors.text2,
    fontSize: 14,
  },
  playersContainer: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginHorizontal: 10,
    paddingHorizontal: 15,
  },
  modalContainer: {
    position: 'absolute',
    width: '100%',
    height: '97%',
    bottom: 0,
    backgroundColor: colors.card,
    borderRadius: 15
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 800,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});