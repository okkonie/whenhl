import Octicons from '@expo/vector-icons/Octicons';
import { useEffect, useState } from "react";
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

export default function Teams() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState('division');
  
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

    fetchStandings();
  }, []);

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

  return (
    <SafeAreaView style={s.container}>

    {loading ? (
      <View style={s.loader}>
        <ActivityIndicator color="#fff" />
      </View>
    ) : (
      <>
        <View style={s.header}>
          <Text style={s.headerText}>Standings</Text>
          <View style={s.buttons}>
            <TouchableOpacity onPress={toggleGrouping} activeOpacity={0.7} style={s.btn}>
              <Octicons name="sort-desc" size={22} color="white"/>
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
                <Text style={s.rank}>{index + 1}</Text>
                <View style={s.team}>
                  <View style={s.svgPlace}>
                    <SvgUri 
                      width={40} 
                      height={30} 
                      uri={`https://assets.nhle.com/logos/nhl/svg/${item.teamAbbrev.default}_dark.svg`} 
                    />
                  </View>
                  <View>
                    <Text style={s.teamName}>{item.teamName.default}</Text>
                    <Text style={s.score}>{item.regulationPlusOtWins + item.shootoutWins}-{item.losses}-{item.otLosses}</Text>
                  </View>
                </View>
              </View>
              <View style={s.teamRight}>
                <Text style={s.teamPoints}>{item.points}</Text>
                <TouchableOpacity style={s.favBtn}>
                  <Octicons name="star" color="#666" size={18} activeOpacity={0.7} />
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </>
    )}
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  favBtn: {
    padding: 10,
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgPlace: {
    width: 40,
    height: 30
  },
  header: {
    height: 65,
    paddingTop: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    paddingLeft: 10,
    fontSize: 18,
    color: 'white',
    fontWeight: 700,
  },
  buttons: {
    gap: 10,
    alignItems: 'center',
    flexDirection: 'row'
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
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 5,
  },
  sectionTitle: {
    color: '#aaa',
    fontWeight: 500,
    fontSize: 15,
  },
  teamRow: {
    paddingHorizontal: 25,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  rank: {
    color: "#aaa",
    width: 24,
  },
  teamName: {
    color: 'white',
    fontSize: 13,
    fontWeight: 500
  },
  teamPoints: {
    color: 'white',
    fontSize: 14,
    fontWeight: 600
  },
  score: {
    color: "#aaa",
    fontSize: 11,
    paddingTop: 2,
  },
});