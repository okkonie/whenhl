import { memo, useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { colors } from '../../components/colors';
import TeamLogo from '../../components/teamLogo';
import CustomModal from "../../components/customModal";

function Game({ game }) {
  const [gameVisible, setGameVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!gameVisible || !game.id) return;
      setLoading(true);
      try {
        const res = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game?.id}/landing`);
        const data = await res.json();
        setDetails(data);
      } catch (e) {
        console.log('Failed to load game');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [gameVisible]);

  const isPlayed = game?.gameState && game.gameState !== 'FUT' && game.gameState !== 'LIVE' && game.gameState !== 'PRE';
  const isLive = game?.gameState == 'LIVE';
  const isFut = !isPlayed && !isLive

  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const timeLabel = isValidStart
    ? start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  const dateLabel = isValidStart
    ? start.toLocaleDateString(undefined, { weekday: "short", day: 'numeric', month: 'numeric' })
    : '';

  const homeIsWinner = isPlayed && 
    game?.homeTeam?.score != null && 
    game?.awayTeam?.score != null
    ? game.homeTeam.score > game.awayTeam.score
    : undefined;

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setGameVisible(true)} style={s.container}>

        <View style={s.teams}>
          <View style={s.teamRow}>
            <View style={s.teamItem}>
              <TeamLogo abbrev={game?.homeTeam?.abbrev} size={34}/>
              <Text style={s.teamName}>{game?.homeTeam?.commonName.default}</Text>
            </View>
            {!isFut && 
              <Text style={[s.score, {color: !homeIsWinner ? colors.text2 : colors.text}]}>
                {game?.homeTeam?.score}
              </Text>
            }
          </View>
          <View style={s.teamRow}>
            <View style={s.teamItem}>
              <TeamLogo abbrev={game?.awayTeam?.abbrev} size={34}/>
              <Text style={s.teamName}>{game?.awayTeam?.commonName.default}</Text>
            </View>
            {!isFut && 
              <Text style={[s.score, {color: homeIsWinner ? colors.text2 : colors.text}]}>
                {game?.awayTeam?.score}
              </Text>
            }
          </View>
        </View>


        <View style={s.gameInfo}>
          {isFut && <Text style={s.time}>{timeLabel}</Text>}
          <Text style={s.label}>
            {isLive ? 'LIVE' : isPlayed ? game.gameOutcome.lastPeriodType :dateLabel}
          </Text>
        </View>
      </TouchableOpacity>

      <CustomModal title="Game details" visible={gameVisible} onClose={() => setGameVisible(false)} loading={loading}>
        <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
          {isPlayed ? (
            <>
              <View style={s.row}>
                <Text style={s.matchDetail}>{details?.homeTeam.sog}</Text>
                <Text style={s.matchInfoText}>sog</Text>
                <Text style={s.matchDetail}>{details?.awayTeam.sog}</Text>
              </View>
              <View style={s.scoringContainer}>
                <Text style={s.matchDetail}>Scoring</Text>
                {details?.summary?.scoring?.map((period, idx) => (
                  <View key={idx}>
                    {period.goals?.length > 0 && (
                      period.goals.map((goal, goalIdx) => (
                        <View key={goalIdx} style={s.goalRow}>
                          <TeamLogo abbrev={goal?.teamAbbrev.default} size={30} />
                          <View style={s.goalTexts}>
                            <Text style={s.goalScorer}>{goal.name.default} ({goal.goalsToDate})</Text>
                            {goal.assists.length > 0 && (
                              <Text style={s.goalAssist}>{goal.assists.map((assist) => (`${assist.name.default} (${assist.assistsToDate}) `))}</Text>  
                            )}
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={s.row}>
                <Text style={s.matchDetail}>{details?.homeTeam.record}</Text>
                <Text style={s.matchInfoText}>record</Text>
                <Text style={s.matchDetail}>{details?.awayTeam.record}</Text>
              </View>
            </>
            
          )}
        </ScrollView>
      </CustomModal>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 20,
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  teams: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  gameInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 20,
  },
  teamName: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text
  },
  score: {
    fontSize: 26,
    fontWeight: 700,
  },
  time: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.text,
  },
  label: {
    color: colors.text2,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  matchIfo: {
    paddingHorizontal: 20,
  },  
  matchDetail: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerScore: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  matchInfo: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  matchInfoText: {
    color: colors.text2,
    fontSize: 14,
    fontWeight: '500',
  },
  scoringContainer: {
    marginTop: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 30,
  },
  goalTeam: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 50,
  },
  goalTexts: {
    gap: 3,
  },
  goalScorer: {
    color: colors.text,
    fontWeight: 500,
    fontSize: 13,
  },
  goalAssist: {
    color: colors.text2,
    fontSize: 12,
    flex: 1,
  },
  goalTime: {
    color: colors.text2,
    fontSize: 12,
  },
  noGoals: {
    color: colors.text2,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default memo(Game);