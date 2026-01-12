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
          const divKey = team.divisionAbbrev;

          if (!groups[divKey]) {
            groups[divKey] = [];
          }
          groups[divKey].push(team);
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

  const renderDivision = (divName) => {
    const teams = divisionStandings[divName];
    if (!teams) return null;

    return (
      <ScrollView 
        style={s.list} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop: 10, paddingHorizontal: 10}}
      >
        {teams.map((team, idx) => (
          <TouchableOpacity 
            activeOpacity={0.8}
            style={s.teamItem} 
            key={team.teamAbbrev.default}
            onPress={() => {setTeamVisible(true), setSelectedTeam(team)}}
          >
            <View style={s.teamLeft}>
              <Text style={s.teamName}>{idx+1}</Text>
              <TeamLogo abbrev={team.teamAbbrev.default} size={30} />
              <Text style={s.teamName}>{team.teamCommonName.default}</Text>
            </View>
            <Text style={s.points}>{team.points}</Text>
          </TouchableOpacity>
        ))}
        <View style={{height: 50}} />
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
            tabBarScrollEnabled: false,
          }}
        >
          {Object.keys(divisionStandings).map((divName) => (
            <Tab.Screen key={divName} name={divName.toUpperCase()}>
              {() => renderDivision(divName)}
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
    fontWeight: 500,
    color: colors.text,
  },
  points: {
    fontSize: 16,
    fontWeight: 500,
    color: colors.text
  }
})