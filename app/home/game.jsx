import { memo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../../components/colors';
import GameStory from './gamestory';
import TeamLogo from '../../components/teamLogo';

function Game({ game }) {
  
  const [gameVisible, setGameVisible] = useState(false);

  const isPlayed = game?.gameState && game.gameState !== 'FUT' && game.gameState !== 'LIVE' && game.gameState !== 'PRE';
  const isLive = game?.gameState == 'LIVE';
  const isFut = !isPlayed && !isLive

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const timeLabel = isValidStart
    ? start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  const dateLabel = isValidStart
    ? start.toLocaleDateString(undefined, { weekday: "short", day: 'numeric', month: 'numeric' })
    : '';

  let homeIsWinner = undefined;
  isPlayed && homeIsWinner == game?.homeTeam?.score > game?.awayTeam?.score

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setGameVisible(true)} style={s.container}>

        <View style={s.teams}>
          <View style={s.teamRow}>
            <View style={s.teamLeft}>
               <TeamLogo abbrev={game?.homeTeam?.abbrev} size={32}/>          
               <Text style={s.teamName}>{game?.homeTeam?.commonName.default}</Text>          
            </View>

            {!isFut && <Text style={s.score}>{game?.homeTeam?.score}</Text>}
          </View>

          <View style={s.teamRow}>
            <View style={s.teamLeft}>
               <TeamLogo abbrev={game?.awayTeam?.abbrev} size={32}/>
               <Text style={s.teamName}>{game?.awayTeam?.commonName.default}</Text>
            </View>

            {!isFut && <Text style={s.score}>{game?.awayTeam?.score}</Text>}
          </View>
        </View>

        <View style={s.teamRight}>
          {isFut && <Text style={s.time}>{timeLabel}</Text>}
          <Text style={s.label}>
            {isLive ? 'LIVE' 
              : isPlayed ? game.gameOutcome.lastPeriodType
              : dateLabel
            }
          </Text>
        </View>

      </TouchableOpacity>

      <GameStory 
        visible={gameVisible}
        game={game}
        onClose={() => setGameVisible(false)}
        id={game.id}
        timeLabel={timeLabel}
        isPlayed={isPlayed} 
        start={start}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 18,
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  teams: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 20,
    gap: 6,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  teamLeft: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  teamName: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text
  },
  score: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.text
  },
  teamRight: {
    width: 100,
    height: '100%',
    borderLeftWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center'
  },
  label: {
    color: colors.text2,
  },
  time: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 700
  }
});

export default memo(Game);