import { useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState  } from 'react';
import { View, Text, Modal, ScrollView , TouchableOpacity, StyleSheet, ActivityIndicator  } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import teamLogos from './logos';

const countryCodeMap = {
  USA: 'US',
  CAN: 'CA',
  SWE: 'SE',
  FIN: 'FI',
  RUS: 'RU',
  CZE: 'CZ',
  SVK: 'SK',
  GER: 'DE',
  SUI: 'CH',
  DNK: 'DK',
  SLO: 'SI',
  AUT: 'AT',
  AUS: 'AU',
  BLR: 'BY',
  NET: 'NL',
  LAT: 'LV',
  NOR: 'NO',
  FRA: 'FR',
};

const getFlagEmoji = (countryCode) => {
  const twoLetterCode = countryCodeMap[countryCode.toUpperCase()] || countryCode.slice(0, 2);
  return twoLetterCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

const TeamInfoScreen = () => {
  const params = useGlobalSearchParams();
  const [yearRange, setYearRange] = useState('');
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [futGames, setFutGames] = useState([]);
  const [showRoster, setShowRoster] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [teamStats, setTeamStats] = useState([]);

  const pastDateFormat = new Intl.DateTimeFormat('default', { day: 'numeric', month: 'numeric'});
  const futDateFormat = new Intl.DateTimeFormat('default', { weekday: 'short', day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' });
  const futDateFormat2 = new Intl.DateTimeFormat('default', { weekday: 'short', hour: 'numeric', minute: 'numeric' });

  useEffect(() => {
    const getYearRange = () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      if (currentMonth >= 7) {
        setYearRange(`${currentYear + 1}${currentYear + 2}`);
      } else {
        setYearRange(`${currentYear - 1}${currentYear}`);
      }
    };

    setShowRoster(false); 
    getYearRange();
  }, []);

  const fetchRoster = async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/roster/${params.abbr}/${yearRange}`, { signal });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let fetchedRoster = {
        forwards: [],
        defensemen: [],
        goalies: [],
      };

      data.forwards.forEach((forward) => {
        fetchedRoster.forwards.push({
          name: forward.firstName.default + ` ` + forward.lastName.default,
          number: forward.sweaterNumber,
          pos: forward.positionCode,
          country: getFlagEmoji(forward.birthCountry)
        });
      });

      data.defensemen.forEach((defenseman) => {
        fetchedRoster.defensemen.push({
          name: defenseman.firstName.default + ` ` + defenseman.lastName.default,
          number: defenseman.sweaterNumber,
          pos: defenseman.positionCode,
          country: getFlagEmoji(defenseman.birthCountry)
        });
      });

      data.goalies.forEach((goalie) => {
        fetchedRoster.goalies.push({
          name: goalie.firstName.default + ` ` + goalie.lastName.default,
          number: goalie.sweaterNumber,
          pos: goalie.positionCode,
          country: getFlagEmoji(goalie.birthCountry)
        });
      });

      setRoster(fetchedRoster);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching roster:', error);
      }
    }

    return () => controller.abort();
  };

  const fetchSchedule = async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${params.abbr}/now`, { signal });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      let pastGames = [];
      let futGames = [];
  
      pastGames = data.games
      .filter((game) => game.gameState === 'OFF')
      .map((game) => ({
        id: game.id,
        startTime: game.startTimeUTC,
        opponent: game.homeTeam.abbrev === params.abbr ? game.awayTeam.abbrev : game.homeTeam.abbrev,
        homeTeam: game.homeTeam.abbrev,
        homeScore: game.homeTeam.score, 
        awayScore: game.awayTeam.score, 
        result: game.homeTeam.abbrev === params.abbr
          ? game.homeTeam.score > game.awayTeam.score ? 'W' : 'L'
          : game.awayTeam.score > game.homeTeam.score ? 'W' : 'L'
      }));

      futGames = data.games
      .filter((game) => game.gameState === 'FUT')
      .map((game) => ({
        startTime: game.startTimeUTC,
        opponent: game.homeTeam.abbrev === params.abbr ? game.awayTeam.abbrev : game.homeTeam.abbrev,
        homeTeam: game.homeTeam.abbrev,
      }));
  
      setPastGames(pastGames);
      setFutGames(futGames);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching schedule:', error);
      }
    }
  
    return () => controller.abort();
  };

  const fetchStats = async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/standings/now`, { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const teamStats = {};

      data.standings.forEach((team) => {
        if (team.teamAbbrev.default === params.abbr) {
          Object.assign(teamStats, {
            gamesPlayed: team.gamesPlayed,
            points: team.points,
            goals: team.goalFor,
            goalAgainst: team.goalAgainst,
            homeLosses: team.homeLosses + team.homeOtLosses,
            homeWins: team.homeWins,
            roadLosses: team.roadLosses + team.roadOtLosses,
            roadWins: team.roadWins,
            division: team.divisionName,
            rank: team.divisionSequence,
            gapg: parseFloat((team.goalAgainst / team.gamesPlayed).toFixed(2)),
            gfpg: parseFloat((team.goalFor / team.gamesPlayed).toFixed(2)),
          });
        }
      });

      setTeamStats(teamStats);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching stats:', error);
      }
    }
  
    return () => controller.abort();
  };

  useEffect(() => {
    if (params.abbr && yearRange) {
      setLoading(true);
  
      Promise.all([fetchRoster(), fetchSchedule(), fetchStats()])
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setLoading(false);
        });
    }
  }, [params.abbr, yearRange]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{params.name}</Text>
          <Image
            source={teamLogos[params.abbr] || teamLogos.DEFAULT}
            style={styles.image}
          />
        </View>
        {loading ? (
          <View style={{ flex: 1, top: '100%', right: '50%', position: 'absolute', height: '500%', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="white" style={styles.activityIndicator} />
          </View>
        ) : (
        <>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setShowSchedule(true)} 
        >
          <View style={styles.buttonContent}>
            <Text style={styles.gamesText}>Recent games</Text>
            <View style={styles.resultsContainer}>
              {(pastGames ?? []).slice(-7).map((game, index) => (
                <View 
                  key={index}
                  style={[
                    styles.resultBox, 
                    { backgroundColor: game.result === 'W' ? '#26ad5f' : '#b35b5b' }
                  ]}
                >
                  <Text style={styles.resultText}>{game.result}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.gamesText}>Upcoming games</Text>
            <View style={styles.upcomingGamesContainer}>
              {(futGames ?? []).slice(0, 3).map((game, index) => (
                <View key={index} style={styles.upcomingGame}>
                  <Image
                    source={teamLogos[game.opponent] || teamLogos.DEFAULT}
                    style={styles.imageOpp}
                  />
                  <Text style={styles.gameText}>
                    {futDateFormat2.format(new Date(game.startTime))}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.modalHint}>click for more</Text>
          </View>
        </TouchableOpacity>

        <Modal
          visible={showSchedule}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSchedule(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
                {([...pastGames ?? [], ...futGames ?? []]).map((item, index) => {
                  const date = new Date(item.startTime);
                  const formattedDate = item.result 
                    ? pastDateFormat.format(date)
                    : futDateFormat.format(date);
                  const bgColor = item.result === 'W' ? '#26ad5f' : item.result === 'L' ? '#b35b5b' : 'transparent';
                  const isOpponentHome = item.homeTeam === item.opponent;

                  return (
                    <View style={styles.gameItem}>
                      <Text style={styles.gameOppText}>{item.opponent}</Text>
                      {item.homeScore !== undefined && item.awayScore !== undefined && (
                        <View style={styles.scoreContainer}>
                          <Text style={[styles.gameScoreText, { backgroundColor: bgColor }]}>
                            {isOpponentHome
                              ? `${item.awayScore} - ${item.homeScore}`
                              : `${item.homeScore} - ${item.awayScore}`}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={styles.gameDateText}>{formattedDate}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSchedule(false)}>
                <Text style={styles.closeText}>close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.button} onPress={() => setShowRoster(true)}>
          <Text style={styles.buttonText}>Roster</Text>
        </TouchableOpacity>

        <Modal
          visible={showRoster}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRoster(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
                <View style={styles.rosterContainer}>
                  <Text style={styles.columnHeader}>Forwards</Text>
                  {(roster?.forwards ?? []).map((player, index) => (
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '70%', alignSelf: 'center'}}>
                      <Text style={styles.playerText}>{player.country} {player.name}</Text>
                      <Text style={styles.playerText}>#{player.number}</Text>
                    </View>
                  ))}
                  <Text style={styles.columnHeader}>Defensemen</Text>
                  {(roster?.defensemen ?? []).map((player, index) => (
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '70%', alignSelf: 'center'}}>
                      <Text style={styles.playerText}>{player.country} {player.name}</Text>
                      <Text style={styles.playerText}>#{player.number}</Text>
                    </View>
                  ))}
                  <Text style={styles.columnHeader}>Goalies</Text>
                  {(roster?.goalies ?? []).map((player, index) => (
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '70%', alignSelf: 'center'}}>
                      <Text style={styles.playerText}>{player.country} {player.name}</Text>
                      <Text style={styles.playerText}>#{player.number}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowRoster(false)}>
                <Text style={styles.closeText}>close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.button}>
          <Text style={styles.buttonText}>Team stats</Text>
          <View style={styles.row}>
            <Text style={styles.gameText}>{teamStats?.rank}. in {teamStats?.division} division</Text>
            <Text style={styles.gameText}>{teamStats?.points}p / {teamStats?.gamesPlayed}gp</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.gameText}>Total wins / losses</Text>
            <Text style={styles.gameText}>{teamStats?.roadWins + teamStats?.homeWins} / {teamStats?.roadLosses + teamStats?.homeLosses}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.gameText}>Home</Text>
            <Text style={styles.gameText}>{teamStats?.homeWins} / {teamStats?.homeLosses}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.gameText}>Road</Text>
            <Text style={styles.gameText}>{teamStats?.roadWins} / {teamStats?.roadLosses}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.gameText}>Goals for</Text>
            <Text style={styles.gameText}>{teamStats?.goals} ({teamStats?.gfpg})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.gameText}>Goals against</Text>
            <Text style={styles.gameText}>{teamStats?.goalAgainst} ({teamStats?.gapg})</Text>
          </View>
        </View>
        <View style={{height: 40}} />
        </>)}
      </ScrollView>
      <LinearGradient
        colors={['transparent', 'black']}
        locations={[0.2, 0.85]} 
        style={styles.bottomGradient}
        pointerEvents="none" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 50,
    width: 50,
    contentFit: 'contain',
    marginRight: 10,
  },
  imageOpp: {
    height: 50,
    width: 50,
    contentFit: 'contain',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 150,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 15,
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'black',
    flex: 1,
  },
  scroll: {
    width: '100%',
    left: '5%',
    maxHeight: '95%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: 'white',
    marginTop: 60,
    width: '90%',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '700',
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    borderColor: 'white',
    borderWidth: 1,
    width: '90%',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    fontWeight: 500,
    color: 'white',
    fontSize: 16,
  },
  rosterContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  columnHeader: {
    textAlign: 'center',
    fontWeight: '700',
    color: 'white',
    fontSize: 14,
    marginVertical: 12,
  },
  playerText: {
    color: 'white',
    fontSize: 12,
    marginVertical: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  resultBox: {
    width: 30,
    height: 30,
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  resultText: {
    color: 'white',
    fontWeight: 'bold',
  },
  upcomingGamesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gameText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '400',
  },
  scoreContainer: {
    position: 'absolute',
    left: '53%',
  },
  gameOppText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  gameScoreText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  gameDateText: {
    textAlign: 'right',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  gameItem: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 10,
    alignItems: 'center',
  },
  gamesText: {
    fontWeight: '500',
    color: 'white',
    fontSize: 14,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  modalContent: {
    backgroundColor: 'black',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 1,
    flex: 1,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  closeText: {
    fontWeight: 500,
    color: 'black',
    fontSize: 16,
  },
  modalHint: {
    fontWeight: '300',
    color: 'grey', 
    textAlign: 'center', 
    width: '100%', 
    marginTop: 5, 
    fontSize: 12,
  },
});

export default TeamInfoScreen;