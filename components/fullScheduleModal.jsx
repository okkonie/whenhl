import { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from '../assets/colors';
import CustomModal from './customModal';

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
    <CustomModal
      visible={visible}
      transparent={true}
      onClose={onClose}
      loading={false}
      title="Full Schedule"
    >
      <ScrollView style={s.content} contentContainerStyle={{paddingBottom: 20}} showsVerticalScrollIndicator={false}>
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
    </CustomModal>
  );
}

const s = StyleSheet.create({
  fullSectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 500,
    paddingTop: 20,
    marginLeft: 10,
    marginBottom: 10,
  },
  content: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  fullScheduleGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 15,
  },
  upcomingGrid: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
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
    paddingHorizontal: 5,
    marginHorizontal: 15,
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
  fullGameDate: {
    color: colors.text2,
    fontWeight: 500,
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
