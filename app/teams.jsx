import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from 'react-native-svg';
import TeamModal from '../components/TeamModal'

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortingCriteria, setSortingCriteria] = useState('Conference');
  const [teamVisible, setTeamVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api-web.nhle.com/v1/standings/now');
        const data = await response.json();

        setTeams(data.standings);

      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const getGroupedData = () => {
    if (sortingCriteria === 'Conference') {
      const eastern = teams.filter(team => team.conferenceAbbrev === 'E').sort((a, b) => b.points - a.points);
      const western = teams.filter(team => team.conferenceAbbrev === 'W').sort((a, b) => b.points - a.points);
      return [
        { title: 'Eastern', data: eastern },
        { title: 'Western', data: western }
      ];
    } else if (sortingCriteria === 'Division') {
      const divisions = ['Atlantic', 'Metropolitan', 'Central', 'Pacific'];
      return divisions.map(division => ({
        title: `${division}`,
        data: teams.filter(team => team.divisionName === division).sort((a, b) => b.points - a.points),
      }));
    } else {
      return [{ title: 'All Teams', data: teams.sort((a, b) => b.points - a.points) }];
    }
  };
  
  const renderItem = ({ item, index }) => {  
    return (
      <TouchableOpacity style={s.itemContainer} activeOpacity={0.8} onPress={() => {setTeamVisible(true); setSelectedTeam(item)}}>
        <View style={s.teamLeft}>
          <Text style={s.teamRank}>{index + 1}.</Text>
          <View style={{height: 35, width: 35}}>
            <SvgUri width={35} height={35} uri={`https://assets.nhle.com/logos/nhl/svg/${item.teamAbbrev?.default}_dark.svg`} />
          </View>
          <View>
            <Text style={s.teamPlace}>
              {item.placeName.default === 'NY Islanders' ? 'New York' : item.placeName.default === 'NY Rangers' ? 'New York' : item.placeName.default}
            </Text>
            <Text style={s.teamName}>
              {item.teamCommonName.default === 'Utah Hockey Club' ? 'Hockey Club' : item.teamCommonName.default}
            </Text>
          </View>
        </View>
  
        <View style={s.teamRight}>
          <Text style={s.teamPoints}>{item.points}p</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const toggleSorting = () => {
    setSortingCriteria(prev => {
      if (prev === 'Conference') return 'Division';
      if (prev === 'Division') return 'All';
      return 'Conference';
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerText}>Standings</Text>
        <TouchableOpacity onPress={toggleSorting} style={{ transform: [{ rotate: '90deg' }] }}>
          <AntDesign name="swap" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color='#fff'/>
        </View>
      ) : (
        <SectionList
          style={s.list}
          sections={getGroupedData()}
          keyExtractor={(item, index) => item.teamAbbrev?.default || index.toString()}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={s.sectionHeaderText}>{title}</Text>
          )}
          ListEmptyComponent={<Text style={s.emptyText}>No teams found</Text>}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 55 }} />}
        />
      )}

      <TeamModal  visible={teamVisible} team={selectedTeam} onClose={() => setTeamVisible(false)}/>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    height: 60,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '700',
  },
  list: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 20
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    paddingLeft: 5,
    paddingTop: 25,
    paddingBottom: 10,
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '600',
  },
  itemContainer: {
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: '#171717',
    borderColor: "#222",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row'
  },
  teamLeft: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10
  },
  teamRank: {
    color: '#b0b0b0',
    fontWeight: '500',
    fontSize: 14,
    width: 20,
    textAlign: 'right'
  },
  teamPlace: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  teamName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  teamRight: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  teamPoints: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 32,
    textAlign: 'center',
  },
});