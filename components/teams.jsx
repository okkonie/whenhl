import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Modal, ActivityIndicator, TouchableOpacity, SectionList } from "react-native";
import { SvgUri } from "react-native-svg";
import Octicons from '@expo/vector-icons/Octicons';

export default function Teams({visible, favorites, onClose}){
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState('division'); // 'division', 'conference', or 'all'
  
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api-web.nhle.com/v1/standings/now");
        const data = await response.json();
        setStandings(data.standings);
      } catch (error) {
        console.error("Error fetching standings", error);
      } finally {
        setLoading(false);
      }
    };

    if (visible && standings.length === 0) {
      fetchStandings();
    }
  }, [visible]);

  const groupedStandings = () => {
    if (!standings || standings.length === 0) return [];

    if (groupBy === 'all') {
      return [{
        title: 'League',
        data: standings
      }];
    }

    const groups = {};
    standings.forEach(team => {
      const key = groupBy === 'division' ? team.divisionName : team.conferenceName;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(team);
    });

    return Object.keys(groups).map(key => ({
      title: key,
      data: groups[key]
    }));
  };

  const toggleGrouping = () => {
    setGroupBy(prev => {
      if (prev === 'division') return 'conference';
      if (prev === 'conference') return 'all';
      return 'division';
    });
  };

  const getGroupLabel = () => {
    if (groupBy === 'division') return 'Division';
    if (groupBy === 'conference') return 'Conference';
    return 'All';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={s.container}>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <>
          <View style={s.top}>
            <Text style={s.header}>Standings</Text>
            <View style={s.topButtons}>
              <TouchableOpacity onPress={toggleGrouping} activeOpacity={0.8} style={s.btn}>
                <Octicons name="sort-desc" size={22} color="white"/>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={s.btn}>
                <Octicons name="x" size={24} color="white"/>
              </TouchableOpacity>
            </View>
          </View>
          <SectionList 
            style={s.list}
            sections={groupedStandings()}
            keyExtractor={(item, index) => item?.teamName?.default || index.toString()}
            showsVerticalScrollIndicator={false}
            renderSectionHeader={({ section: { title } }) => (
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{title}</Text>
              </View>
            )}
            renderItem={({ item, index }) => 
              <View style={s.teamRow}>
                <View style={s.teamLeft}>
                  
                  <Text style={s.rank}>{index + 1}.</Text>
                  <SvgUri width={40} height={30} uri={`https://assets.nhle.com/logos/nhl/svg/${item.teamAbbrev.default}_dark.svg`} />
                  <Text style={s.teamName}>{item.teamName.default}</Text>
                </View>
                <Text style={s.teamPoints}>{item.points}</Text>
              </View>
            }
          />
        </>
      )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    color: 'white',
    fontSize: 18,
    fontWeight: 600,
    paddingLeft: 10
  },
  top: {
    paddingHorizontal: 15,
    height: 60,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  topButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  groupButton: {
    color: 'white',
    fontSize: 14,
    fontWeight: 500,
    opacity: 0.8
  },
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: '#202020',
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 600
  },
  teamRow: {
    paddingHorizontal: 25,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a'
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  rank: {
    color: "#aaa",
  },
  teamName: {
    color: 'white',
    fontWeight: 500,
    fontSize: 13,
  },
  teamPoints: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: 600
  }
});