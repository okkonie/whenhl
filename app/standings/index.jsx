import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../components/colors";
import TeamLogo from "../../components/teamLogo";
import { SafeAreaView } from "react-native-safe-area-context";
import TeamStats from "./teamStats"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Loader from "../../components/loader";
import { getPathFromState } from "expo-router/build/fork/getPathFromState";

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
        contentContainerStyle={{paddingTop: 10, paddingHorizontal: 15}}
      >
        {Object.keys(divisions).map((divKey) => (
          <View key={divKey}>
            <Text style={s.divisionTitle}>{divKey}</Text>
            {divisions[divKey].map((team, idx) => (
              <TouchableOpacity 
                activeOpacity={0.8}
                style={s.teamItem} 
                key={team?.teamAbbrev?.default}
                onPress={() => {setTeamVisible(true), setSelectedTeam(team)}}
              >
                <View style={s.teamLeft}>
                  <Text style={s.teamRank}>{idx+1}</Text>
                  <TeamLogo abbrev={team?.teamAbbrev?.default} size={32}/>
                  <Text style={s.teamName}>{team?.teamCommonName?.default}</Text>
                </View>
                <Text style={s.points}>{team.points}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={{height: 50}} />
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
    flex: 1
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 8,
    borderRadius: 10
  },
  teamLeft: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center'
  },
  teamName: {
    fontSize: 15,
    fontWeight: 400,
    color: colors.text,
  },
  teamRank: {
    fontSize: 14,
    color: colors.text2,
    paddingRight: 5
  },
  points: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.text
  },
  divisionTitle: {
    marginLeft: 10,
    marginBottom: 8,
    marginTop: 12,
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
  },
  ptsIndicator: {
    paddingRight: 10,
    fontSize: 12,
    color: colors.text2
  }
})