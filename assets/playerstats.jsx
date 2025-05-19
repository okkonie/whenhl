import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import '../app/global.css';
import colors from './colors';
import getFlagEmoji from './getflag';
import teamLogos from './logos';


const PlayerStats = ({showStats, setShowStats, playerId, abbr }) => {
  const [playerStats, setPlayerStats] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
  const fetchPlayerStats = async (id) => {
    try {
      setModalLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/player/${id}/landing`);
      const data = await response.json();
      setPlayerStats(data);
    } catch (error) {
      console.error('Failed fetching player stats:', error);
    } finally {
      setModalLoading(false);
    }
  };

  fetchPlayerStats(playerId);
}, [playerId]);

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
        <View className="w-full border-b border-neutral-700 py-4 px-5 items-center justify-between flex-row">
          <Text className="text-white text-lg font-medium">{head}</Text>
          <Pressable 
            onPress={() => setIsRegular(prev => !prev)}
            className="bg-neutral-700 p-1 justify-center rounded-full w-28"
          > 
            <Text 
              className={`text-neutral-900 text-xs font-bold py-1 w-2/3 text-center bg-green-400 rounded-full ${isRegular ? 'self-end' : 'self-start'}`}
            >
              {isRegular ? 'regular' : 'playoffs'}
            </Text>
          </Pressable>
        </View>
        {subCategory && (
          position !== 'G' ? (
            <View className="flex-row justify-between py-3 px-2">
              <StatItem stat={subCategory.gamesPlayed} head={'games'} />
              <StatItem stat={subCategory.goals} head={'goals'} />
              <StatItem stat={subCategory.assists} head={'assists'} />
              <StatItem stat={subCategory.points} head={'points'} />
              <StatItem stat={subCategory.plusMinus} head={'+/-'} />
            </View>
          ) : (
            <View className="flex-row justify-between py-5 px-2">
              <StatItem stat={subCategory.gamesPlayed} head={'games'} />
              <StatItem stat={subCategory.wins} head={'wins'} />
              <StatItem stat={subCategory.goalsAgainstAvg.toFixed(2)} head={'gaa'} />
              <StatItem stat={(subCategory.savePctg * 100).toFixed(1)} head={'save%'} />
              <StatItem stat={subCategory.shutouts} head={'shutouts'} />
            </View>
          )
        )}
      </View>
    )
  }

  return (
    <Modal animationType="slide" transparent={true} visible={showStats} onRequestClose={() => setShowStats(false)}>
      <View className="flex-1 justify-end items-center" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
        <View className="items-center h-5/6 w-full bg-neutral-800 rounded-t-2xl">
          <View className='items-center justify-between flex-row w-full px-5 h-16 border-b border-neutral-400'>
            <Text className="text-white text-lg font-bold">Player Stats</Text>
            <TouchableOpacity onPress={() => setShowStats(false)} className='pl-5 h-full items-center justify-center'>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {modalLoading || !playerStats ? (
            <View className="flex-1 justify-center align-center gap-5">
              <ActivityIndicator size='small' color='white'/>
              <Text className="text-xs text-white font-medium text-center">Getting player stats</Text>
            </View>
          ) : (
            <ScrollView className="w-full px-3 flex-1" showsVerticalScrollIndicator={false}>
              <View className="rounded-xl bg-neutral-900 mt-4">
                <View className="gap-5 flex-row items-center rounded-t-xl justify-between mb-3 py-3 px-5" style={{backgroundColor: colors[abbr ? abbr : '#171717']}}>
                  <View className="flex-row gap-5">
                    <View className="h-20 w-20 rounded-full overflow-hidden">
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
                  {abbr &&
                    <Image 
                      contentFit="contain"
                      style={{ height: 60, width: 60 }}
                      source={teamLogos[abbr]}
                    />
                  }
                </View>
                
                <View className="flex-row justify-between p-4">
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
                
                <View className="flex-row justify-between p-4">
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

                <View className="flex-row justify-between p-4">
                  {playerStats.position && (
                    <View className="flex-row items-center gap-3">
                      <MaterialCommunityIcons name="pin" color="white" size={18}/>
                      <Text className="text-white text-sm font-medium">
                        {playerStats.position === 'G' ? 'Goalie' : playerStats.position === 'D' ? 'Defenseman' : playerStats.position === 'R' ? 'Right wing'
                        : playerStats.position === 'L' ? 'Left wing' : 'Center'}
                      </Text>
                    </View>
                  )}
                  {(playerStats?.heightInCentimeters || playerStats?.weightInKilograms) && (
                    <View className="flex-row items-center gap-3">
                      <MaterialCommunityIcons name="human-male-height" color="white" size={18}/>
                      <Text className="text-white text-sm font-medium">{`${playerStats?.heightInCentimeters || '–'} cm & ${playerStats?.weightInKilograms || '–'} kg`}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {(playerStats?.featuredStats?.regularSeason?.subSeason || playerStats?.featuredStats?.playoffs?.subSeason) && (
                <StatContainer 
                  head={playerStats?.featuredStats?.season.toString().slice(0,4) + '-' + playerStats?.featuredStats?.season.toString().slice(6)} 
                  category={'subseason'} 
                  position={playerStats.position} 
                />
              )}

              {(playerStats?.careerTotals?.regularSeason || playerStats?.careerTotals?.playoffs) && (
                <StatContainer 
                  head={'career'} 
                  category={'career'} 
                  position={playerStats.position} 
                />
              )}

              <View className="h-8"/>
            </ScrollView>
          )}
        </View> 
      </View>
    </Modal>
  );
};

export default PlayerStats;