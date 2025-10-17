import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { Image } from 'expo-image';
import { useState, useEffect } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import { SvgUri } from "react-native-svg";

export default function PlayerModal({ visible, onClose, team }) {
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [schedule, setSchedule] = useState([]);

  const fetchSchedule = async (abbrev) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${abbrev}/now`);
      const data = await response.json();

      setSchedule(data.games);
    } catch (e) {
      console.error('Error fetching schedule: ', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (team?.teamAbbrev?.default) {
      fetchSchedule(team.teamAbbrev.default);
    }
  }, [team]);

  const now = new Date();
  const pastGames = schedule
    ?.filter(game => game.gameState === 'OFF' || game.gameState === 'FINAL')
    .slice(-5)
    .reverse() || [];
  
  const futureGames = schedule
    ?.filter(game => game.gameState === 'FUT' || game.gameState === 'PRE')
    .slice(0, 3) || [];

  const getGameResult = (game) => {
    const isHomeTeam = game.homeTeam.abbrev === team?.teamAbbrev?.default;
    const teamScore = isHomeTeam ? game.homeTeam.score : game.awayTeam.score;
    const opponentScore = isHomeTeam ? game.awayTeam.score : game.homeTeam.score;
    return teamScore > opponentScore ? 'win' : 'loss';
  };

  const getOpponent = (game) => {
    const isHomeTeam = game.homeTeam.abbrev === team?.teamAbbrev?.default;
    return isHomeTeam ? game.awayTeam : game.homeTeam;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'numeric' })
    return `${formatted}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.modalContainer}>
        <View style={s.sheet}>
          <View style={s.headerRow}>
            <Text style={s.headerText}>
              TEAM STATS
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View></View>
          ) : (
            <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
              <View style={s.top}>
                {team?.teamAbbrev?.default && <SvgUri width={70} height={70} uri={`https://assets.nhle.com/logos/nhl/svg/${team.teamAbbrev.default}_dark.svg`}/>}
                <View style={s.topTexts}>
                  <Text style={s.topText}>{team?.teamName?.default}</Text>
                  <Text style={s.secondary}>{team?.divisionName} ({team?.divisionSequence}.)</Text>
                </View>
              </View>

              <View style={s.stats}>
                <View style={s.statRow}>
                  <View style={[s.statBarL, { width: `${100 * team?.goalFor / (team?.goalAgainst + team?.goalFor) - 1}%` }]}>
                    <Text style={s.statTextL}>{team?.goalFor}</Text>
                  </View>
                  <View style={[s.statBarR, { width: `${100 * team?.goalAgainst / (team?.goalAgainst + team?.goalFor) - 1}%` }]}>
                    <Text style={s.statTextR}>{team?.goalAgainst}</Text>
                  </View>
                </View>
                <View style={s.statHead}>
                  <Text style={s.statHeadText}>GOALS FOR</Text>
                  <Text style={s.statHeadText}>GOALS AGAINST</Text>
                </View>

                <View style={s.statRow}>
                  <View style={[s.statBarL, { width: `${100 * team?.wins / (team?.wins + team?.losses) - 1}%` }]}>
                    <Text style={s.statTextL}>{team?.wins}</Text>
                  </View>
                  <View style={[s.statBarR, { width: `${100 * team?.losses / (team?.wins + team?.losses) - 1}%` }]}>
                    <Text style={s.statTextR}>{team?.losses}</Text>
                  </View>
                </View>
                <View style={s.statHead}>
                  <Text style={s.statHeadText}>WINS</Text>
                  <Text style={s.statHeadText}>LOSSES</Text>
                </View>
              </View>

              <View style={s.gamesContainer}>
                <Text style={s.sectionHeader}>PAST GAMES</Text>
                <View style={s.pastGamesRow}>
                  {pastGames.map((game, index) => {
                    const result = getGameResult(game);
                    const opponent = getOpponent(game);
                    return (
                      <View 
                        key={index} 
                        style={[s.pastGameBox, result === 'win' ? s.winBox : s.lossBox]}
                      >
                        <Text style={s.pastGameText}>{opponent.abbrev}</Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={[s.sectionHeader, { marginTop: 20 }]}>FUTURE GAMES</Text>
                <View style={s.futureGamesColumn}>
                  {futureGames.map((game, index) => {
                    const opponent = getOpponent(game);
                    return (
                      <View key={index} style={s.futureGameRow}>
                        <View style={s.futLeft}>
                          <SvgUri 
                            width={30} 
                            height={30} 
                            uri={`https://assets.nhle.com/logos/nhl/svg/${opponent.abbrev}_dark.svg`}
                          />
                          <Text style={s.futureGameTeam}>{opponent.abbrev}</Text>
                        </View>
                        <Text style={s.futureGameDate}>{formatDate(game.gameDate)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={{height: 50}}/>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  futureGameTeam: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  futureGameDate: {
    color: '#b0b0b0',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 60,
  },
  futLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  futureGameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
  futureGamesColumn: {
    marginTop: 10,
  },
  pastGameText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  pastGameBox: {
    paddingVertical: 8,
    borderRadius: 6,
    width: '18%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winBox: {
    backgroundColor: '#176f1a',
  },
  lossBox: {
    backgroundColor: '#7f1a1a',
  },
  pastGamesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sectionHeader: {
    color: '#b0b0b0',
    fontSize: 12,
    fontWeight: 600,
    paddingBottom: 10,
  },
  gamesContainer: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222'
  },
  statHeadText: {
    color: '#b0b0b0',
    fontSize: 12,
    paddingTop: 10,
    paddingHorizontal: 5,
    paddingBottom: 30,
  },
  statHead: {
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  statBarL: {
    minWidth: '19%',
    maxWidth: '79%',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 15,
    backgroundColor: "#333",
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10
  },
  statTextL: {
    fontSize: 14,
    color: 'white',
    fontWeight: 600,
  },
  statTextR: {
    fontSize: 14,
    color: 'white',
    fontWeight: 600,
    textAlign: 'right'
  },
  statBarR: {
    minWidth: '19%',
    maxWidth: '79%',
    justifyContent: 'center',
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: 15,
    backgroundColor: "#222",
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stats: {
    marginTop: 20,
    paddingVertical: 15,
  },
  secondary: {
    color: "#b0b0b0",
    fontWeight: 600
  },
  top: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  topTexts: {
    gap: 5,
  },
  topText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 700
  },
  body: {
    flex: 1,
    padding: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch'
  },
  sheet: {
    backgroundColor: '#111',
    width: '100%',
    height: '90%',
    borderTopWidth: 1,
    borderColor: '#222',
  },
  headerRow: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    paddingLeft: 15,
    fontSize: 14,
    fontWeight: 700,
    color: '#b0b0b0',
  },
  closeBtn: {
    padding: 15,
  }
});
