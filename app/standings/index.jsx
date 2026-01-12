import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../components/colors";
import TeamLogo from "../../components/teamLogo";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/header";
import TeamStats from "./teamStats"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Loader from "../../components/loader";

const Tab = createMaterialTopTabNavigator();

export default function Standings(){
  const [loading, setLoading] = useState(true);
  const [conferenceStandings, setConferenceStandings] = useState({});
  const [teamVisible, setTeamVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState({});

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://api-web.nhle.com/v1/standings/now");
        const data = await res.json();

        // Group by conference, then by division
        const groups = {};
        data.standings.forEach(team => {
          const confKey = team.conferenceName;
          const divKey = team.divisionName;

          if (!groups[confKey]) {
            groups[confKey] = {};
          }
          if (!groups[confKey][divKey]) {
            groups[confKey][divKey] = [];
          }
          groups[confKey][divKey].push(team);
        });

        setConferenceStandings(groups);
      } catch (e){
        console.log("Error fetching standings", e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStandings();
  }, []);

  const renderConf = (confName) => {
    const divs = conferenceStandings[confName];
    if (!divs) return null;

    return (
      <ScrollView 
        style={s.list} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 10, paddingHorizontal: 10}}
      >
        <View style={s.divRow}>
          {Object.entries(divs).map(([divName, teams]) => (
            <View key={divName} style={s.div}>
              <Text style={s.divTitle}>{divName}</Text>
              {teams.map((team) => (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={s.teamItem} 
                  key={team.teamAbbrev.default}
                  onPress={() => {setTeamVisible(true), setSelectedTeam(team)}}
                >
                  <View style={s.teamLeft}>
                    <TeamLogo abbrev={team.teamAbbrev.default} size={30} />
                    <Text style={s.teamName}>{team.teamAbbrev.default}</Text>
                  </View>
                  <Text style={s.points}>{team.points}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
        <View style={{height: 20}} />
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={s.container}>
      <Header text="Standings"/>
      {loading ? (
        <Loader />
      ) : (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.text2,
            tabBarStyle: { backgroundColor: colors.background, height: 36 },
            tabBarIndicatorStyle: { backgroundColor: colors.text, height: 1 },
            tabBarLabelStyle: { fontWeight: '700', textTransform: 'none', fontSize: 11, marginTop: -8 },
          }}
        >
          {Object.keys(conferenceStandings).map((confName) => (
            <Tab.Screen key={confName} name={confName.toUpperCase()}>
              {() => renderConf(confName)}
            </Tab.Screen>
          ))}
        </Tab.Navigator>
      )}
      <TeamStats 
        visible={teamVisible} 
        item={selectedTeam}
        onClose={() => {setTeamVisible(false), setSelectedTeam({})}}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colors.background,
  },
  list: {
    backgroundColor: colors.background,
    flex: 1
  },
  div: {
    width: '49%',
  },
  divTitle: {
    fontSize: 12,
    paddingLeft: 5,
    color: colors.text2,
    paddingBottom: 10,
    flex: 1,
    textAlign: 'center'
  },
  divRow: {
    flexDirection: 'row',
    width: '100%',
    gap: '2%',
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 15,
    paddingLeft: 10,
    paddingRight: 18,
    marginBottom: 6,
    borderRadius: 5
  },
  teamLeft: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  teamName: {
    fontSize: 14,
    color: colors.text,
  },
  points: {
    fontWeight: 500,
    color: colors.text
  }
})