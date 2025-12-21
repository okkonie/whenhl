import { StyleSheet, Text, View } from "react-native";
import { SvgUri } from "react-native-svg";
import { colors } from '../assets/colors';

const statLabels = {
  points: 'PTS',
  goals: 'G',
  assists: 'A',
  plusMinus: '+/-',
  toi: 'TOI',
  goalsPp: 'PPG',
  faceoffLeaders: 'FO%',
  penaltyMins: 'PIM',
  goalsSh: 'SHG',
  savePctg: 'SV%',
  goalsAgainstAverage: 'GAA',
  wins: 'W',
  shutouts: 'SO',
};

export default function Player({ player, rank, mode }) {
  const getStatValue = () => {
    const value = player.value;
    if (mode === 'toi') {
      const mins = Math.floor(value / 60);
      const secs = Math.round(value % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    if (mode === 'faceoffLeaders' || mode === 'savePctg') {
      return (value * 100).toFixed(1) + '%';
    }
    if (mode === 'goalsAgainstAverage') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <View style={s.container}>
      <Text style={s.rank}>{rank}</Text>
      <View style={s.info}>
        <SvgUri width={35} height={30} uri={`https://assets.nhle.com/logos/nhl/svg/${player.teamAbbrev}_dark.svg`} />
        <Text style={s.name}>{player.firstName.default} {player.lastName.default}</Text>
      </View>
      <View style={s.statContainer}>
        <Text style={s.statValue}>{getStatValue()}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: {
    width: 20,
    textAlign: 'right',
    color: colors.text2,
    fontSize: 14,
  },
  headshot: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: colors.card,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 400,
  },
  team: {
    color: colors.grey,
    fontSize: 13,
    marginTop: 2,
  },
  statContainer: {
    alignItems: 'flex-end',
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 500,
  },
  statLabel: {
    color: colors.grey,
    fontSize: 12,
    marginTop: 2,
  },
});
