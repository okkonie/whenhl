import { Text, View, StyleSheet, Image } from "react-native";
import { SvgUri } from "react-native-svg";
import { useEffect, useState } from "react";
import Modal from "./modal";

export default function GameModal({ game, visible = true, onClose, dateLabel, timeLabel }) {
  const [loading, setLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState({});

  const fetchGame = async () => {
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game.id}/landing`);
      const data = await response.json();
      setGameInfo(data);
    } catch (e) {
      console.error("Error fetching game", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=> {
    if (game) {
      fetchGame();
    }
  }, [game])

  const title = game?.gameType === 1 ? 'PRESEASON' 
    : game?.gameType === 2 ? 'REGULAR SEASON' 
    : `GAME ${game?.seriesStatus?.gameNumberOfSeries} (${game?.seriesStatus?.topSeedTeamAbbrev} ${game?.seriesStatus?.topSeedWins} - ${game?.seriesStatus?.bottomSeedTeamAbbrev} ${game?.seriesStatus?.bottomSeedWins})`;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      loading={loading}
    >
      <View style={s.teamsRow}>
        <View style={s.teamCol}>
          <SvgUri width={70} height={70} uri={game?.homeTeam?.darkLogo} />
          <Text style={s.teamName}>{game?.homeTeam?.commonName?.default}</Text>
        </View>
        <View style={s.centerCol}>
          <Text style={s.dateLabel}>{dateLabel}</Text>
          <Text style={[
            s.stateLabel,
            game.gameState === 'LIVE' && s.liveLabel
          ]}>
            {game.gameState === 'FUT' ? timeLabel : `${game?.homeTeam?.score} - ${game?.awayTeam?.score}`}
          </Text>
        </View>
        <View style={s.teamCol}>
          <SvgUri width={70} height={70} uri={game?.awayTeam?.darkLogo} />
          <Text style={s.teamName}>{game?.awayTeam?.commonName?.default}</Text>
        </View>
      </View>
      {game.gameState != 'FUT' ? (
        <>
          <View style={s.statsRow}>
            <Text style={s.statsText}>{gameInfo?.homeTeam?.sog}</Text>
            <Text style={s.dateLabel}>SOG</Text>
            <Text style={s.statsText}>{gameInfo?.awayTeam?.sog}</Text>
          </View>
          <View style={s.list}>
            <Text style={s.leaderHead}>SCORING</Text>
            {gameInfo.summary?.scoring?.flatMap((period, i) => 
              period.goals?.map((goal, j) => (
                <View key={`${i}-${j}`} style={s.scorerContainer}>
                  <View style={s.scorerLeft}>
                    <SvgUri width={30} height={30} uri={goal.isHome ? game?.homeTeam?.darkLogo : game?.awayTeam?.darkLogo} />
                    <View>
                      <Text style={s.scorer}>
                        {goal.name?.default} ({goal.goalsToDate})
                      </Text>
                      {(() => {
                        const assists = (goal.assists ?? []).map(a => {
                          return `${a.name.default} (${a.assistsToDate})`;
                        });
                        if (assists.length === 0) return null;
                        return <Text style={s.assists}>{assists.join(', ')}</Text>;
                      })()}
                    </View>
                  </View>
                  <Text style={s.score}>
                    {goal.homeScore} - {goal.awayScore}
                  </Text>
                </View>
              )) ?? []
            )}
          </View>
        </>
      ) : (
        <>
          <View style={s.statsRow}>
            <Text style={s.statsText}>{gameInfo?.homeTeam?.record}</Text>
            <Text style={s.dateLabel}>record</Text>
            <Text style={s.statsText}>{gameInfo?.awayTeam?.record}</Text>
          </View>
          <View style={s.list}>
            {gameInfo?.matchup?.skaterComparison?.leaders?.length && (
              <>
                <Text style={s.leaderHead}>TEAM LEADERS</Text>
                {gameInfo.matchup?.skaterComparison?.leaders?.map((category, i) => (
                  <View key={i}>
                    <View style={s.scorerContainer}>
                      <View style={s.scorerLeft}>
                        <SvgUri width={30} height={30} uri={game?.homeTeam?.darkLogo} />
                        <View>
                          <Text style={s.scorer}>{category?.homeLeader?.name.default}</Text>
                          <Text style={s.assists}>{category?.category}</Text>
                        </View>
                      </View>
                      <Text style={s.score}>
                        {category?.homeLeader?.value}
                      </Text>
                    </View>
                    <View style={s.scorerContainer}>
                      <View style={s.scorerLeft}>
                        <SvgUri width={30} height={30} uri={game?.awayTeam?.darkLogo} />
                        <View>
                          <Text style={s.scorer}>{category?.awayLeader?.name.default}</Text>
                          <Text style={s.assists}>{category?.category}</Text>
                        </View>
                      </View>
                      <Text style={s.score}>
                        {category?.awayLeader?.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        </>
      )}
      <View style={{height: 50}}/>
    </Modal>
  );
};

const s = StyleSheet.create({
  bigText: {
    fontSize: 21,
    fontWeight: 700,
    color: 'white',
    paddingRight: 10
  },
  scorerLeft: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  leaderContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    alignItems: 'center'
  }, 
  scorerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    alignItems: 'center'
  }, 
  leaderHead: {
    color:'#b0b0b0',
    fontSize: 14,
    paddingTop: 30,
    paddingBottom: 20
  },
  headshot: {
    width: 64,
    height: 64,
    borderRadius: 10
  },
  score: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 16
  },
  scorer: {
    color: 'white',
    fontSize: 12,
    fontWeight: 600,
  },
  assists: {
    color: '#b0b0b0',
    fontSize: 12,
    marginTop: 4,
  },
  teamsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: 30,
    paddingTop: 20
  },
  teamCol: {
    alignItems: 'center',
    width: '33%',
  },
  teamName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  centerCol: {
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  dateLabel: {
    color: '#b0b0b0',
    textAlign: 'center',
  },
  stateLabel: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    fontWeight: 700
  },
  liveLabel: {
    backgroundColor: '#e62b1e',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 10

  },
  statsText: {
    color: 'white',
    fontWeight: 700,
    fontSize: 16
  },
  list: {
    flex: 1,
    width: '100%'
  }
});