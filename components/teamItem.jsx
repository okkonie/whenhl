import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import StatBar from './statBar';
import TeamLogo from './teamLogo';

function TeamStats({ visible, logo, item, onClose }) {
  const [schedule, setSchedule] = useState({ recentGames: [], upcomingGames: [] });

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
          
          setSchedule({ recentGames: completed, upcomingGames: upcoming });
        })
        .catch(err => console.error('Error fetching schedule:', err));
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
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.teamHeader}>
            {logo}
            <View>
              <Text style={s.teamHeaderName}>{item?.teamName?.default}</Text>
              <Text style={s.teamScore}>{item?.wins}-{item?.losses}-{item?.otLosses}</Text>
            </View>
          </View>
          {schedule.recentGames.length > 0 && (
            <View style={s.gamesSection}>
              <Text style={s.sectionTitle}>Recent Games</Text>
              <View style={s.gamesRow}>
                {schedule.recentGames.map((game, idx) => {
                  const result = getGameResult(game);
                  return (
                    <View 
                      key={idx} 
                      style={[
                        s.gameBox, 
                        { backgroundColor: result.won ? colors.green : colors.red }
                      ]}
                    >
                      <Text style={s.gameOpponent}>{result.opponent}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {schedule.upcomingGames.length > 0 && (
            <View style={s.gamesSection}>
              <Text style={s.sectionTitle}>Upcoming Games</Text>
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

          <Text style={s.sectionTitle}>Stats</Text>
          <StatBar
            leftLabel="Goals For"
            rightLabel="Goals Against"
            leftValue={item?.goalFor}
            rightValue={item?.goalAgainst}
            leftColor={colors.border}
            rightColor={colors.card}
          />

          <StatBar
            leftLabel="Home Wins"
            rightLabel="Home Losses"
            leftValue={item?.homeWins}
            rightValue={item?.homeLosses + item?.homeOtLosses}
            leftColor={colors.border}
            rightColor={colors.card}
          />

          <StatBar
            leftLabel="Road Wins"
            rightLabel="Road Losses"
            leftValue={item?.roadWins}
            rightValue={item?.roadLosses + item?.roadOtLosses}
            leftColor={colors.border}
            rightColor={colors.card}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function TeamItem({ item, index, isFavorite, onToggleFavorite }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8} style={[s.teamRow, index == 0 && { borderTopWidth: 0 }]}>
        <View style={s.teamLeft}>
          <View style={s.rank}>
            <Text style={s.rankText}>{index + 1}</Text>
          </View>
          <View style={s.team}>
            <TeamLogo abbrev={item.teamAbbrev.default} width={40} height={30} />
            <Text style={s.teamName}>{item.teamCommonName.default}</Text>
          </View>
        </View>
        <View style={s.teamRight}>
          <Text style={s.teamPoints}>{item.points}</Text>
          <TouchableOpacity style={s.favBtn} onPress={onToggleFavorite}>
            <Octicons 
              name={isFavorite ? "star-fill" : "star"} 
              color={isFavorite ? colors.brand : colors.grey} 
              size={16} 
              activeOpacity={0.8} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <TeamStats 
        visible={modalVisible}
        logo={<TeamLogo abbrev={item.teamAbbrev.default} width={80} height={70} />}
        item={item}
        onClose={() => setModalVisible(false)} 
      />
    </>
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
  gamesSection: {
    paddingVertical: 15,
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    paddingLeft: 5,
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  gameBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  goalForBar: {
    backgroundColor: colors.border2,
  },
  goalAgainstBar: {
    backgroundColor: colors.border,
    alignItems: 'flex-end'
  },
  goalValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  teamRow: {
    paddingVertical: 15,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  rank: {
    width: 18,
  },
  rankText: {
    color: colors.text2,
    textAlign: 'right',
  },
  teamName: {
    color: colors.text,
    fontSize: 14,
  },
  teamPoints: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600'
  },
  favBtn: {
    padding: 8,
    borderRadius: 5,
  },
});
