import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgUri } from "react-native-svg";

export default function Game({ game }) {
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
    homeNameStyle = [s.teamName, { color: homeIsWinner ? '#eee' : '#999' }];
    awayNameStyle = [s.teamName, { color: homeIsWinner ? '#999' : '#eee' }];
    homeScoreStyle = [s.score, { color: homeIsWinner ? '#eee' : '#999' }];
    awayScoreStyle = [s.score, { color: homeIsWinner ? '#999' : '#eee' }];
  }

  return (
    <View style={s.container}>
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
              <SvgUri width={40} height={35} uri={game?.homeTeam?.darkLogo} />
            </View>
            
              <Text style={homeNameStyle}>{game?.homeTeam?.commonName?.default}</Text>
          </View>
          <View style={s.teamRow}>
            <View style={s.svgplace}>
              <SvgUri width={40} height={35} uri={game?.awayTeam?.darkLogo} />
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
                style={[s.pickButton, pick === 'home' && s.pickButtonActive]}
                onPress={handlePick(game.homeTeam)}
              >

              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={[s.pickButton, pick === 'away' && s.pickButtonActive]}
                onPress={handlePick(game.awayTeam)}
              >

              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pickButton: {
    width: 15,
    height: 15,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#777"
  },
  pickButtonActive: {
    backgroundColor: "#fff",
    borderColor: "#fff"
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 3,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#171717',
    flexDirection: 'row'
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: 10,
  },
  svgplace: {
    width: 40,
    height: 35,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamName: {
    color: "#eee",
    fontSize: 13,
  },
  score: {
    color: 'white',
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
    color: "white"
  },
  top: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: 80,
  }
});