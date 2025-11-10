import { View, Text, StyleSheet } from "react-native";
import { SvgUri } from "react-native-svg";

export default function Game({ game, index }) {

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
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
    <View
      key={index}
      style={s.container}
    >
        <View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={35} height={35} uri={game?.homeTeam?.darkLogo} />
            </View>
            <Text style={homeNameStyle}>{game?.homeTeam?.commonName?.default }</Text>
          </View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={35} height={35} uri={game?.awayTeam?.darkLogo} />
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
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderColor: '#222',
    backgroundColor: '#141414',
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
    width: 35,
    height: 35,
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
});