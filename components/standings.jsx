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
          const confKey = team.conferenceAbbrev;
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

  const renderConference = (conferenceAbbrev) => {
    const divisions = conferenceStandings[conferenceAbbrev] || {};
    const divisionNames = Object.keys(divisions);
    const maxTeams = Math.max(...divisionNames.map(div => divisions[div].length));
    
    return (
      <View key={conferenceAbbrev} style={s.conferenceSection}>
        <View style={s.tableHeader}>
          <View style={s.rankColumn}>
            <Text style={s.headerText}>{conferenceAbbrev}</Text>
          </View>
          {divisionNames.map(divName => (
            <View key={divName} style={s.divisionColumn}>
              <Text style={s.headerText}>{divName}</Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        <View style={s.tableBody}>
          {Array.from({ length: maxTeams }).map((_, rowIndex) => (
            <View key={rowIndex} style={s.tableRow}>
              <View style={s.rankColumn}>
                <Text style={s.rank}>{rowIndex + 1}</Text>
              </View>
              {divisionNames.map(divName => {
                const team = divisions[divName][rowIndex];
                return (
                  <View key={divName} style={s.divisionColumn}>
                    {team ? (
                      <View style={s.teamCell}>
                        <TeamLogo abbrev={team.teamAbbrev.default} width={30} height={25} />
                        <Text style={s.teamAbbrev}>{team.teamAbbrev.default}</Text>
                        <Text style={s.points}>{team.points}</Text>
                      </View>
                    ) : (
                      <View style={s.teamCell} />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <CustomModal
      title="Standings"
      loading={loading}
      modalHeight={1}
      onClose={onClose}
      visible={visible}
    >
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.mainGrid}>
          {renderConference("W")}
          {renderConference("E")}
        </View>
      </ScrollView>
    </CustomModal>
  )
}

const s = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 10,
  },
  mainGrid: {
    gap: 25,
  },
  conferenceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 5,
  },
  tableBody: {
    gap: 5,
    backgroundColor: colors.card,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6
  },
  rankColumn: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisionColumn: {
    flex: 1,
    alignItems: 'stretch',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text2,
  },
  rank: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text2,
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    width: '100%',
  },
  teamAbbrev: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  points: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 'auto',
  },
})