import { memo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../../components/colors';
import GameStory from './gamestory';
import TeamLogo from '../../components/teamLogo';

function Game({ game }) {
  
  const [gameVisible, setGameVisible] = useState(false);

  const isPlayed = game?.gameState && game.gameState !== 'FUT' && game.gameState !== 'LIVE' && game.gameState !== 'PRE';

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const timeLabel = isValidStart
    ? start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  const dateLabel = isValidStart
    ? start.toLocaleDateString(undefined, { weekday: "short", day: 'numeric', month: 'numeric' })
    : '';

  const homeScoreNum = game?.homeTeam?.score;
  const awayScoreNum = game?.awayTeam?.score;

  let homeIsWinner = undefined;
  (homeScoreNum && awayScoreNum) &&  homeIsWinner == homeScoreNum > awayScoreNum

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setGameVisible(true)} style={s.container}>
        <View style={s.teams}>

          <View style={s.teamRow}>
            <View style={s.teamLeft}>
              <TeamLogo abbrev={game?.homeTeam?.abbrev} size={27}/>
              <Text style={s.teamName}>{game?.homeTeam?.commonName.default}</Text>
            </View>
            {(isPlayed || game.gameState == 'LIVE') && <Text style={s.score}>{game?.homeTeam?.score}</Text>}
          </View>

          <View style={s.teamRow}>
            <View style={s.teamLeft}>
              <TeamLogo abbrev={game?.awayTeam?.abbrev} size={27}/>
              <Text style={s.teamName}>{game?.awayTeam?.commonName.default}</Text>
            </View>
            {(isPlayed || game.gameState == 'LIVE') && <Text style={s.score}>{game?.awayTeam?.score}</Text>}
          </View>

        </View>

        <View style={s.time}>
          {
            game.gameState == 'LIVE' ? <Text style={s.date}>LIVE</Text>
            : isPlayed ? <Text style={s.date}>{game.gameOutcome?.lastPeriodType}</Text>
            : <>
                <Text style={s.date}>{dateLabel}</Text>
                <Text style={s.date}>{timeLabel}</Text>
              </>
          }
        </View>

      </TouchableOpacity>

      <GameStory 
        visible={gameVisible}
        game={game}
        onClose={() => setGameVisible(false)}
        id={game.id}
        timeLabel={timeLabel}
        isPlayed={isPlayed} 
        homeScoreNum={homeScoreNum}
        awayScoreNum={awayScoreNum}
        start={start}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    flex: 1,
    borderRadius: 5,
    paddingVertical: 15,
    marginHorizontal: 10,
    marginTop: 5,
  },
  time: {
    alignItems: 'center',
    width: 100,
    justifyContent: 'center',
    gap: 5,
    margin: 5,
    borderLeftWidth: 1,
    borderColor: colors.border
  },
  teams: {
    flex: 1,
    paddingHorizontal: 10
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  teamRow: {
    alignItems: 'center',
    paddingVertical: 3,
    paddingLeft: 7,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  date: {
    color: colors.text,
    fontSize: 14,
  },
  teamName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 500
  },
  score: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 700,
  },
});

export default memo(Game);