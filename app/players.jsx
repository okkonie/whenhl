import { View, Text, TextInput, Dimensions, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Pressable } from "react-native"
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import getFlagEmoji from '../assets/getflag'
import teamLogos from "../assets/logos"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const {width, height} = Dimensions.get('window')

const players = () => {
  const [tempText, setTempText] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(true);
  const [playerStats, setPlayerStats] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async (search) => {
      const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=30&q=${search}&active=${active}`);
      const data = await response.json();
      setResults(data)
      console.log('new results:', data)
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

  return (
    <View style={{flex: 1, alignItems: 'center', backgroundColor: 'black'}}>

      <LinearGradient
        colors={['black', 'transparent']}
        locations={[0, 0.8 ]} 
        style={styles.topGradient}
        pointerEvents="none" 
      />
      
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
        <Pressable onPress={() => {setActive(!active)}}>
          <Text style={styles.activeText}>{active ? 'active' : 'inactive'}</Text>
        </Pressable>
      </View>

      {results.length > 0 && search !== '' ? (
        <FlatList 
          style={styles.list}
          showsVerticalScrollIndicator={false}
          data={results}
          keyExtractor={(item, index) => item.playerId?.toString() || index.toString()}
          ListHeaderComponent={<View  style={{height: 50}}/>}
          ListFooterComponent={<View  style={{height: 80}}/>}
          renderItem={renderItem}
        />
      ) : (
        <Text style={[styles.text, {top: 130}]}>no players found</Text>
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
                  {selectedPlayer?.name}
                  {playerStats?.birthDate && ` (${getAge(playerStats.birthDate)})`}
                </Text>

                {playerStats?.birthDate && selectedPlayer?.flag && selectedPlayer?.birthCity && (
                  <View style={styles.row}>
                    <Text style={styles.text}>born:</Text>
                    <Text style={styles.text}>
                      {`${selectedPlayer.flag} ${selectedPlayer.birthCity} | ${playerStats.birthDate}`}
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
                    <Text style={styles.text}>shoots:</Text>
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
                      {`${selectedPlayer?.heightInCentimeters || '–'} cm | ${playerStats?.weightInKilograms || '–'} kg`}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    height: height * 0.9,
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
  list: {
    maxHeight: height * 0.95,
    top: 50,
  },
  input: {
    position: 'absolute',
    top: height * 0.03,
    width: width * 0.9,
    height: height * 0.06,
    borderRadius: height * 0.02,
    backgroundColor: '#242424',
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  textInput: {
    width: width * 0.65,
    height: '100%',
    marginLeft: 20,
    color: 'white',
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
    top: height * 0.05,
    left: 0,
    right: 0,
    height: 100,
  },
  activeText: {
    fontWeight: 600,
    color: 'white',
    borderLeftWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    fontWeight: 600,
    color: 'white',
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
    paddingHorizontal: 30,
    flexDirection: 'row',
    height: height * 0.05,
    borderRadius: height * 0.015,
    marginTop: 8,
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