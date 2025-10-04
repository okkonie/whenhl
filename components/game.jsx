import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SvgUri } from "react-native-svg";

export default function Game({ game, onPress, index }) {

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const dateLabel = isValidStart
    ? start.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'numeric' })
    : '';
  const timeLabel = isValidStart
    ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      key={index}
      onPress={() => onPress(game, { start, dateLabel, timeLabel })}
      style={s.container}
    >
      <View style={s.row}>
        <View>
          <View style={s.teamRow}>
            <SvgUri width={30} height={30} uri={game?.homeTeam?.darkLogo} />
            <Text style={s.teamName}>{game?.homeTeam?.commonName?.default }</Text>
          </View>
          <View style={s.teamRow}>
            <SvgUri width={30} height={30} uri={game?.awayTeam?.darkLogo} />
            <Text style={s.teamName}>{game?.awayTeam?.commonName?.default }</Text>
          </View>
        </View>
        {game.gameState != "FUT" && (
          <View style={s.scoreCol}>
            <Text style={s.score}>{game?.homeTeam?.score}</Text>
            <Text style={s.score}>{game?.awayTeam?.score}</Text>
          </View>
        )}
      </View>
      <View style={s.infoCol}>
        <Text style={s.dateLabel}>{dateLabel}</Text>
        <Text style={[
          s.stateLabel,
          game.gameState === 'LIVE' && s.liveLabel
        ]}>
          {game.gameState === 'FUT' ? timeLabel : game.gameState === 'LIVE' ? 'LIVE' : game?.periodDescriptor?.periodType}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderColor: '#222',
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: "space-between",
    gap: 30,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 1,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  teamName: {
    color: "white",
  },
  scoreCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    minWidth: 30,
  },
  score: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  infoCol: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  dateLabel: {
    color: '#b0b0b0',
    fontSize: 12,
  },
  stateLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: '#222',
  },
  liveLabel: {
    backgroundColor: '#e62b1e',
  },
});