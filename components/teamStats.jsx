import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import Loader from './loader';
import StatBar from './statBar';
import TeamLogo from './teamLogo';

export default function TeamStats({ visible, logo, item, onClose }) {
  const [schedule, setSchedule] = useState({ recentGames: [], upcomingGames: [], allGames: [] });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && item?.teamAbbrev?.default) {
      fetch(`https://api-web.nhle.com/v1/club-schedule-season/${item.teamAbbrev.default}/now`)
        .then(res => res.json())
        .then(data => {
          const games = data.games || [];
          const now = new Date();
          
          const completed = games
            .filter(g => g.gameState === 'OFF' || g.gameState === 'FINAL')
            .slice(-6);
          
          const upcoming = games
            .filter(g => g.gameState === 'FUT' && new Date(g.startTimeUTC) > now)
            .slice(0, 3);
          
          setSchedule({ recentGames: completed, upcomingGames: upcoming, allGames: games });
        })
        .catch(err => console.error('Error fetching schedule:', err))
        .finally(() => setLoading(false));
    }
  }, [visible, item?.teamAbbrev?.default]);

  useEffect(() => {
    if (showRosterModal && item?.teamAbbrev?.default) {
      setRosterLoading(true);
      setRosterError(null);

      fetch(`https://api-web.nhle.com/v1/roster/${item.teamAbbrev.default}/current`)
        .then(res => res.json())
        .then(data => {
          const forwards = data?.forwards || [];
          const defensemen = data?.defensemen || [];
          const goalies = data?.goalies || [];

          const normalize = (player, positionLabel) => ({
            id: player?.id || `${player?.firstName?.default}-${player?.lastName?.default}-${player?.sweaterNumber}`,
            first: player?.firstName?.default || '',
            last: player?.lastName?.default || '',
            number: player?.sweaterNumber || '-',
            position: player?.positionCode || positionLabel,
          });

          const combined = [
            ...forwards.map(p => normalize(p, 'F')),
            ...defensemen.map(p => normalize(p, 'D')),
            ...goalies.map(p => normalize(p, 'G')),
          ];

          setRoster(combined);
        })
        .catch(err => {
          console.error('Error fetching roster:', err);
          setRosterError('Could not load roster right now.');
        })
        .finally(() => setRosterLoading(false));
    }
  }, [showRosterModal, item?.teamAbbrev?.default]);

  const getGameResult = (game) => {
    const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
    const teamScore = isHome ? game.homeTeam.score : game.awayTeam.score;
    const oppScore = isHome ? game.awayTeam.score : game.homeTeam.score;
    const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
    const won = teamScore > oppScore;
    
    return { opponent, won, isHome };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.modalContainer}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Team Details</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Octicons name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        {loading ? <Loader /> : (
          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            <View style={s.teamHeader}>
              {logo}
              <View>
                <Text style={s.teamHeaderName}>{item?.teamName?.default}</Text>
                <Text style={s.teamScore}>{item?.wins}-{item?.losses}-{item?.otLosses}</Text>
              </View>
            </View>
            <View style={s.actionsRow}>
            </View>

            <Text style={s.sectionTitle}>Schedule</Text>
            <View style={s.scheduleSection}>
              {schedule.recentGames.length > 0 && (
                <View style={[s.gamesSection, {borderBottomWidth: 1, borderColor: colors.border}]}>
                  <Text style={s.gamesTitle}>Recently played</Text>
                  <View style={s.gamesRow}>
                    {schedule.recentGames.map((game, idx) => {
                      const result = getGameResult(game);
                      return (
                        <View 
                          key={idx} 
                          style={s.gameBox}
                        >
                          <Text style={s.gameOpponent}>{result.opponent}</Text>
                          <View style={{ backgroundColor: result.won ? colors.green : colors.red, width: '20%', height: 2 }}/>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {schedule.upcomingGames.length > 0 && (
                <View style={s.gamesSection}>
                  <Text style={s.gamesTitle}>Upcoming</Text>
                  <View style={s.gamesRow}>
                    {schedule.upcomingGames.map((game, idx) => {
                      const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
                      const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
                      const date = new Date(game.startTimeUTC);
                      
                      return (
                        <View key={idx} style={s.upcomingGameBox}>
                          <TeamLogo abbrev={opponent} width={40} height={30} />
                          <Text style={s.gameDate}>
                            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </Text>
                          <Text style={s.gameTime}>
                            {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
              <TouchableOpacity style={s.scheduleBtn} onPress={() => setShowScheduleModal(true)} activeOpacity={0.85}>
                <Octicons name="calendar" color={colors.text} size={16} />
                <Text style={s.scheduleBtnText}>View Full Schedule</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>Stats</Text>
            <View style={s.statRow}>
              <StatBar
                label="Goals For"
                value={item?.goalFor}
                valueOf={item?.goalFor + item?.goalAgainst}
              />
              <StatBar
                label="Home Wins"
                value={item?.homeWins}
                valueOf={item?.homeWins + item?.homeLosses + item?.homeOtLosses}
              />
              <StatBar
                label="Road Wins"
                value={item?.roadWins}
                valueOf={item?.roadWins + item?.roadLosses + item?.roadOtLosses}
              />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <SafeAreaView style={[s.modalContainer, s.overlayBg]}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Full Schedule</Text>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)} style={s.btn}>
              <Octicons name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            {schedule.allGames.map((game, idx) => {
              const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
              const opponent = isHome ? game.awayTeam : game.homeTeam;
              const date = new Date(game.startTimeUTC);
              const status = game.gameState === 'FUT' ? 'Scheduled' : game.gameState;
              const result = getGameResult(game);
              const isComplete = game.gameState === 'OFF' || game.gameState === 'FINAL';
              const rowStyle = isComplete ? (result.won ? s.winCard : s.lossCard) : s.neutralCard;
              const statusLabel = isComplete ? (result.won ? 'Won' : 'Lost') : status;

              return (
                <View key={idx} style={[s.fullRow, rowStyle]}>
                  <View style={s.fullRowLeft}>
                    <TeamLogo abbrev={opponent?.abbrev} width={50} height={40} />
                    <View>
                      <Text style={s.fullOpponent}>{opponent?.abbrev}</Text>
                      <Text style={s.fullMeta}>{isHome ? 'Home' : 'Away'} • {statusLabel}</Text>
                    </View>
                  </View>
                  <View style={s.fullRowRight}>
                    <Text style={s.fullDate}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
                    <Text style={s.fullTime}>{date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
                  </View>
                </View>
              );
            })}
            {schedule.allGames.length === 0 && (
              <Text style={s.emptyText}>No schedule available.</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showRosterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRosterModal(false)}
      >
        <SafeAreaView style={[s.modalContainer, s.overlayBg]}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Roster</Text>
            <TouchableOpacity onPress={() => setShowRosterModal(false)} style={s.btn}>
              <Octicons name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            {rosterLoading && (
              <View style={s.loadingRow}>
                <ActivityIndicator color={colors.text} />
                <Text style={s.loadingText}>Loading roster...</Text>
              </View>
            )}
            {rosterError && <Text style={s.errorText}>{rosterError}</Text>}
            {!rosterLoading && !rosterError && roster.map(player => (
              <View key={player.id} style={s.playerRow}>
                <View style={s.playerBadge}>
                  <Text style={s.playerNumber}>{player.number}</Text>
                </View>
                <View style={s.playerInfo}>
                  <Text style={s.playerName}>{player.first} {player.last}</Text>
                  <Text style={s.playerMeta}>{player.position}</Text>
                </View>
              </View>
            ))}
            {!rosterLoading && !rosterError && roster.length === 0 && (
              <Text style={s.emptyText}>No roster found.</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    width: '100%',
    height: '97%',
    bottom: 0,
    backgroundColor: colors.background,
    borderRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    paddingLeft: 10,
    paddingTop: 15,
    paddingBottom: 5,
  },
  scheduleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  scheduleBtnText: {
    color: colors.text,
    fontWeight: 500,
  },
  rosterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  rosterBtnText: {
    color: colors.text,
    fontWeight: '700',
  },
  scheduleSection: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 10
  },
  gamesTitle: {
    color: colors.text2,
    fontWeight: 500,
    paddingTop: 10,
    paddingLeft: 10
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameBox: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    width: '15%'
  },
  upcomingGameBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.card,
    width: '32%',
    gap: 4,
  },
  gameOpponent: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 700
  },
  gameLocation: {
    color: colors.text2,
    fontSize: 12,
    fontWeight: '600',
  },
  gameDate: {
    color: colors.text2,
    fontSize: 12,
    marginTop: 2,
  },
  gameTime: {
    color: colors.text2,
    fontSize: 12,
    color: colors.text2,
  },
  overlayBg: {
    backgroundColor: colors.background,
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  teamHeader: {
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
    paddingVertical: 20,
    paddingLeft: 5,
  },
  teamHeaderName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 600
  },
  teamScore: {
    color: colors.text2,
    fontSize: 16,
    fontWeight: 500,
    paddingTop: 4
  },
  fullRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  winCard: {
    backgroundColor: colors.green + '33',
  },
  lossCard: {
    backgroundColor: colors.red + '26',
  },
  neutralCard: {
    backgroundColor: colors.border2,
  },
  fullRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fullRowRight: {
    alignItems: 'flex-end',
  },
  fullOpponent: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  fullMeta: {
    color: colors.text2,
    fontSize: 12,
  },
  fullDate: {
    color: colors.text,
    fontWeight: '700',
  },
  fullTime: {
    color: colors.text2,
    fontSize: 12,
  },
  emptyText: {
    color: colors.text2,
    textAlign: 'center',
    paddingVertical: 10,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: colors.text,
    fontWeight: '600',
  },
  errorText: {
    color: colors.red,
    paddingVertical: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 8,
  },
  playerBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playerNumber: {
    color: colors.text,
    fontWeight: '800',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  playerMeta: {
    color: colors.text2,
    fontSize: 12,
    marginTop: 2,
  },
});
