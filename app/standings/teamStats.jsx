import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../../components/colors';
import CustomModal from '../../components/customModal';
import TeamLogo from '../../components/teamLogo';
import Flag from '../../components/flag';

export default function TeamStats({ visible, item, onClose }) {
  const [schedule, setSchedule] = useState([]);
  const [roster, setRoster] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSchedule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${item.teamAbbrev.default}/now`);
        const data = await response.json();
        setSchedule(data.games);

        const rosterResponse = await fetch(`https://api-web.nhle.com/v1/roster/${item.teamAbbrev.default}/current`);
        const rosterData = await rosterResponse.json();
        setRoster(rosterData);
      } catch(e){
        console.log("Error fecthing data", e)
      } finally {
        setLoading(false);
      }
    }

    visible && getSchedule();
  }, [item?.teamAbbrev?.default]);

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
        <View style={s.statRow}>
          <StatItem
            head="GOALS"
            value={item?.goalFor}
          />
          <StatItem
            head="G/AGAINST"
            value={item?.goalAgainst}
          />
          <StatItem
            head="WIN PCTG"
            value={`${(item?.winPctg * 100).toFixed(2)}%`}
          />
          <StatItem
            head="RECORD"
            value={`${item?.wins}-${item?.losses}-${item?.otLosses}`}
          />
          <StatItem
            head="HOME"
            value={`${item?.homeWins}-${item?.homeLosses}-${item?.homeOtLosses}`}
          />
          <StatItem
            head="AWAY"
            value={`${item?.roadWins}-${item?.roadLosses}-${item?.roadOtLosses}`}
          />
        </View>

        <View style={s.statRow}>
          <View style={s.col}>
            <Text style={s.rosterHead}>FORWARDS</Text>
            {roster.forwards?.map((player) => (
              <View style={s.player} key={player.id}>
                <Text style={s.playerText}>
                  <Flag country={player.birthCountry}/> {" "}
                  {player.firstName.default[0]}. {player.lastName.default}
                </Text>
              </View>
            ))}
          </View>
          <View style={s.col}>
            <Text style={s.rosterHead}>DEFENSEMEN</Text>
            {roster.defensemen?.map((player) => (
              <View style={s.player} key={player.id}>
                <Text style={s.playerText}>
                  <Flag country={player.birthCountry}/> {" "}
                  {player.firstName.default[0]}. {player.lastName.default}
                </Text>
              </View>
            ))}
            <Text style={s.rosterHead}>GOALIES</Text>
            {roster.goalies?.map((player) => (
              <View style={s.player} key={player.id}>
                <Text style={s.playerText}>
                  <Flag country={player.birthCountry}/> {" "}
                  {player.firstName.default[0]}. {player.lastName.default}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </CustomModal>
  );
}

const s = StyleSheet.create({
  teamInfo: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  teamHeader: {
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
    paddingVertical: 30,
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
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: colors.border
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
    fontSize: 18
  },
  col: {
    width: '50%',
    flexDirection: 'column',
    paddingHorizontal: 10
  },
  rosterHead: {
    fontSize: 16,
    fontWeight: 500,
    color: colors.text2,
    paddingTop: 20,
    paddingBottom: 10
  },
  playerText: {
    fontSize: 14,
    color: colors.text,
    paddingVertical: 4,
  }
});
