import AsyncStorage from '@react-native-async-storage/async-storage';
import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../assets/colors';
import TeamLogo from './teamLogo';
import GameStory from './gamestory';

function Game({ game, isFirst }) {
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
      <TouchableOpacity activeOpacity={0.8} onPress={() => setGameVisible(true)} style={[s.container, isFirst && { borderTopWidth: 0 }]}>
        <View style={s.top}>
          <Text style={s.time}>
            {
              (game?.gameState == "FUT" || game?.gameState == "PRE") ? timeLabel 
              : game.gameState == "LIVE" ? "LIVE" 
              : game?.gameOutcome && game?.gameOutcome.lastPeriodType
            }
          </Text>
        </View>
        <View style={s.body}>
          <View>
            <View style={s.teamRow}>
              <TeamLogo abbrev={game?.homeTeam?.abbrev} width={35} height={30} />
              
                <Text style={homeNameStyle}>{game?.homeTeam?.commonName?.default}</Text>
            </View>
            <View style={s.teamRow}>
              <TeamLogo abbrev={game?.awayTeam?.abbrev} width={35} height={30} />
              
              <Text style={awayNameStyle}>{game?.awayTeam?.commonName?.default }</Text>
              <View>
                <Text style={s.secText}></Text>
              </View>
            </View>
          </View>
          <View style={s.infoCol}>
            {(game?.gameState != "FUT" && game?.gameState != "PRE") && (
              <View style={s.scoreCol}>
                <View style={s.scoreRow}>
                  {pickResult && pick === 'home' && (
                    <View style={[s.resultDot, pickResult === 'correct' ? s.correctDot : s.wrongDot]} />
                  )}
                  <Text style={homeScoreStyle}>{game?.homeTeam?.score ? game?.homeTeam?.score : 0}</Text>
                </View>
                <View style={s.scoreRow}>
                  {pickResult && pick === 'away' && (
                    <View style={[s.resultDot, pickResult === 'correct' ? s.correctDot : s.wrongDot]} />
                  )}
                  <Text style={awayScoreStyle}>{game?.awayTeam?.score ? game?.awayTeam?.score : 0}</Text>
                </View>
              </View>
            )}

            {(game?.gameState == "FUT" || game?.gameState == "PRE") && (
              <View style={s.scoreCol}>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={s.pickBtn}
                  onPress={handlePick(game.homeTeam)}
                >
                  <View style={[s.pickButton, pick === 'home' && s.pickButtonActive]}/>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={s.pickBtn}
                  onPress={handlePick(game.awayTeam)}
                >
                  <View style={[s.pickButton, pick === 'away' && s.pickButtonActive]}/>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  pickBtn: {
    paddingRight: 5,
    paddingLeft: 15,
    height: '50%',
    justifyContent: 'center',
  },
  pickButton: {
    width: 15,
    height: 15,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.grey
  },
  pickButtonActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  correctDot: {
    backgroundColor: colors.green,
  },
  wrongDot: {
    backgroundColor: colors.red,
  },
  container: {
    paddingVertical: 14,
    borderTopWidth: 1,
    marginHorizontal: 20,
    borderColor: colors.border,
    flexDirection: 'row'
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamName: {
    color: colors.text,
    fontSize: 13,
  },
  score: {
    color: colors.text,
    fontWeight: 500,
    fontSize: 16,
  },
  scoreCol: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'flex-end'
  }, 
  infoCol: {
    paddingRight: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  time: {
    fontWeight: 500,
    color: colors.text
  },
  top: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: 70,
  }
});

export default memo(Game);