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
    ? start.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })
    : '';

  const isPlayed = game?.gameState && game.gameState !== 'FUT' && game.gameState !== 'LIVE' && game.gameState !== 'PRE';
  const homeScoreNum = game?.homeTeam?.score;
  const awayScoreNum = game?.awayTeam?.score;

  let homeNameStyle = s.teamName;
  let awayNameStyle = s.teamName;
  let homeScoreStyle = s.score;
  let awayScoreStyle = s.score;

  let pickResult = null; // 'correct' or 'wrong'
  if (isPlayed && !isNaN(homeScoreNum) && !isNaN(awayScoreNum) && homeScoreNum !== awayScoreNum) {
    const homeIsWinner = homeScoreNum > awayScoreNum;
    homeNameStyle = [s.teamName, { color: homeIsWinner ? colors.text : colors.text2 }];
    awayNameStyle = [s.teamName, { color: homeIsWinner ? colors.text2 : colors.text }];
    homeScoreStyle = [s.score, { color: homeIsWinner ? colors.text : colors.text2 }];
    awayScoreStyle = [s.score, { color: homeIsWinner ? colors.text2 : colors.text }];

    // Check if pick was correct
    if (pick) {
      const pickedHome = pick === 'home';
      pickResult = (pickedHome === homeIsWinner) ? 'correct' : 'wrong';
    }
  }

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setGameVisible(true)} style={s.container}>
        <View style={s.time}>
          <Text style={s.timeLabel}>{dateLabel}</Text>
          <Text style={s.timeLabel}>{timeLabel}</Text>
        </View>

        <TouchableOpacity style={s.teamRow}>
          <TeamLogo abbrev={game?.homeTeam?.abbrev} />
          <Text style={s.teamName}>{game?.homeTeam?.abbrev}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.teamRow}>
          <TeamLogo abbrev={game?.awayTeam?.abbrev} />
          <Text style={s.teamName}>{game?.awayTeam?.abbrev}</Text>
        </TouchableOpacity>

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
    flexDirection: 'column',
    flex: 1,
    borderRadius: 2,
    padding: 5,
  },
  time: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  teamRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  timeLabel: {
    color: colors.text2,
    fontSize: 12,
  },
  teamName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 500
  }
});

export default memo(Game);