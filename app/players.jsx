import SeasonDropdown from "@/assets/seasondropdown"
import { Ionicons } from "@expo/vector-icons"
import { Image } from 'expo-image'
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import getFlagEmoji from '../assets/getflag'
import teamLogos from "../assets/logos"
const {width, height} = Dimensions.get('window')

const players = () => {
  const [tempText, setTempText] = useState('');
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(true);
  const [playerStats, setPlayerStats] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skaterOn, setSkaterOn] = useState(true);
  const [skaterSort, setSkaterSort] = useState('points');
  const [goalieSort, setGoalieSort] = useState('save%');
  const [season, setSeason] = useState({"key": "current", "label": "season"});
  const [skaterStats, setSkaterStats] = useState([]);
  const [goalieStats, setGoalieStats] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchStats = async (season) => {
      setLoading(true)
      const response = await fetch(`https://api-web.nhle.com/v1/skater-stats-leaders/${season.key}?limit=30`);
      const response2 = await fetch(`https://api-web.nhle.com/v1/goalie-stats-leaders/${season.key}?limit=30`);
      const data = await response.json();
      const data2 = await response2.json();
      setSkaterStats(data)
      setGoalieStats(data2)
      setLoading(false)
    };

    fetchStats(season);
  }, [season]);

  useEffect(() => {
    const fetchResults = async (search) => {
      const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=30&q=${search}&active=${active}`);
      const data = await response.json();
      setResults(data)
    };
    search !== '' && fetchResults(search);
  }, [search, active])

  const fetchPlayerStats = async (id) => {
    setLoading(true)
    const response = await fetch(`https://api-web.nhle.com/v1/player/${id}/landing`)
    const data = await response.json();
    setPlayerStats(data)
    setLoading(false)
  };

  const getOrdinalSuffix = (num) => {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
  
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${num}th`;
    }
  
    switch (lastDigit) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  };

  const getAge = (birthDateStr) => {
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
  
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  
    if (!hasHadBirthdayThisYear) age--;
  
    return age;
  };

  const SkaterSortButton = ({ sort, skaterSort, setSkaterSort }) => {
    return (
      <TouchableOpacity key={sort} style={[{borderColor: skaterSort === sort ? '#82ff80' : 'transparent',},styles.sortButton]} onPress={() => setSkaterSort(sort)}>
        <Text style={styles.text2}>{sort}</Text>
      </TouchableOpacity>
    );
  };
  const GoalieSortButton = ({ sort, goalieSort, setGoalieSort }) => {
    return (
      <TouchableOpacity key={sort} style={[{borderColor: goalieSort === sort ? '#82ff80' : 'transparent',},styles.sortButton]} onPress={() => setGoalieSort(sort)}>
        <Text style={styles.text2}>{sort}</Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: false });
    }
  }, [skaterOn]);

  const renderItem = ({ item }) => {
    const flag = item.birthCountry ? getFlagEmoji(item.birthCountry) : '🏳️';
  
    return (
      <TouchableOpacity style={styles.resultItem} 
        onPress={() => {
          const selected = { ...item, flag };
          setSelectedPlayer(selected);
          fetchPlayerStats(item.playerId);
          setShowStats(true);
        }}>
        <Text style={styles.text}>{flag + '   ' + item.name}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        {item.sweaterNumber && item.lastTeamAbbrev && 
          <>
            <Text style={styles.text}>#{item.sweaterNumber}</Text>
            <Image
              source={teamLogos[item.lastTeamAbbrev]}
              style={styles.image}
            />
          </>
        }
        </View>
      </TouchableOpacity>
    );
  };

  const getWhatStats = () => {
    if (skaterOn) {
      if (skaterSort === 'points') {return skaterStats?.points}
      if (skaterSort === 'goals') {return skaterStats?.goals}
      if (skaterSort === 'assists') {return skaterStats?.assists}
      if (skaterSort === '+/-') {return skaterStats?.plusMinus}
      if (skaterSort === 'time on ice') {return skaterStats?.toi}
      if (skaterSort === 'pp goals') {return skaterStats?.goalsPp}
      if (skaterSort === 'faceoff%') {return skaterStats?.faceoffLeaders}
      if (skaterSort === 'penalty mins') {return skaterStats?.penaltyMins}
    } else {
      if (goalieSort === 'save%') {return goalieStats?.savePctg}
      if (goalieSort === 'goals against') {return goalieStats?.goalsAgainstAverage}
      if (goalieSort === 'wins') {return goalieStats?.wins}
      if (goalieSort === 'shutouts') { return goalieStats?.shutouts}
      };
    };
  
  const renderOtherItem = ({ item, index }) => {
    return (
      <TouchableOpacity style={styles.resultItem}
        onPress={() => {
          const selected = { ...item };
          setSelectedPlayer(selected);
          fetchPlayerStats(item.id);
          setShowStats(true);
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
          {item.sweaterNumber && item.teamAbbrev &&
            <>
              <Text style={styles.text}>{index + 1}.</Text>
              <Image
                source={teamLogos[item.teamAbbrev]}
                style={styles.image}
              />
              <Text style={styles.text}>{item.firstName.default + ' ' +item.lastName.default}</Text>
            </>
          }
        </View>
        {item.value &&
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Text style={styles.text}>
              {skaterOn && skaterSort === 'time on ice' ? (item.value / 60).toFixed(2) 
              : skaterOn && skaterSort === 'faceoff%' ? (item.value * 100).toFixed(2) + '%'
              : !skaterOn && goalieSort === 'save%' ? item.value.toFixed(3) 
              : !skaterOn && goalieSort === 'goals against' ? item.value.toFixed(2)
              : item.value}</Text>
          </View>
        }
        
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1, alignItems: 'center', backgroundColor: 'black'}}>
      <LinearGradient
        colors={['black', 'transparent']}
        locations={[0, 0.8 ]} 
        style={[{top: searching ? height * 0.05 : height * 0.1}, styles.topGradient]}
        pointerEvents="none" 
      />

      {searching ? (
        <View style={styles.input}>
          <TextInput 
            style={styles.textInput} 
            placeholder="search for players" 
            placeholderTextColor={'#ccc'}
            cursorColor={'#ccc'}
            value={tempText}
            onChangeText={setTempText}
            onEndEditing={() => {
              const formattedText = tempText
                .replace(/[^a-zA-Z\s]/g, '') 
              setSearch(formattedText);
            }}
          />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => {setActive(!active)}}>
              <Text style={[{borderColor: active ? '#82ff80' : '#ccc'}, styles.activeText]}>{active ? 'active' : 'inactive'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{paddingHorizontal: 15}} onPress={() => {setSearching(!searching); setSearch('')}}>
              <Ionicons name='close' size={24} color='white' />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={{flexDirection: 'column', alignItems: 'center', zIndex: 20, top: 50, height: height * 0.12}}>

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: width * 0.9}}>
              <View style={styles.skaterButton}>
                <TouchableOpacity style={[{borderColor: skaterOn ? '#82ff80' : '#242424'}, styles.skaterOption]} onPress={() => setSkaterOn(true)}>
                  <Text style={styles.text}>skater</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[{borderColor: skaterOn ? '#242424' : '#82ff80'}, styles.skaterOption]} onPress={() => setSkaterOn(false)}>
                  <Text style={styles.text}>goalie</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.searchButton} onPress={() => setSearching(!searching)}>
                <Ionicons name='search' size={24} color='white' />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef}
              contentContainerStyle={{
                flexDirection: 'row',
                paddingHorizontal: width * 0.05,
              }}
              style={{
                width: width,
                marginTop: 10, // add spacing if needed
              }}>
              {skaterOn ? (
                <>
                  <SeasonDropdown season={season} setSeason={setSeason} />
                  <SkaterSortButton sort="points" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                  <SkaterSortButton sort="goals" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                  <SkaterSortButton sort="assists" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                  <SkaterSortButton sort="+/-" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                  <SkaterSortButton sort="time on ice" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                  <SkaterSortButton sort="pp goals" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                  <SkaterSortButton sort="faceoff%" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                  <SkaterSortButton sort="penalty mins" skaterSort={skaterSort} setSkaterSort={setSkaterSort} />
                </>
              ) : (
                <>
                  <SeasonDropdown season={season} setSeason={setSeason} />
                  <GoalieSortButton sort="save%" goalieSort={goalieSort} setGoalieSort={setGoalieSort} />
                  <GoalieSortButton sort="goals against" goalieSort={goalieSort} setGoalieSort={setGoalieSort} />
                  <GoalieSortButton sort="wins" goalieSort={goalieSort} setGoalieSort={setGoalieSort} />
                  <GoalieSortButton sort="shutouts" goalieSort={goalieSort} setGoalieSort={setGoalieSort} />
                </>
              )}
            </ScrollView>
          </View>
          <FlatList 
            style={{
              maxHeight: height * 0.9,
              position: 'absolute',
              top: height * 0.1,
            }}
            showsVerticalScrollIndicator={false}
            data={getWhatStats()}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            ListHeaderComponent={<View  style={{height: height * 0.08}}/>}
            ListFooterComponent={<View  style={{height: 100}}/>}
            renderItem={renderOtherItem}
          />
        </>
      )}

      {results.length > 0 && search !== '' ? (
        <FlatList 
          style={{
            maxHeight: height * 0.95,
            position: 'absolute',
            top: height * 0.05,
          }}
          showsVerticalScrollIndicator={false}
          data={results}
          keyExtractor={(item, index) => item.playerId?.toString() || index.toString()}
          ListHeaderComponent={<View  style={{height: height * 0.09}}/>}
          ListFooterComponent={<View  style={{height: 100}}/>}
          renderItem={renderItem}
        />
      ) : (
        <View style={{flex: 1, backgroundColor: 'black'}} />
      )}

      <Modal animationType="slide" transparent={true} visible={showStats} onRequestClose={() => setShowStats(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <TouchableOpacity onPress={() => setShowStats(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            {loading || !playerStats ? (
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size='large' color='white'/>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.head}>
                  {playerStats?.firstName?.default + ' ' + playerStats?.lastName?.default}
                  {playerStats?.birthDate && ` (${getAge(playerStats.birthDate)})`}
                </Text>

                {playerStats?.birthDate && playerStats?.birthCountry && playerStats?.birthCity.default && (
                  <View style={styles.row}>
                    <Text style={styles.text}>born:</Text>
                    <Text style={styles.text}>
                      {`${getFlagEmoji(playerStats?.birthCountry)} ${playerStats.birthCity.default} | ${playerStats.birthDate}`}
                    </Text>
                  </View>
                )}

                {playerStats?.draftDetails?.overallPick && (
                  <View style={styles.row}>
                    <Text style={styles.text}>draft:</Text>
                    <Text style={styles.text}>
                      {`${getOrdinalSuffix(playerStats.draftDetails.overallPick)} ${playerStats.draftDetails.year} by ${playerStats.draftDetails.teamAbbrev}`}
                    </Text>
                  </View>
                )}

                {selectedPlayer?.lastSeasonId && selectedPlayer?.lastSeasonId.length >= 5 && (
                  <View style={styles.row}>
                    <Text style={styles.text}>last season:</Text>
                    <Text style={styles.text}>
                      {`${selectedPlayer.lastSeasonId.slice(0, 4)}-${selectedPlayer.lastSeasonId.slice(6,8)}`}
                    </Text>
                  </View>
                )}

                {playerStats.shootsCatches && (
                  <View style={styles.row}>
                    <Text style={styles.text}>shoots/catches:</Text>
                    <Text style={styles.text}>
                      {playerStats.shootsAndCatches === 'L' ? 'left' : 'right'}
                    </Text>
                  </View>
                )}

                {playerStats.position && (
                  <View style={styles.row}>
                    <Text style={styles.text}>position:</Text>
                    <Text style={styles.text}>
                      {playerStats.position}
                    </Text>
                  </View>
                )}

                {(selectedPlayer?.heightInCentimeters || playerStats?.weightInKilograms) && (
                  <View style={styles.row}>
                    <Text style={styles.text}>size:</Text>
                    <Text style={styles.text}>
                      {`${playerStats?.heightInCentimeters || '–'} cm | ${playerStats?.weightInKilograms || '–'} kg`}
                    </Text>
                  </View>
                )}

                {playerStats?.featuredStats?.regularSeason?.subSeason && playerStats?.featuredStats?.season && playerStats.position === 'G' && (
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {`${playerStats?.featuredStats?.season.toString().slice(0,4)}-${playerStats?.featuredStats?.season.toString().slice(6,8)}`}
                    </Text>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>gp</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.gamesPlayed}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>wins</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.wins}</Text>
                      </View>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>so</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.shutouts}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>ga</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.goalsAgainstAvg.toFixed(2)}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>sv%</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.savePctg.toFixed(3) * 100}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {playerStats?.featuredStats?.regularSeason?.career && playerStats.position === 'G' && (
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>career</Text>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>gp</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.gamesPlayed}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>wins</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.wins}</Text>
                      </View>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>so</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.shutouts}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>ga</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.goalsAgainstAvg.toFixed(2)}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>sv%</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.savePctg.toFixed(3) * 100}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {playerStats?.featuredStats?.regularSeason?.subSeason && playerStats?.featuredStats?.season && playerStats.position !== 'G' && (
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {`${playerStats?.featuredStats?.season.toString().slice(0,4)}-${playerStats?.featuredStats?.season.toString().slice(6,8)}`}
                    </Text>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>gp</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.gamesPlayed}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>g</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.goals}</Text>
                      </View>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>a</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.assists}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>p</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.points}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>+/-</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.subSeason.plusMinus}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {playerStats?.featuredStats?.regularSeason?.career && playerStats.position !== 'G' && (
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>career</Text>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>gp</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.gamesPlayed}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>g</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.goals}</Text>
                      </View>
                      <View style={styles.statItem}>
                      <Text style={styles.greytext}>a</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.assists}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>p</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.points}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.greytext}>+/-</Text>
                        <Text style={styles.statValue}>{playerStats?.featuredStats?.regularSeason?.career.plusMinus}</Text>
                      </View>
                    </View>
                  </View>
                )}

              </View>
            )}
          </View> 
        </View>
      </Modal>
      
      <LinearGradient
        colors={['transparent', 'black']}
        locations={[0.25, 0.85]} 
        style={styles.bottomGradient}
        pointerEvents="none" 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  sortButton: {
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: '#242424',
    marginHorizontal: 3,
    height: height * 0.035,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skaterButton: {
    width: '84%',
    height: height * 0.06,
    backgroundColor: '#242424',
    borderRadius: height * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  skaterOption: {
    borderWidth: 2, 
    width: '44%', 
    alignItems: 'center',
    justifyContent: 'center',
    height: '70%',
    borderRadius: height * 0.015,
  },
  searchButton: {
    width: '14%',
    height: height * 0.06,
    backgroundColor: '#242424',
    borderRadius: height * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    height: height * 0.85,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    width: width,
    backgroundColor: '#242424'
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: width * 0.8,
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  head: {
    fontWeight: 600,
    color: 'white',
    fontSize: 20,
    marginBottom: 30,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: width * 0.05,
  },
  input: {
    top: height * 0.05,
    zIndex: 20,
    justifyContent: 'space-between',
    width: width * 0.9,
    height: height * 0.06,
    borderRadius: height * 0.02,
    backgroundColor: '#242424',
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    marginLeft: 20,
    color: 'white',
    width: '50%',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 120,
  },
  topGradient: {
    position: 'absolute',
    zIndex: 10,
    left: 0,
    right: 0,
    height: 100,
  },
  activeText: {
    fontWeight: 600,
    color: 'white',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    fontWeight: 600,
    color: 'white',
  },
  text2: {
    fontWeight: 600,
    color: 'white',
    fontSize: 12,
  },
  greytext: {
    fontWeight: 600,
    color: '#242424',
  },
  image: {
    width: 30,
    height: 30,
    contentFit: 'contain',
  },
  resultItem: {
    backgroundColor: '#242424',
    width: width * 0.85,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    flexDirection: 'row',
    height: height * 0.05,
    borderRadius: height * 0.015,
    marginTop: height * 0.008,
  },
  stat: {
    width: width * 0.85,
    backgroundColor: '#ccc',
    padding: 20,
    marginTop: 15,
    borderRadius: 15,
  },
  statRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    flexDirection: 'row',
  },
  statItem: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 800,
    color: '#242424',
  },
})

export default players