import Category from "@/assets/category"
import PlayerStats from "@/assets/playerstats"
import SeasonDropdown from "@/assets/seasondropdown"
import { Ionicons } from "@expo/vector-icons"
import { Image } from 'expo-image'
import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, FlatList, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native"
import getFlagEmoji from '../assets/getflag'
import teamLogos from "../assets/logos"
import './global.css'

const {width, height} = Dimensions.get('window')

const players = () => {
  const [tempText, setTempText] = useState('');
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const renderItem = ({ item }) => {
    const flag = item.birthCountry ? getFlagEmoji(item.birthCountry) : '🏳️';
    const abbr = item.lastTeamAbbrev

    return (
      <TouchableOpacity className="justify-between items-center flex-row bg-neutral-900 w-full px-5 py-1 mb-1 rounded-md h-10"
        onPress={() => {
          const selected = {id: item.playerId, abbr: item.lastTeamAbbrev};
          setShowStats(true);
          setSelectedPlayer(selected)
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
  
  const renderTopItem = ({ item, index }) => {
    const abbr = item.teamAbbrev
    return (
      <TouchableOpacity className="justify-between items-center flex-row bg-neutral-900 w-full px-5 py-1 mb-1 rounded-md h-10"
        onPress={() => {
          const selected = {id: item.id, abbr: item.teamAbbrev};
          setShowStats(true);
          setSelectedPlayer(selected)
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

  return (
    <View className="flex-1 items-center bg-black">

      <View 
        className='bg-neutral-900 rounded-b-3xl flex-row justify-evenly z-50 pb-3 w-full items-end px-4'
        style={{height: height * 0.13}}

      >
        {searching ? (
          <View className="items-center flex-row h-14 w-full">
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
          </View>
        ) : (
          <View className="items-center flex-row w-full h-14 justify-between">
            <View className="flex-row flex-1 px-2 h-full items-center justify-between">
              <Pressable className={`bg-neutral-800 rounded-md w-[20%] h-3/4 p-1`} onPress={() => setSkaterOn(!skaterOn)} style={{justifyContent: skaterOn ? 'flex-start' : 'flex-end'}}>
                <View className="items-center justify-center bg-green-400 h-3/4 rounded-md p-1">
                  <Text className={'text-neutral-900 font-bold text-xs w-full text-center'}>{skaterOn ? 'skater' : 'goalie'}</Text>
                </View>
              </Pressable>
              <TouchableOpacity
                className='w-[38%] bg-neutral-800 rounded-md h-3/4 py-1 px-2'
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text className='text-white font-medium text-xs'>category:</Text>
                <Text className='text-white font-extrabold text-sm'>{skaterOn ? skaterSort : goalieSort}</Text>
              </TouchableOpacity>
              <Category 
                skaterOn={skaterOn} skaterSort={skaterSort} goalieSort={goalieSort} 
                setSkaterSort={setSkaterSort} setGoalieSort={setGoalieSort} 
                modalVisible={categoryModalVisible} setModalVisible={setCategoryModalVisible}
              />
              <TouchableOpacity
                className='w-[38%] bg-neutral-800 rounded-md h-3/4 py-1 px-2'
                onPress={() => setSeasonModalVisible(true)}
              >
                <Text className={`text-white  ${season.key === 'current' ? 'text-xs font medium' : 'text-sm font-bold'}`}>{season.key === 'current' ? 'season:' : season.label.slice(0,7)}</Text>
                <Text className={`text-white font-bold ${season.key === 'current' ? 'text-sm font-extrabold' : 'text-xs font-bold'}`}>{season.key === 'current' ? 'current' : season.label.slice(8)}</Text>
              </TouchableOpacity>
            </View>
            
            <SeasonDropdown season={season} setSeason={setSeason} modalVisible={seasonModalVisible} setModalVisible={setSeasonModalVisible} />
              
            <TouchableOpacity className="px-3" onPress={() => setSearching(!searching)}>
              <Ionicons name='search' size={24} color='white' />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center align-center gap-5">
          <ActivityIndicator size='small' color='white'/>
          <Text className="text-xs text-white font-medium text-center">Finding players</Text>
        </View>
      ) : (
        <FlatList 
          contentContainerClassName="px-4"
          showsVerticalScrollIndicator={false}
          data={searching ? results : getWhatStats()}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          ListHeaderComponent={<View  style={{height: height * 0.01}}/>}
          ListFooterComponent={<View  style={{height: height * 0.08}}/>}
          renderItem={searching ? renderItem : renderTopItem}
        />
      )}

      {showStats && <PlayerStats showStats={showStats} setShowStats={setShowStats} playerId={selectedPlayer.id} abbr={selectedPlayer.abbr}/>}
      
      <LinearGradient
        colors={['transparent', 'black']}
        locations={[0, 1]} 
        style={{
          position: 'absolute',
          bottom: height * 0.065,
          left: 0,
          right: 0,
          height: height * 0.01,
        }}
        pointerEvents="none" 
      />
      <LinearGradient
        colors={['black', 'transparent']}
        locations={[0.25, 0.7]} 
        style={{
          position: 'absolute',
          top: height * 0.12,
          left: 0,
          right: 0,
          height: height * 0.03,
        }}
        pointerEvents="none" 
      />
    </View>
  )
}

export default players