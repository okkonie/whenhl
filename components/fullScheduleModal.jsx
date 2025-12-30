import { Octicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import TeamLogo from './teamLogo';

export default function FullScheduleModal({ visible, onClose, schedule, item, getGameResult }) {
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
          {schedule.allGames.filter(g => g.gameState === 'OFF' || g.gameState === 'FINAL').length > 0 && (
            <View style={s.fullSection}>
              <Text style={s.fullSectionTitle}>Completed Games</Text>
              <View style={s.fullScheduleGrid}>
                {schedule.allGames
                  .filter(g => g.gameState === 'OFF' || g.gameState === 'FINAL')
                  .map((game, idx) => {
                    const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
                    const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
                    const result = getGameResult(game);
                    
                    return (
                      <View key={idx} style={s.fullGameBox}>
                        <Text style={s.fullGameOpponent}>{opponent}</Text>
                        <View style={{ backgroundColor: result.won ? colors.green : colors.red, width: '20%', height: 2 }}/>
                      </View>
                    );
                  })}
              </View>
            </View>
          )}
          
          {schedule.allGames.filter(g => g.gameState === 'FUT').length > 0 && (
            <View style={s.fullSection}>
              <Text style={s.fullSectionTitle}>Upcoming Games</Text>
              <View style={s.fullScheduleGrid}>
                {schedule.allGames
                  .filter(g => g.gameState === 'FUT')
                  .map((game, idx) => {
                    const isHome = game.homeTeam.abbrev === item.teamAbbrev.default;
                    const opponent = isHome ? game.awayTeam.abbrev : game.homeTeam.abbrev;
                    const date = new Date(game.startTimeUTC);
                    
                    return (
                      <View key={idx} style={s.fullFutGameBox}>
                        <TeamLogo abbrev={opponent} width={40} height={30} />
                        <Text style={s.fullGameTime}>
                          {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </Text>
                      </View>
                    );
                  })}
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
    color: colors.text2,
    fontSize: 14,
    fontWeight: 500,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  fullScheduleGrid: {
    flex: 3,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  fullGameBox: {
    borderRadius: 8,
    alignItems: 'center',
    width: '16%',
    padding: 8,
    gap: 2,
  },
  fullFutGameBox: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 4,
  },
  fullGameOpponent: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  fullGameTime: {
    color: colors.text,
    fontSize: 12,
  },
  emptyText: {
    color: colors.text2,
    textAlign: 'center',
    paddingVertical: 10,
  },
});
