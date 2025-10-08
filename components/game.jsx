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

  // Compute styles: only change colors for finished games (not FUT or LIVE)
  const isPlayed = game?.gameState && game.gameState !== 'FUT' && game.gameState !== 'LIVE';
  const homeScoreNum = Number(game?.homeTeam?.score);
  const awayScoreNum = Number(game?.awayTeam?.score);

  let homeNameStyle = s.teamName;
  let awayNameStyle = s.teamName;
  let homeScoreStyle = s.score;
  let awayScoreStyle = s.score;

  if (isPlayed && !isNaN(homeScoreNum) && !isNaN(awayScoreNum) && homeScoreNum !== awayScoreNum) {
    const homeIsWinner = homeScoreNum > awayScoreNum;
    homeNameStyle = [s.teamName, { color: homeIsWinner ? 'white' : '#b0b0b0' }];
    awayNameStyle = [s.teamName, { color: homeIsWinner ? '#b0b0b0' : 'white' }];
    homeScoreStyle = [s.score, { color: homeIsWinner ? 'white' : '#b0b0b0' }];
    awayScoreStyle = [s.score, { color: homeIsWinner ? '#b0b0b0' : 'white' }];
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      key={index}
      onPress={() => onPress(game, { start, dateLabel, timeLabel })}
      style={s.container}
    >
        <View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={30} height={30} uri={game?.homeTeam?.darkLogo} />
            </View>
            <Text style={homeNameStyle}>{game?.homeTeam?.commonName?.default }</Text>
          </View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={30} height={30} uri={game?.awayTeam?.darkLogo} />
            </View>
            <Text style={awayNameStyle}>{game?.awayTeam?.commonName?.default }</Text>
          </View>
        </View>
        <View style={s.infoCol}>
          {game.gameState == "FUT" ? (
           <Text style={homeScoreStyle}>{timeLabel}</Text>
          ) : (
            <View style={s.scoreCol}>
              <Text style={homeScoreStyle}>{game?.homeTeam?.score}</Text>
              <Text style={awayScoreStyle}>{game?.awayTeam?.score}</Text>
            </View>
          )}
        </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderColor: '#222',
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: "space-between",
    gap: 30,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '60%'
  },
  svgplace: {
    width: 30,
    height: 30,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  teamName: {
    color: "white",
  },
  score: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  infoCol: {
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
  },
  dateLabel: {
    color: '#b0b0b0',
    fontSize: 12,
  },
  stateLabel: {
    color: 'white',
    fontWeight: '600',
  },
  liveLabel: {
    backgroundColor: '#e62b1e',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
});