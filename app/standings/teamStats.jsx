import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../../components/colors';
import CustomModal from '../../components/customModal';
import TeamLogo from '../../components/teamLogo';

export default function TeamStats({ visible, item, onClose }) {
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

  const StatItem = ({head, value}) => {
    return (
      <View style={s.statItem}>
        <Text style={s.statHead}>{head}</Text>
        <Text style={s.statValue}>{value}</Text>
      </View>
    )
  }

  return (
    <CustomModal
      visible={visible}
      loading={loading}
      onClose={onClose}
      title="Team Details"
    >
      <ScrollView style={s.content} contentContainerStyle={{paddingBottom: 20}} showsVerticalScrollIndicator={false}>
        <View style={s.teamHeader}>
          {item?.teamAbbrev?.default && <TeamLogo abbrev={item.teamAbbrev.default} size={60}/>}
          <View style={s.teamInfo}>
            <Text style={s.teamHeaderName}>{item?.teamName?.default}</Text>
            <Text style={s.teamMore}>{item?.points} PTS    {item?.gamesPlayed} GP</Text>
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
      </ScrollView>
    </CustomModal>
  );
}

const s = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: colors.border,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 10
  },
  gamesTitle: {
    color: colors.text2,
    fontWeight: 400,
    fontSize: 14,
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
  teamMore: {
    color: colors.text2,
    fontSize: 14,
    fontWeight: 400,
    paddingTop: 4
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.border,
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
