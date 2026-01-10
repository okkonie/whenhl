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
          <TouchableOpacity style={s.teamRow} activeOpacity={0.8} disabled={isPlayed}>
            <TeamLogo abbrev={game?.homeTeam?.abbrev} />
            <Text style={s.teamName}>{game?.homeTeam?.commonName.default}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.teamRow} activeOpacity={0.8} disabled={isPlayed}>
            <TeamLogo abbrev={game?.awayTeam?.abbrev} />
            <Text style={s.teamName}>{game?.awayTeam?.commonName.default}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.time}>
          <Text style={s.label}>{timeLabel} {dateLabel}</Text>
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginTop: 5,
  },
  time: {
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'center',
    gap: 5,
    padding: 5,
  },
  teams: {
    flex: 1,
  },
  teamRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 500,
    backgroundColor: colors.highlight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  date: {
    color: colors.text2,
    fontSize: 12,
  },
  teamName: {
    color: colors.text,
    fontSize: 14,
  }
});

export default memo(Game);