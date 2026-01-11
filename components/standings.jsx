import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../assets/colors";
import CustomModal from "./customModal";
import TeamLogo from "./teamLogo";

export default function Standings({visible, onClose}){
  const [loading, setLoading] = useState(true);
  const [conferenceStandings, setConferenceStandings] = useState({});

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
      <View style={s.confContainer} key={confName}>
        <View style={s.divRow}>
          {Object.entries(divs).map(([divName, teams]) => (
            <View key={divName} style={s.div}>
              <Text style={s.divTitle}>{divName}</Text>
              {teams.map((team) => (
                <View style={s.teamItem} key={team.teamAbbrev.default}>
                  <View style={s.teamLeft}>
                    <TeamLogo abbrev={team.teamAbbrev.default} width={30} height={25} />
                    <Text style={s.teamName}>{team.teamAbbrev.default}</Text>
                  </View>
                  <Text style={s.points}>{team.points}</Text>
                </View>
              ))}
            </View>
          ))}

        </View>
      </View>
    )
  }

  return (
    <CustomModal
      title="Standings"
      loading={loading}
      modalHeight={1}
      onClose={onClose}
      visible={visible}
    >
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {Object.keys(conferenceStandings).map((confName) => 
          renderConf(confName)
        )}
        <View style={{height: 20}} />
      </ScrollView>
    </CustomModal>
  )
}

const s = StyleSheet.create({
  content: {
    flex: 1,
    padding: 10,
  },
  confContainer: {
    marginBottom: 20,
  },
  confTitle: {
    fontSize: 12,
    color: colors.text2,
    paddingBottom: 10,
  },
  div: {
    width: '49%',
  },
  divTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
    paddingBottom: 10,
    flex: 1,
    textAlign: 'center',
  },
  divRow: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    gap: '2%',
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderRadius: 5
  },
  teamLeft: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  teamName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 500,
  },
  points: {
    fontWeight: 500,
    color: colors.text
  }
})