import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import TeamLogo from "../components/teamLogo";
import { colors } from "../components/colors";
import { Octicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

export default function Standings({visible, setVisible}){

  const [loading, setLoading] = useState(true);
  const [divisionStandings, setDivisionStandings] = useState([]);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://api-web.nhle.com/v1/standings/now");
        const data = await res.json();

        // Group by division
        const groups = [];
        data.standings.forEach(team => {
          const divKey = team.divisionName;
          const existing = groups.find(g => g.divisionName === divKey);

          if (existing) {
            existing.teams.push(team);
          } else {
            groups.push({ divisionName: divKey, teams: [team] });
          }
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

  return(
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={s.container}>
        <View style={s.content}>
          <View style={s.head}>
            <Text style={s.header}>Standings</Text>
            <TouchableOpacity onPress={() => setVisible(false)} style={s.button}>
              <Octicons name="x" color={colors.text} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={s.scrollContent}
          >
            {divisionStandings.map(({ divisionName, teams }) => (
              <View style={s.division} key={divisionName}>
                {teams.map((team, index) => (
                  <View 
                    key={team.teamAbbrev.default} 
                    style={s.team}
                  >
                    <View style={s.teamLeft}>
                      <TeamLogo abbrev={team.teamAbbrev.default} size={22}/>
                      <Text style={s.abbrev}>{team.teamAbbrev.default}</Text>
                    </View>
                    <View style={s.teamRight}>
                      <Text style={s.points}>{team.points}</Text>
                      <Text style={s.score}>{team.wins}-{team.losses}-{team.otLosses}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 40,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  content: {
    width: '98%',
    backgroundColor: colors.card,
    borderRadius: 23,
  },
  head: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  header: {
    color: colors.text,
    fontWeight: 500,
    fontSize: 18,
    paddingLeft: 10,
  },
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
    padding: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 5,
  },
  division: {
    gap: 5,
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150,
    paddingHorizontal: 15,
    height: 65,
  },
  teamLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  abbrev: {
    fontWeight: 500,
    fontSize: 10,
    color: colors.text,
  },
  teamRight: {
    alignItems: 'flex-end',
  },
  points: {
    fontWeight: 900,
    fontSize: 14,
    color: colors.text,
  },
  score: {
    color: colors.text2,
    fontSize: 12,
  }
})