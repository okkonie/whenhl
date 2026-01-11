import AsyncStorage from '@react-native-async-storage/async-storage';
import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../assets/colors';
import GameStory from './gamestory';
import TeamLogo from './teamLogo';

function Game({ game }) {
  const [pick, setPick] = useState(null);
  const [gameVisible, setGameVisible] = useState(false);

  useEffect(() => {
    loadPick();
  }, [game?.id]);

  const loadPick = async () => {
    try {
      const stored = await AsyncStorage.getItem(`pick_${game?.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPick(parsed.pick);
      }
    } catch (e) {
      console.error("Error loading pick", e);
    }
  };

  const handlePick = (team) => async () => {
    try {
      const teamType = team === game?.homeTeam ? 'home' : 'away';
      const pickData = { pick: teamType, timestamp: Date.now() };
      await AsyncStorage.setItem(`pick_${game?.id}`, JSON.stringify(pickData));
      setPick(teamType);
    } catch (e) {
      console.error("Error saving pick", e);
    }
  };

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const timeLabel = isValidStart
    ? start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  const dateLabel = isValidStart
    ? start.toLocaleDateString(undefined, { weekday: "short", day: 'numeric', month: 'numeric' })
    : '';

  const isPlayed = game?.gameState && game.gameState !== 'FUT' && game.gameState !== 'LIVE' && game.gameState !== 'PRE';
  const homeScoreNum = game?.homeTeam?.score;
  const awayScoreNum = game?.awayTeam?.score;

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setGameVisible(true)} style={s.container}>
        <View style={s.teams}>
          <TouchableOpacity style={s.teamRow} activeOpacity={0.8} disabled={(isPlayed || game.gameState == 'LIVE')} onPress={() => handlePick(game?.homeTeam)}>
            <View style={s.teamLeft}>
              <TeamLogo abbrev={game?.homeTeam?.abbrev} />
              <Text style={s.teamName}>{game?.homeTeam?.commonName.default}</Text>
            </View>
            {(isPlayed || game.gameState == 'LIVE') && <Text style={s.score}>{game?.homeTeam?.score}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.teamRow} activeOpacity={0.8} disabled={isPlayed} onPress={() => handlePick(game?.awayTeam)}>
            <View style={s.teamLeft}>
              <TeamLogo abbrev={game?.awayTeam?.abbrev} />
              <Text style={s.teamName}>{game?.awayTeam?.commonName.default}</Text>
            </View>
            {(isPlayed || game.gameState == 'LIVE') && <Text style={s.score}>{game?.awayTeam?.score}</Text>}
          </TouchableOpacity>
        </View>

        <View style={s.time}>
          <Text style={s.date}>{dateLabel}</Text>
          <Text style={s.date}>{timeLabel}</Text>
        </View>

      </TouchableOpacity>
      <GameStory 
        visible={gameVisible} 
        game={game} 
        id={game.id} 
        onClose={() => setGameVisible(false)} 
        timeLabel={timeLabel} 
        isPlayed={isPlayed} 
        homeScoreNum={homeScoreNum} 
        awayScoreNum={awayScoreNum}
        start={start}
        handlePick={handlePick}
        pick={pick}
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
    paddingVertical: 10,
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
    paddingHorizontal: 15
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  teamRow: {
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  date: {
    color: colors.text,
    fontSize: 13,
  },
  teamName: {
    color: colors.text,
    fontSize: 14,
  },
  score: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 600,
  }
});

export default memo(Game);