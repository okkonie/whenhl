import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../components/colors";
import TeamLogo from "../../components/teamLogo";
import { SafeAreaView } from "react-native-safe-area-context";
import TeamStats from "./teamStats"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Loader from "../../components/loader";

const Tab = createMaterialTopTabNavigator();

export default function Standings(){
  const [loading, setLoading] = useState(true);
  const [divisionStandings, setDivisionStandings] = useState({});
  const [teamVisible, setTeamVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState({});

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://api-web.nhle.com/v1/standings/now");
        const data = await res.json();

        // Group by division
        const groups = {};
        data.standings.forEach(team => {
          const confKey = team.conferenceName;
          const divKey = team.divisionName;

          if (!groups[confKey]) {
            groups[confKey] = [];
          }
          if (!groups[confKey][divKey]) {
            groups[confKey][divKey] = [];
          }
          groups[confKey][divKey].push(team);
        });

        setDivisionStandings(groups);
      } catch (e){
        console.log("Error fetching standings", e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStandings();
  }, []);

  const renderConference = (confName) => {
    const divisions = divisionStandings[confName];
    if (!divisions) return null;

    return (
      <ScrollView 
        style={s.list} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 10, paddingHorizontal: 5}}
      > 
        <View style={s.conference}>
          
          {Object.keys(divisions).map((divKey) => (
            <View key={divKey} style={s.div}>
              <Text style={s.divisionTitle}>{divKey.toLocaleUpperCase()}</Text>
              {divisions[divKey].map((team, idx) => (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={s.teamItem} 
                  key={team?.teamAbbrev?.default}
                  onPress={() => {setTeamVisible(true), setSelectedTeam(team)}}
                >
                  <View style={s.teamLeft}>
                    <TeamLogo abbrev={team?.teamAbbrev?.default} size={26}/>
                    <Text style={s.teamName}>{team?.teamCommonName?.default}</Text>
                  </View>
                  <View style={s.teamRight}>
                    <Text style={s.score}>
                      {team.wins}-
                      {team.losses}-
                      {team.otLosses}
                    </Text>
                    <Text style={s.points}>{team.points}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        
        </View>
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={s.container}>
      {loading ? (
        <Loader />
      ) : (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.text2,
            tabBarStyle: { backgroundColor: colors.background, height: 40},
            tabBarIndicatorStyle: { backgroundColor: colors.text, height: 1 },
            tabBarLabelStyle: { fontWeight: '700', textTransform: 'none', fontSize: 12, paddingBottom: 5 },
          }}
        >
          {Object.keys(divisionStandings).map((confName) => (
            <Tab.Screen key={confName} name={confName.toUpperCase()}>
              {() => renderConference(confName)}
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
    flex: 1,
    marginBottom: 50
  },
  conference: {
    flex: 1,
  },
  div: {
    paddingHorizontal: 8,
    borderRadius: 14,
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: colors.card
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: colors.border,
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  teamLeft: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  teamName: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
  },
  teamRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  points: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.text
  },
  score: {
    fontSize: 12,
    color: colors.text2
  },
  divisionTitle: {
    marginVertical: 8,
    fontSize: 12,
    fontWeight: 500,
    color: colors.text2,
    flex: 1,
    textAlign: 'center'
  }
})