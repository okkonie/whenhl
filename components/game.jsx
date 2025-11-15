import { View, Text, StyleSheet } from "react-native";
import { SvgUri } from "react-native-svg";

export default function Game({ game }) {

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const timeLabel = isValidStart
    ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  const dateLabel = isValidStart
    ? start.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })
    : 'TBA';

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
    <View style={s.container}>
        <View>
          <View style={s.top}>
            <Text style={s.time}>
              {game?.gameState == "FUT" ? timeLabel : game?.gameState}
              {game?.gameOutcome && game?.gameOutcome.lastPeriodType != "REG" && ` / ${game?.gameOutcome.lastPeriodType}`}
            </Text>
            <Text style={s.date}>{dateLabel}</Text>
          </View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={40} height={40} uri={game?.homeTeam?.darkLogo} />
            </View>
            <Text style={homeNameStyle}>{game?.homeTeam?.commonName?.default }</Text>
          </View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={40} height={40} uri={game?.awayTeam?.darkLogo} />
            </View>
            <Text style={awayNameStyle}>{game?.awayTeam?.commonName?.default }</Text>
          </View>
        </View>
        <View style={s.infoCol}>
          {game.gameState != "FUT" && (
            <View style={s.scoreCol}>
              <Text style={homeScoreStyle}>{game?.homeTeam?.score}</Text>
              <Text style={awayScoreStyle}>{game?.awayTeam?.score}</Text>
            </View>
          )}
        </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#191919',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: "space-between",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '60%'
  },
  svgplace: {
    width: 40,
    height: 40,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  teamName: {
    color: "white",
    fontWeight: 600
  },
  score: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  scoreCol: {
    flex: 1,
    justifyContent: 'space-evenly',
  }, 
  infoCol: {
    paddingRight: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  date: {
    color: '#b0b0b0',
    fontSize: 13,
  },
  time: {
    paddingHorizontal: 5,
    borderRadius: 5,
    backgroundColor: "#333",
    color: "#bbb",
    fontSize: 12,
    fontWeight: 600
  },
  top: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 5
  }
});