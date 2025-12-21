import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgUri } from "react-native-svg";
import { colors } from '../assets/colors';

export default function Game({ game, isFirst }) {
  const [pick, setPick] = useState(null);

  useEffect(() => {
    loadPick();
  }, [game?.id]);

  const loadPick = async () => {
    try {
      const stored = await AsyncStorage.getItem(`pick_${game?.id}`);
      if (stored) {
        setPick(stored);
      }
    } catch (e) {
      console.error("Error loading pick", e);
    }
  };

  const handlePick = (team) => async () => {
    try {
      const teamType = team === game?.homeTeam ? 'home' : 'away';
      await AsyncStorage.setItem(`pick_${game?.id}`, teamType);
      setPick(teamType);
    } catch (e) {
      console.error("Error saving pick", e);
    }
  };

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const timeLabel = isValidStart
    ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const isPlayed = game?.gameState && game.gameState !== 'FUT' && game.gameState !== 'LIVE' && game.gameState !== 'PRE';
  const homeScoreNum = game?.homeTeam?.score;
  const awayScoreNum = game?.awayTeam?.score;

  let homeNameStyle = s.teamName;
  let awayNameStyle = s.teamName;
  let homeScoreStyle = s.score;
  let awayScoreStyle = s.score;

  if (isPlayed && !isNaN(homeScoreNum) && !isNaN(awayScoreNum) && homeScoreNum !== awayScoreNum) {
    const homeIsWinner = homeScoreNum > awayScoreNum;
    homeNameStyle = [s.teamName, { color: homeIsWinner ? colors.text : colors.text2 }];
    awayNameStyle = [s.teamName, { color: homeIsWinner ? colors.text2 : colors.text }];
    homeScoreStyle = [s.score, { color: homeIsWinner ? colors.text : colors.text2 }];
    awayScoreStyle = [s.score, { color: homeIsWinner ? colors.text2 : colors.text }];
  }

  return (
    <View style={[s.container, isFirst && { borderTopWidth: 0 }]}>
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
            <View style={s.svgplace}>
              <SvgUri width={35} height={30} uri={game?.homeTeam?.darkLogo} />
            </View>
            
              <Text style={homeNameStyle}>{game?.homeTeam?.commonName?.default}</Text>
          </View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={35} height={30} uri={game?.awayTeam?.darkLogo} />
            </View>
            
            <Text style={awayNameStyle}>{game?.awayTeam?.commonName?.default }</Text>
            <View>
              <Text style={s.secText}></Text>
            </View>
          </View>
        </View>
        <View style={s.infoCol}>
          {(game?.gameState != "FUT" && game?.gameState != "PRE") && (
            <View style={s.scoreCol}>
              <Text style={homeScoreStyle}>{game?.homeTeam?.score ? game?.homeTeam?.score : 0}</Text>
              <Text style={awayScoreStyle}>{game?.awayTeam?.score ? game?.awayTeam?.score : 0}</Text>
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
    </View>
  );
}

const s = StyleSheet.create({
  pickBtn: {
    paddingHorizontal: 5,
    height: '50%',
    justifyContent: 'center',
    backgroundColor: 'red'
  },
  pickButton: {
    width: 25,
    height: 15,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.grey
  },
  pickButtonActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
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
  svgplace: {
    width: 35,
    height: 30,
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