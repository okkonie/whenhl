import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import '../app/global.css';
import teamLogos from './logos';

const Playoffs = ({show, setShow}) => {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState({});
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        const year = new Date().getFullYear();

        if (!hasData) {
          const response = await fetch(`https://api-web.nhle.com/v1/playoff-bracket/${year}`)
          if (response.ok) {
            const data = await response.json()
            setGames(data)
            setHasData(true)
          } else {
            setHasData(false)
          }
        } else {
          return
        }
      } catch (error) {
        console.error('failure: ', error)
      } finally {
        setLoading(false)
      };
    };
    fetchGames();
  }, [])
  
  const RoundItem = ({ item }) => {
    return (
      <View className="bg-neutral-900 border border-neutral-500 rounded-xl">
        <View className="flex-row border-neutral-500 border-b gap-3 py-1.5 px-3 items-center justify-between">
          {item.topSeedTeam && item.topSeedTeam.abbrev !== 'TBD' ? 
          <Image
            style={{ height: 28, width: 28, contentFit: 'contain' }}
            source={teamLogos[item.topSeedTeam?.abbrev] || teamLogos['DEFAULT']}
          /> : <Text className='text-xs font-white font-black text-white'>TBD</Text>}
          <Text className={`${item.bottomSeedWins !== 4 ? 'text-white' : 'text-neutral-500'} text-lg font-black`}>{item.topSeedWins ?? 0}</Text>
        </View>
        <View className="flex-row gap-3 py-1.5 px-3 items-center justify-between">
          {item.bottomSeedTeam && item.bottomSeedTeam.abbrev !== 'TBD' ?
          <Image
            style={{ height: 28, width: 28, contentFit: 'contain' }}
            source={teamLogos[item.bottomSeedTeam?.abbrev] || teamLogos['DEFAULT']}
          /> : <Text className='text-xs font-white font-black text-white'>TBD</Text>}
          <Text className={`${item.topSeedWins !== 4 ? 'text-white' : 'text-neutral-500'} text-lg font-black`}>{item.bottomSeedWins ?? 0}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal animationType="slide" transparent={false} visible={show} onRequestClose={() => setShow(false)}>
      <View className="flex-1 justify-end items-center bg-black">
        <View className="items-center h-full w-full bg-neutral-900 rounded-t-2xl elevation-lg shadow-black">
          <View className='items-center justify-between flex-row w-full px-5 h-16 border-b border-neutral-400'>
            <Text className="text-white text-lg font-bold">Playoffs</Text>
            <TouchableOpacity onPress={() => setShow(false)} className='pl-5 h-full items-center justify-center'>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} className='w-full'>
            {(!hasData || loading) ? (
              <View className="flex-1 justify-center align-center gap-5">
                <ActivityIndicator size='small' color='white'/>
                <Text className="text-xs text-white font-medium text-center">Loading matchups</Text>
              </View>
            ) : (
              <View className='px-4 py-8'>

                <View className='flex-row justify-between'>
                  <RoundItem item={games.series[0]}/>
                  <RoundItem item={games.series[1]}/>
                  <RoundItem item={games.series[2]}/>
                  <RoundItem item={games.series[3]}/>
                </View>

                <View className='w-3/4 self-center pt-8 flex-row justify-between items-start'>
                  <RoundItem item={games.series[8]}/>
                  <View>
                    <Text className='font-bold text-white text-lg text-center mb-8'>East</Text>
                    <RoundItem item={games.series[12]}/>
                  </View>
                  <RoundItem item={games.series[9]}/>
                </View>

                <View className='bg-neutral-900 border border-neutral-500 rounded-xl my-9 h-24 items-center flex-row justify-between p-2'>

                  <View className='h-full aspect-square bg-neutral-800 rounded-lg items-center justify-center'>
                    {games.series[14].topSeedTeam && games.series[14].topSeedTeam.abbrev !== 'TBD' ?
                      <Image
                        style={{ height: '100%', width: '100%', contentFit: 'contain' }}
                        source={teamLogos[games.series[14].topSeedTeam?.abbrev] || teamLogos['DEFAULT']}
                      /> : <Text className='text-xs font-white font-black text-white'>TBD</Text>
                    }
                  </View>

                  <View className='items-center justify-evenly h-full'>
                    {(games.series[14].topSeedWins > 0 || games.series[14].bottomSeedWins) > 0 && (
                      <Text className={`${games.series[14].topSeedWins !== 4 ? 'text-white' : 'text-neutral-500'} text-3xl font-black`}>
                        {games.series[14].topSeedWins ?? 0} - {games.series[14].bottomSeedWins ?? 0}
                      </Text>
                    )}
                    <Text className='text-neutral-200 font-bold text-md'>Stanley Cup Finals</Text>
                  </View>
                    

                  <View className='h-full aspect-square bg-neutral-800 rounded-lg items-center justify-center'>
                    {games.series[14].bottomSeedTeam && games.series[14].bottomSeedTeam.abbrev !== 'TBD' ?
                      <Image
                        style={{ height: '100%', width: '100%', contentFit: 'contain' }}
                        source={teamLogos[games.series[14].bottomSeedTeam?.abbrev] || teamLogos['DEFAULT']}
                      /> : <Text className='text-xs font-white font-black text-white'>TBD</Text>
                    }
                  </View>
                            
                </View>

                <View className='w-3/4 self-center pb-8 flex-row justify-between items-end'>
                  <RoundItem item={games.series[10]}/>
                  <View className='justify-end'>
                    <RoundItem item={games.series[13]}/>
                    <Text className='font-bold text-white text-lg text-center mt-8'>West</Text>
                  </View>
                  <RoundItem item={games.series[11]}/>
                </View>

                <View className='flex-row justify-between'>
                  <RoundItem item={games.series[4]}/>
                  <RoundItem item={games.series[5]}/>
                  <RoundItem item={games.series[6]}/>
                  <RoundItem item={games.series[7]}/>
                </View>

              </View>
            )}
          </ScrollView>
        </View> 
      </View>
    </Modal>
  )
}

export default Playoffs;