import Category from "@/assets/category"
import SeasonDropdown from "@/assets/seasondropdown"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { Image } from 'expo-image'
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, FlatList, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import colors from '../assets/colors'
import getFlagEmoji from '../assets/getflag'
import teamLogos from "../assets/logos"
import "./global.css"

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
  const [modalLoading, setModalLoading] = useState(false);
  const [skaterOn, setSkaterOn] = useState(true);
  const [skaterSort, setSkaterSort] = useState('points');
  const [goalieSort, setGoalieSort] = useState('save%');
  const [season, setSeason] = useState({"key": "current", "label": "season"});
  const [skaterStats, setSkaterStats] = useState([]);
  const [goalieStats, setGoalieStats] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [seasonModalVisible, setSeasonModalVisible] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const statType = skaterOn ? 'skater-stats-leaders' : 'goalie-stats-leaders';
        const response = await fetch(`https://api-web.nhle.com/v1/${statType}/${season.key}?limit=30`);
        const data = await response.json();

        if (skaterOn) {
          setSkaterStats(data);
        } else {
          setGoalieStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [season, skaterOn]);

  useEffect(() => {
    const fetchResults = async (search) => {
      try {
        setLoading(true)
        const response = await fetch(`https://search.d3.nhle.com/api/v1/search/player?culture=en-us&limit=30&q=${search}&active=${active}`);
        const data = await response.json();
        setResults(data)
      } catch (error) {
        console.error('Failed to fetch results:', error)
      } finally {
        setLoading(false)
      };
    };
    search !== '' && fetchResults(search);
  }, [search, active])

  const fetchPlayerStats = async (id) => {
    try {
      setModalLoading(true)
      const response = await fetch(`https://api-web.nhle.com/v1/player/${id}/landing`)
      const data = await response.json();
      setPlayerStats(data)
    } catch (error) {
      console.error('Failed fetching player stats:', error)
    } finally {
      setModalLoading(false)
    };
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
    const abbr = item.lastTeamAbbrev
  
    return (
      <TouchableOpacity className="justify-between items-center flex-row bg-neutral-800 w-full px-5 py-1 mb-1 rounded-md h-10"
        onPress={() => {
          const selected = { ...item, flag, abbr };
          setSelectedPlayer(selected);
          fetchPlayerStats(item.playerId);
          setShowStats(true);
        }}>
        <Text className="text-white font-bold text-md">{flag} {item.name}</Text>
        <View className="flex-row items-center gap-4">
        {item.sweaterNumber && item.lastTeamAbbrev && 
          <>
            <Text className="text-white font-bold text-md">#{item.sweaterNumber}</Text>
            <Image
              source={teamLogos[abbr]}
              style={{
                width: 30,
                height: 30,
                contentFit: 'contain',
              }}
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
  
  const renderTopItem = ({ item, index }) => {
    const abbr = item.teamAbbrev
    return (
      <TouchableOpacity className="justify-between items-center flex-row bg-neutral-800 w-full px-5 py-1 mb-1 rounded-md h-10"
        onPress={() => {
          const selected = { ...item, abbr };
          setSelectedPlayer(selected);
          fetchPlayerStats(item.id);
          setShowStats(true);
        }}>
        <View className="flex-row items-center gap-3">
          {item.sweaterNumber && item.teamAbbrev &&
            <>
              <Text className="text-white font-bold text-md">{index + 1}.</Text>
              <Image source={teamLogos[abbr]} 
                style={{
                  width: 30,
                  height: 30,
                  contentFit: 'contain',
                }}/>
              <Text className="text-white font-bold text-md">{item.firstName.default + ' ' +item.lastName.default}</Text>
            </>
          }
        </View>
        {item.value &&
          <View className="items-center">
            <Text className="text-white font-bold text-md">
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

  const StatItem = ({head, stat}) => {
    return (
      <View>
        <View className="p-2 justify-center items-center gap-1">
          <Text className="text-white text-sm">{head}</Text>
          <Text className="text-white text-xl font-extrabold">{stat}</Text>
        </View>
      </View>
    )
  }

  const StatContainer = ({head, category, position}) => {

    const [isRegular, setIsRegular] = useState(true)
    const subCategory = 
    isRegular && category === 'career' ? playerStats?.careerTotals?.regularSeason 
    : isRegular && category === 'subseason' ? playerStats?.featuredStats?.regularSeason?.subSeason
    : !isRegular && category === 'career' ? playerStats?.careerTotals?.playoffs
    : playerStats?.featuredStats?.playoffs?.subSeason

    return (
      <View className="bg-neutral-900 rounded-xl mt-2 justify-between">
        <View className="w-full border-b border-neutral-700 p-3 items-center justify-between flex-row">
          <Text className="text-white text-lg font-medium">{head}</Text>
          <Pressable 
            onPress={() => setIsRegular(prev => !prev)}
            className="bg-neutral-700 p-1 w-1/2 justify-center items-center rounded-full"
          > 
            <Text 
              className="text-neutral-900 text-sm font-medium py-1 px-3 bg-green-400 rounded-full" 
              style={{alignSelf: isRegular ? 'flex-end' : 'flex-start'}}
            >
              {isRegular ? 'regular season' : 'playoffs'}
            </Text>
          </Pressable>
        </View>
        {position !== 'G' && subCategory ? (
          <View className="flex-row justify-between py-5 px-2">
            <StatItem stat={subCategory.gamesPlayed} head={'games'}/>
            <StatItem stat={subCategory.goals} head={'goals'}/>
            <StatItem stat={subCategory.assists} head={'assists'}/>
            <StatItem stat={subCategory.points} head={'points'}/>
            <StatItem stat={subCategory.plusMinus} head={'+/-'}/>
          </View>
        ) : subCategory && (
          <View className="flex-row justify-between py-5 px-2">
            <StatItem stat={subCategory.gamesPlayed} head={'games'}/>
            <StatItem stat={subCategory.wins} head={'wins'}/>
            <StatItem stat={subCategory.goalsAgainstAvg.toFixed(2)} head={'gaa'}/>
            <StatItem stat={(subCategory.savePctg * 100).toFixed(1)} head={'save%'}/>
            <StatItem stat={subCategory.shutouts} head={'shutouts'}/>
          </View>
        )}
      </View>
    )
  }

  return (
    <View className="flex-1 items-center bg-black px-5">
      <LinearGradient
        colors={['black', 'transparent']}
        locations={[0,1]} 
        className="absolute z-40 left-0 right-0"
        style={{top: height * 0.13, height: height * 0.03}}
        pointerEvents="none" 
      />

      
      <View className="bg-neutral-800 w-full p-2 flex-row justify-between items-center rounded-xl z-50" style={{top: height * 0.07, height: height * 0.07}}>
        {searching ? (
          <>
            <TextInput 
              className="text-white text-normal ml-4 flex-1"
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
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => {setActive(!active)}} className={`items-center justify-center border-2 rounded-full px-2 py-1 ${active ? "border-green-400" : "border-neutral-500"}`}>
                <Text className="text-white font-bold text-md">{active ? 'active' : 'inactive'}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-3" onPress={() => {setSearching(!searching); setSearch(''); setTempText('')}}>
                <Ionicons name='close' size={24} color='white' />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>  
            <View className="flex-row items-center justify-between flex-1">
              <View className="h-full w-3/12 border-r border-neutral-400 pr-2 items-center justify-center">
                <Pressable className="h-full w-full bg-neutral-700 rounded-xl p-1" onPress={() => setSkaterOn(!skaterOn)} style={{justifyContent: skaterOn ? 'flex-start' : 'flex-end'}}>
                  <View className="items-center justify-center bg-green-400 min-h-3/4 rounded-lg p-1">
                    <Text className={'text-neutral-900 font-bold text-xs w-full text-center'}>{skaterOn ? 'skater' : 'goalie'}</Text>
                  </View>
                </Pressable>
              </View>
              <TouchableOpacity
                className='h-full px-3 border-r border-neutral-400 w-5/12'
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text className='text-white font-medium text-xs'>category:</Text>
                <Text className='text-white font-bold text-sm'>{skaterOn ? skaterSort : goalieSort}</Text>
              </TouchableOpacity>
              <Category 
                skaterOn={skaterOn} skaterSort={skaterSort} goalieSort={goalieSort} 
                setSkaterSort={setSkaterSort} setGoalieSort={setGoalieSort} 
                modalVisible={categoryModalVisible} setModalVisible={setCategoryModalVisible}
              />
              <TouchableOpacity
                className='h-full px-3 border-r border-neutral-400 w-4/12'
                onPress={() => setSeasonModalVisible(true)}
              >
                <Text className={`text-white font-bold ${season.key === 'current' ? 'text-xs' : 'text-sm'}`}>{season.key === 'current' ? 'season:' : season.label.slice(0,7)}</Text>
                <Text className={`text-white font-bold ${season.key === 'current' ? 'text-sm' : 'text-xs'}`}>{season.key === 'current' ? 'current' : season.label.slice(8)}</Text>
              </TouchableOpacity>
              <SeasonDropdown season={season} setSeason={setSeason} modalVisible={seasonModalVisible} setModalVisible={setSeasonModalVisible} />
              
            </View>
            <TouchableOpacity className="px-3" onPress={() => setSearching(!searching)}>
              <Ionicons name='search' size={24} color='white' />
            </TouchableOpacity>
            
          </>
        )}
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : (
        <FlatList 
          style={{
            maxHeight: height * 0.9,
            position: 'absolute',
            top: height * 0.10,
          }}
          showsVerticalScrollIndicator={false}
          data={searching ? results : getWhatStats()}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          ListHeaderComponent={<View  style={{height: height * 0.06}}/>}
          ListFooterComponent={<View  style={{height: height * 0.08}}/>}
          renderItem={searching ? renderItem : renderTopItem}
        />
      )}
      

      <Modal animationType="slide" transparent={true} visible={showStats} onRequestClose={() => setShowStats(false)}>
        <View className="flex-1 justify-end items-center" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
          <View className="items-center h-5/6 w-full bg-neutral-800 rounded-t-2xl elevation-lg shadow-black">
            <View className='items-center justify-between flex-row w-full px-5 h-16 border-b border-neutral-400'>
              <Text className="text-white text-lg font-bold">Player Stats</Text>
              <TouchableOpacity onPress={() => setShowStats(false)} className='pl-5 h-full items-center justify-center'>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            {modalLoading || !playerStats ? (
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size='large' color='white'/>
              </View>
            ) : (
              <ScrollView className="w-full px-3 flex-1" showsVerticalScrollIndicator={false}>
                <View className="rounded-xl mt-4 bg-neutral-900">
                  <View className="gap-5 flex-row items-center rounded-t-xl justify-between mb-3 py-3 px-5" style={{backgroundColor: colors[selectedPlayer?.abbr]}}>
                    <View className="flex-row gap-5">
                      <View className="h-20 w-20 rounded-xl overflow-hidden">
                        <Image 
                          contentFit="contain"
                          style={{ height: '100%', width: '100%' }}
                          source={playerStats?.headshot}
                        />
                      </View>
                      <View className="justify-end">
                        <Text className="text-white text-2xl font-bold">{playerStats?.firstName?.default}</Text>
                        <Text className="text-white text-2xl font-bold">{playerStats?.lastName?.default}</Text>
                      </View>
                    </View>
                    {selectedPlayer &&
                    <Image 
                      contentFit="contain"
                      style={{ height: 60, width: 60 }}
                      source={teamLogos[selectedPlayer.abbr]}
                    />}
                  </View>
                  
                  <View className="flex-row justify-between py-2 mb-2 px-3">
                    {playerStats?.birthDate && (
                      <View className="flex-row items-center gap-3">
                        <MaterialCommunityIcons name="cake-variant" color="white" size={18}/>
                        <Text className="text-white text-sm font-medium">
                          {getAge(playerStats.birthDate)} y/o
                        </Text>
                      </View>
                    )}
                    {playerStats?.birthDate && playerStats?.birthCountry && playerStats?.birthCity.default && (
                      <Text className="text-white text-sm font-medium">
                        born: {getFlagEmoji(playerStats?.birthCountry)} {playerStats.birthCity.default}, {playerStats.birthDate}
                      </Text>
                    )}
                  </View>
                  
                  <View className="flex-row justify-between py-2 mb-2 px-3">
                    {playerStats.shootsCatches && playerStats.position && (
                      <View className="flex-row items-center gap-3">
                        <MaterialCommunityIcons name="hockey-sticks" color="white" size={18}/>
                        <Text className="text-white text-sm font-medium">{playerStats.shootsAndCatches === 'L' ? 'Left' : 'Right'}</Text>
                      </View>
                    )}
                    {playerStats?.draftDetails?.overallPick ? (
                      <Text className="text-white text-sm font-medium">drafted {`${getOrdinalSuffix(playerStats.draftDetails.overallPick)} overall by ${playerStats.draftDetails.teamAbbrev} (${playerStats.draftDetails.year})`}</Text>
                    ) : (
                      <Text className="text-white text-sm font-medium">undrafted</Text>
                    )}
                  </View>

                  <View className="flex-row justify-between py-2 mb-2 px-3">
                    {playerStats.position && (
                      <View className="flex-row items-center gap-3">
                        <MaterialCommunityIcons name="pin" color="white" size={18}/>
                        <Text className="text-white text-sm font-medium">
                          {playerStats.position === 'G' ? 'Goalie' : playerStats.position === 'D' ? 'Defenseman' : playerStats.position === 'R' ? 'Right wing'
                          : playerStats.position === 'L' ? 'Left wing' : 'Center'}
                        </Text>
                      </View>
                    )}
                    {(selectedPlayer?.heightInCentimeters || playerStats?.weightInKilograms) && (
                      <View className="flex-row items-center gap-3">
                        <MaterialCommunityIcons name="human-male-height" color="white" size={18}/>
                        <Text className="text-white text-sm font-medium">{`${playerStats?.heightInCentimeters || '–'} cm & ${playerStats?.weightInKilograms || '–'} kg`}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <StatContainer 
                  head={playerStats?.featuredStats?.season.toString().slice(0,4) + '-' + playerStats?.featuredStats?.season.toString().slice(6)} 
                  category={'subseason'} 
                  position={playerStats.position} 
                />
                <StatContainer 
                  head={'career'} 
                  category={'career'} 
                  position={playerStats.position} 
                />

                <View className="h-8"/>

              </ScrollView>
            )}
          </View> 
        </View>
      </Modal>
      
      <LinearGradient
        colors={['transparent', 'black']}
        locations={[0.25, 0.85]} 
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: height * 0.12,
        }}
        pointerEvents="none" 
      />
    </View>
  )
}

export default players