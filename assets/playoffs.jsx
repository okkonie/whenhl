import { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import '../app/global.css';

const Playoffs = () => {
  const [loading, setLoading] = useState(false);
  const [playoffs, setPlayoffs] = useState(false);
  const [games, setGames] = useState({});

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

  useEffect(() => {
    const fetchGames = async (season) => {
      try {
        setLoading(true)
        console.log(season)
        const response = await fetch(`https://api-web.nhle.com/v1/playoff-series/carousel/${season}`)
        if (response.ok) {
          const data = await response.json()
          setGames(data)
        } else {
          setPlayoffs(false)
        }
      } catch (error) {
        console.error('failure: ', error)
      } finally {
        setLoading(false)
      };
    };
    
    fetchGames(getSeason());
  }, []);

  console.log(games)

  return (
    <TouchableOpacity className='absolute right-0 top-6 w-1/5 h-1/12 bg-green-500 rounded-l-full z-50'>
      <Text className='text-sm p-5 overflow-x-clip'>playoff bracket</Text>
    </TouchableOpacity>
  )
}

export default Playoffs;