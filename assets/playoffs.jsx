import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import '../app/global.css';

const { height, width } = Dimensions.get('window')

const Playoffs = () => {
  const [loading, setLoading] = useState(false);
  const [playoffs, setPlayoffs] = useState(false);
  const [games, setGames] = useState({});
  const [hasData, setHasData] = useState(false)

  const getSeason = () => {
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    if (month <= 7) {
      return `${year - 1}${year}`
    }
    if (month > 7) {
      return `${year}${year + 1}`
    }
  };

  const fetchGames = async (season) => {
    try {
      setLoading(true)
      console.log('fetching')
      const response = await fetch(`https://api-web.nhle.com/v1/playoff-series/carousel/${season}`)
      if (response.ok) {
        const data = await response.json()
        setGames(data)
        setHasData(true)
      } else {
        setPlayoffs(false)
      }
    } catch (error) {
      console.error('failure: ', error)
    } finally {
      setLoading(false)
    };
  };

  return (
    <TouchableOpacity 
      className='absolute right-0 pr-12 pb-12 pt-4 pl-4 bg-red-700 rounded-full z-50 items-center' style={{bottom: height * -0.03, right: width * -0.06}}
      onPress={() => {if (!hasData) {fetchGames(getSeason())}}}
    > 
      <Ionicons name="trophy" size={24} color="#171717"/>
      <Text className="text-xs font-extrabold text-neutral-900 ">playoffs</Text>
    </TouchableOpacity>
  )
}

export default Playoffs;