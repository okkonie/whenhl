import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomModal from "../../components/customModal";
import TeamLogo from "../../components/teamLogo";
import { colors } from "../../components/colors";

const statLabels = {
  points: 'POINTS',
  goals: 'GOALS',
  assists: 'ASSISTS',
  plusMinus: 'PLUS MINUS',
  toi: 'TOI',
  goalsPp: 'PP GOALS',
  faceoffLeaders: 'FACEOFF%',
  penaltyMins: 'PENALTY MINS',
  savePctg: 'SAVE%',
  goalsAgainstAverage: 'GAA',
  wins: 'WINS',
  shutouts: 'SHUTOUTS',
};

const goalieModes = ['savePctg', 'goalsAgainstAverage', 'wins', 'shutouts'];

export default function CategoryTop({ visible, category, onClose, onPlayerPress }) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (visible && category) {
      fetchCategoryStats();
    }
  }, [visible, category]);

  const fetchCategoryStats = async () => {
    setLoading(true);
    try {
      const isGoalie = goalieModes.includes(category);
      const endpoint = isGoalie ? 'goalie-stats-leaders' : 'skater-stats-leaders';
      const response = await fetch(
        `https://api-web.nhle.com/v1/${endpoint}/current?category=${category}&limit=-1`
      );
      const data = await response.json();
      setPlayers(data[category] || []);
    } catch (e) {
      console.error('Error fetching category stats', e);
    } finally {
      setLoading(false);
    }
  };

  const statCleaner = (mode, value) => {
    if (mode === 'toi') {
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    if (mode === 'savePctg' || mode === 'faceoffLeaders') {
      return (value * 100).toFixed(1) + '%';
    }
    if (mode === 'goalsAgainstAverage') {
      return value.toFixed(2);
    }
    return value;
  };

  const renderPlayer = ({ item, index }) => (
    <TouchableOpacity
      style={s.playerItem}
      activeOpacity={0.7}
      onPress={() => onPlayerPress(item.id, item.teamAbbrev)}
    >
      <View style={s.playerInfo}>
        <Text style={s.rank}>{index + 1}</Text>
        <TeamLogo abbrev={item.teamAbbrev} size={24} />
        <Text style={s.playerName}>
          {`${item.firstName.default} ${item.lastName.default}`}
        </Text>
      </View>
      <Text style={s.playerStat}>{statCleaner(category, item.value)}</Text>
    </TouchableOpacity>
  );

  return (
    <CustomModal visible={visible} onClose={onClose} loading={loading} title={category ? statLabels[category] : ''}>
      <View style={s.container}>
        <FlatList
          data={players}
          renderItem={renderPlayer}
          keyExtractor={(item, index) => `${item.id}-${category}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.listContent}
        />
      </View>
    </CustomModal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: colors.card,
    paddingRight: 30,
    paddingLeft: 15,
    marginBottom: 4,
    borderColor: colors.border,
    borderTopWidth: 1,
  },
  rank: {
    color: colors.text2,
    textAlign: 'center',
    width: 30,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  playerName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '400',
  },
  playerStat: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});