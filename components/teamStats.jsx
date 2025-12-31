import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import FullScheduleModal from './fullScheduleModal';
import Loader from './loader';
import RosterModal from './rosterModal';
import TeamLogo from './teamLogo';

export default function TeamStats({ visible, logo, item, onClose }) {
  const [schedule, setSchedule] = useState({ recentGames: [], upcomingGames: [], allGames: [] });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
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

  const getGameResult = (game) => {
    const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
    const teamScore = isHome ? game.homeTeam.score : game.awayTeam.score;
    const oppScore = isHome ? game.awayTeam.score : game.homeTeam.score;
    const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
    const won = teamScore > oppScore;
    
    return { opponent, won, isHome };
  };

  const StatItem = ({head, value}) => {
    return (
      <View style={s.statItem}>
        <Text style={s.statHead}>{head}</Text>
        <Text style={s.statValue}>{value}</Text>
      </View>
    )
  }

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
              <View style={s.teamInfo}>
                <Text style={s.teamHeaderName}>{item?.teamName?.default}</Text>
              </View>
            </View>

            <Text style={s.sectionTitle}>Stats</Text>
            <View style={s.statRow}>
              <StatItem
                head="Goals For"
                value={item?.goalFor}
              />
              <StatItem
                head="Goals Against"
                value={item?.goalAgainst}
              />
              <StatItem
                head="Win Pctg"
                value={`${(item?.winPctg * 100).toFixed(2)}%`}
              />
              <StatItem
                head="Rec"
                value={`${item?.wins}-${item?.losses}-${item?.otLosses}`}
              />
              <StatItem
                head="Home Rec"
                value={`${item?.homeWins}-${item?.homeLosses}-${item?.homeOtLosses}`}
              />
              <StatItem
                head="Road Rec"
                value={`${item?.roadWins}-${item?.roadLosses}-${item?.roadOtLosses}`}
              />
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
                          <Text style={s.gameTime}>
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
                <Text style={s.btnText}>View Full Schedule</Text>
              </TouchableOpacity>
            </View>

            
            <TouchableOpacity style={s.rosterBtn} onPress={() => setShowRosterModal(true)} activeOpacity={0.85}>
              <View style={s.rosterBtnLeft}>
                <View style={s.rosterIconBg}>
                  <Octicons name="people" color={colors.text} size={18}/>
                </View>
                <View>
                  <Text style={s.rosterBtnTitle}>Roster</Text>
                  <Text style={s.rosterBtnSubtitle}>View all players</Text>
                </View>
              </View>
              <Octicons name="chevron-right" color={colors.text2} size={20}/>
            </TouchableOpacity>

            <View style={{height: 20}}/>
          </ScrollView>
        )}
      </SafeAreaView>

      <FullScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        schedule={schedule}
        item={item}
        getGameResult={getGameResult}
        loading={loading}
      />

      <RosterModal
        visible={showRosterModal}
        onClose={() => setShowRosterModal(false)}
        teamAbbrev={item?.teamAbbrev?.default}
      />
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
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: 'center',
  },
  btnText: {
    color: colors.text,
    fontWeight: 500,
  },
  rosterBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginTop: 10,
  },
  rosterBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rosterIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterBtnTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  rosterBtnSubtitle: {
    color: colors.text2,
    fontSize: 12,
    marginTop: 2,
  },
  teamInfo: {
    flex: 1,
  },
  teamRecord: {
    color: colors.text2,
    fontSize: 14,
    marginTop: 4,
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
    paddingVertical: 20
  },
  gameBox: {
    borderRadius: 8,
    gap: 2,
    alignItems: 'center',
    width: '15%'
  },
  upcomingGameBox: {
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
    fontWeight: 500
  },
  gameTime: {
    color: colors.text,
    fontSize: 12,
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    borderRadius: 15,
    paddingVertical: 10
  },
  statItem: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    width: '33%',
  },
  statHead: {
    color: colors.text2,
    fontSize: 12,
  },
  statValue: {
    color: colors.text,
    fontWeight: 500,
    fontSize: 16
  }
});
