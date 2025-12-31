import { Octicons } from '@expo/vector-icons';
import { memo, useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';

const CompletedGame = memo(({ opponent, won }) => (
  <View style={s.fullGameBox}>
    <Text style={s.fullGameOpponent}>{opponent}</Text>
    <View style={won ? s.winIndicator : s.lossIndicator} />
  </View>
));

const UpcomingGame = memo(({ opponent, dateStr, isLast }) => (
  <View style={[s.fullFutGameBox, !isLast && s.gameBorder]}>
    <Text style={s.opponentName}>{opponent}</Text>
    <Text style={s.fullGameDate}>{dateStr}</Text>
  </View>
));

export default function FullScheduleModal({ visible, onClose, schedule, item, getGameResult }) {
  const { completedGames, upcomingGames } = useMemo(() => {
    const completed = schedule.allGames
      .filter(g => g.gameState === 'OFF' || g.gameState === 'FINAL')
      .map((game, idx) => {
        const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
        const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
        const result = getGameResult(game);
        return { id: `completed-${idx}`, opponent, won: result.won };
      });

    const upcoming = schedule.allGames
      .filter(g => g.gameState === 'FUT')
      .map((game, idx, arr) => {
        const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
        const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev
        const date = new Date(game.startTimeUTC);
        const dateStr = date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', });
        return { id: `upcoming-${idx}`, opponent, dateStr, isLast: idx === arr.length - 1 };
      });
    
    return { completedGames: completed, upcomingGames: upcoming };
  }, [schedule.allGames, item.teamAbbrev.default, getGameResult]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.modalContainer, s.overlayBg]}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Full Schedule</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Octicons name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          {completedGames.length > 0 && (
            <View style={s.fullSection}>
              <Text style={s.fullSectionTitle}>Completed Games</Text>
              <View style={s.fullScheduleGrid}>
                {completedGames.map(game => (
                  <CompletedGame key={game.id} opponent={game.opponent} won={game.won} />
                ))}
              </View>
            </View>
          )}
          
          {upcomingGames.length > 0 && (
            <View style={s.fullSection}>
              <Text style={s.fullSectionTitle}>Upcoming Games</Text>
              <View style={s.upcomingGrid}>
                {upcomingGames.map(game => (
                  <UpcomingGame key={game.id} opponent={game.opponent} dateStr={game.dateStr} isLast={game.isLast} />
                ))}
              </View>
            </View>
          )}
          
          {schedule.allGames.length === 0 && (
            <Text style={s.emptyText}>No schedule available.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
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
  fullSection: {
    marginBottom: 20,
  },
  fullSectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 500,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  fullScheduleGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    paddingVertical: 10,
    borderRadius: 15,
  },
  upcomingGrid: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 15,
  },
  fullGameBox: {
    borderRadius: 8,
    alignItems: 'center',
    width: `${100 / 6}%`,
    padding: 8,
    gap: 2,
  },
  fullFutGameBox: {
    gap: 3,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 10,
  },
  gameBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  opponentName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  fullGameOpponent: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  fullGameTime: {
    color: colors.text2,
    fontSize: 12,
  },
  fullGameDate: {
    color: colors.text2,
    fontSize: 12,
  },
  emptyText: {
    color: colors.text2,
    textAlign: 'center',
    paddingVertical: 10,
  },
  winIndicator: {
    backgroundColor: colors.green,
    width: '20%',
    height: 2,
  },
  lossIndicator: {
    backgroundColor: colors.red,
    width: '20%',
    height: 2,
  },
});
