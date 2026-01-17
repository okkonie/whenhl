import { memo, useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { colors } from './colors';
import TeamLogo from './teamLogo';
import CustomModal from "./customModal";

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
      <TouchableOpacity disabled={isFut} activeOpacity={0.8} onPress={() => setGameVisible(true)} style={s.container}>

        <View style={s.body}>
          <View style={s.teams}>
            <View style={s.teamItem}>
              <View style={s.teamLeft}>
                <TeamLogo abbrev={game?.homeTeam?.abbrev} size={30}/>
                <Text style={[s.teamName, {color: homeIsWinner === false ? colors.text2 : colors.text}]}>
                  {game?.homeTeam?.commonName.default}
                </Text>
              </View>
            </View>
            <View style={s.teamItem}>
              <View style={s.teamLeft}>
                <TeamLogo abbrev={game?.awayTeam?.abbrev} size={30}/>
                <Text style={[s.teamName, {color: homeIsWinner === true ? colors.text2 : colors.text}]}>
                  {game?.awayTeam?.commonName.default}
                </Text>
              </View>
            </View>
          </View>

          {isFut ?
            <View style={s.gameInfo}>
              
              <Text style={s.gameInfoText}>{timeLabel}</Text>
              <Text style={s.label}>{dateLabel}</Text>
            </View>
          :
            <View style={s.scores}>
              <Text style={[s.score, {color: homeIsWinner === false ? colors.text2 : colors.text}]}>
                {game?.homeTeam?.score}
              </Text>
              <Text style={[s.score, {color: homeIsWinner === true ? colors.text2 : colors.text}]}>
                {game?.awayTeam?.score}
              </Text>
            </View>
          }
        </View>
      </TouchableOpacity>

      <CustomModal title="Game details" visible={gameVisible} onClose={() => setGameVisible(false)} loading={loading}>
        <ScrollView contentContainerStyle={s.contentContainer} showsVerticalScrollIndicator={false}>

          <View style={s.modalTop}>
            <View style={s.modalTeam}>
              <TeamLogo abbrev={game?.homeTeam?.abbrev} size={50}/>
              <Text style={[s.teamName,{color: colors.text}]}>
                {game?.homeTeam?.abbrev}
              </Text>
            </View>
            <View style={s.modalDetails}>
              <Text style={s.label}>{!isLive && dateLabel}</Text>
              <Text style={[s.score, {color: colors.text}]}>{game?.homeTeam?.score} - {game?.awayTeam?.score}</Text>
              <Text style={s.label}>{isLive ? "LIVE" : game?.gameOutcome?.lastPeriodType}</Text>
            </View>
            <View style={s.modalTeam}>
              <TeamLogo abbrev={game?.awayTeam?.abbrev} size={50}/>
              <Text style={[s.teamName,{color: colors.text}]}>
                {game?.awayTeam?.abbrev}
              </Text>
            </View>
          </View>

          <View style={s.row}>
            <Text style={s.matchDetail}>{details?.homeTeam.sog}</Text>
            <Text style={s.label}>sog</Text>
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
        </ScrollView>
      </CustomModal>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    flex: 1,
    padding: 20,
    gap: 12,
    marginHorizontal: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  top: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  body: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 5
  },
  teams: {
    justifyContent: 'center',
    flex: 1,
    gap: 6,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gameInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 7,
  },
  scores: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  gameInfoText: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.text,
    textAlign: 'right'
  },
  score: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'right'
  },
  teamName: {
    fontSize: 15,
    fontWeight: 500,
  },
  label: {
    color: colors.text2,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  modalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
    paddingHorizontal: 15,
  },
  modalTeam: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modalDetails: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  matchDetail: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 700,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    marginHorizontal: 20,
    paddingHorizontal: 15,
  },
  scoringContainer: {
    marginTop: 16,
    marginHorizontal: 20,
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
});

export default memo(Game);