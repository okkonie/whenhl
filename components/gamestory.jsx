import { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomModal from './customModal';
import { colors } from '../assets/colors';
import TeamLogo from './teamLogo';

export default function GameStory({ game, visible, onClose, id, timeLabel, isPlayed, homeScoreNum, awayScoreNum, start }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!visible || !id) return;
      setLoading(true);
      try {
        const res = await fetch(`https://api-web.nhle.com/v1/gamecenter/${id}/landing`);
        const data = await res.json();
        setDetails(data);
      } catch (e) {
        console.log('Failed to load game');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, visible]);

  const isValidStart = start && !isNaN(start);
  const dateLabel = isValidStart
    ? start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    : '';

  return (
    <CustomModal title="Game details" visible={visible} onClose={onClose} loading={loading}>
      <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
        <View style={s.header}>
          <View style={s.teamContainer}>
            <TeamLogo abbrev={game?.homeTeam?.abbrev} size={50} />
            <Text style={s.matchDetail}>{game?.homeTeam?.commonName?.default}</Text>
          </View>
          
          <View style={s.matchInfo}>
            {isPlayed ? (
              <>
                <Text style={s.headerScore}>{homeScoreNum ?? 0} - {awayScoreNum ?? 0}</Text>
                <Text style={s.matchInfoText}>
                  {game?.gameOutcome?.lastPeriodType || 'Final'}
                </Text>
              </>
            ) : (
              <>
                <Text style={s.headerScore}>{timeLabel}</Text>
                <Text style={s.matchInfoText}>{dateLabel}</Text>
              </>
            )}
          </View>
          
          <View style={s.teamContainer}>
            <TeamLogo abbrev={game?.awayTeam?.abbrev} size={50} />
            <Text style={s.matchDetail}>{game?.awayTeam?.commonName?.default}</Text>
          </View>
        </View>
        
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
            <View style={s.row}>
              <Text style={s.matchInfoText}>location</Text>
              <Text style={s.matchDetail}>{details?.venue.default} @ {details?.venueLocation.default}</Text>
            </View>
          </>
          
        )}

      </ScrollView>
    </CustomModal>
  );
}

const s = StyleSheet.create({
  pickButton: {
    width: 40,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.grey
  },
  pickButtonActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  content: {
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamContainer: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  matchDetail: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
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