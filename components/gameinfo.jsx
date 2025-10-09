import { Modal, Text, View, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { SvgUri } from "react-native-svg";
import { useEffect, useState } from "react";

export default function GameInfo({ game, visible = true, onClose, dateLabel, timeLabel }) {
  const [loading, setLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState({});

  const fetchGame = async () => {
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game.id}/landing`);
      const data = await response.json();
      setGameInfo(data);
    } catch (e) {
      console.error("Error fetching game", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=> {
    if (game) {
      fetchGame();
    }
  }, [game])

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
              {
                game?.gameType === 1 ? 'PRESEASON' 
                : game?.gameType === 2 ? 'REGULAR SEASON' 
                : `GAME ${game?.seriesStatus?.gameNumberOfSeries} (${game?.seriesStatus?.topSeedTeamAbbrev} ${game?.seriesStatus?.topSeedWins} - ${game?.seriesStatus?.bottomSeedTeamAbbrev} ${game?.seriesStatus?.bottomSeedWins})` 
              }
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
              <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={s.teamsRow}>
            <View style={s.teamCol}>
              <SvgUri width={70} height={70} uri={game?.homeTeam?.darkLogo} />
              <Text style={s.teamName}>{game?.homeTeam?.commonName?.default}</Text>
            </View>
            <View style={s.centerCol}>
              <Text style={s.dateLabel}>{dateLabel}</Text>
              <Text style={[
                s.stateLabel,
                game.gameState === 'LIVE' && s.liveLabel
              ]}>
                {game.gameState === 'FUT' ? timeLabel : `${game?.homeTeam?.score} - ${game?.awayTeam?.score}`}
              </Text>
            </View>
            <View style={s.teamCol}>
              <SvgUri width={70} height={70} uri={game?.awayTeam?.darkLogo} />
              <Text style={s.teamName}>{game?.awayTeam?.commonName?.default}</Text>
            </View>
          </View>
          {game.gameState != 'FUT' ? (
            <>
              <View style={s.statsRow}>
                <Text style={s.statsText}>{gameInfo?.homeTeam?.sog}</Text>
                <Text style={s.dateLabel}>SOG</Text>
                <Text style={s.statsText}>{gameInfo?.awayTeam?.sog}</Text>
              </View>
              <ScrollView style={s.list}>
                {gameInfo.summary?.scoring?.map((period, i) => (
                  <View key={i} style={s.period}>
                    <Text style={s.periodHead}>
                      {period.periodDescriptor?.number < 4 ? `PERIOD ${period.periodDescriptor?.number}` : period.periodDescriptor?.periodType}
                    </Text>
                      {period.goals.map((goal, j) => (
                        <View key={j} style={{flexDirection: goal.isHome ? 'row' : 'row-reverse', gap: 20, alignItems: 'center', paddingVertical: 20}}>
                          <Text style={s.score}>
                            {goal.homeScore} - {goal.awayScore}
                          </Text>
                          <View style={{alignItems: goal.isHome ? 'flex-start' : 'flex-end'}}>
                            <Text style={s.scorer}>
                              {goal.name?.default} ({goal.goalsToDate})
                            </Text>
                            {(() => {
                              const assists = (goal.assists ?? []).map(a => {
                                return `${a.name.default} (${a.assistsToDate})`;
                              });
                              if (assists.length === 0) return null;
                              return <Text style={s.assists}>{assists.join(', ')}</Text>;
                            })()}
                          </View>
                        </View>
                      ))}
                  </View>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={s.statsRow}>
                <Text style={s.statsText}>{gameInfo?.homeTeam?.record}</Text>
                <Text style={s.dateLabel}>record</Text>
                <Text style={s.statsText}>{gameInfo?.awayTeam?.record}</Text>
              </View>
              <ScrollView style={s.list}>
              {gameInfo.matchup?.skaterComparison?.leaders?.map((category, i) => (
                <View key={i} style={s.period}>
                  <Text style={s.periodHead}>
                    {category?.category}
                  </Text>

                  <View style={s.leader}>
                    <Image source={{uri: category?.homeLeader?.headshot}} style={s.headshot}/>
                    <View style={s.column}>
                      <Text style={s.scorer}>{category?.homeLeader?.name?.default}</Text>
                      <Text style={s.score}>{category?.homeLeader?.value}</Text>
                    </View>
                  </View>

                </View>
              ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  column: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10
  },
  leader: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headshot: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  score: {
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontWeight: 700,
    borderRadius: 3,
    fontSize: 12
  },
  scorer: {
    color: 'white',
    fontSize: 12,
    fontWeight: 600,
  },
  period: {
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  assists: {
    color: '#b0b0b0',
    fontSize: 12,
    marginTop: 4,
  },
  periodHead: {
    color: '#b0b0b0',
    fontWeight: 700,
    fontSize: 12,
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
  },
  teamsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  teamCol: {
    alignItems: 'center',
    width: '33%',
  },
  teamName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  centerCol: {
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  dateLabel: {
    color: '#b0b0b0',
    textAlign: 'center',
  },
  stateLabel: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    fontWeight: 700
  },
  liveLabel: {
    backgroundColor: '#e62b1e',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  statsText: {
    color: 'white',
    fontWeight: 700,
    fontSize: 18
  },
  list: {
    flex: 1,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#222'
  }
});