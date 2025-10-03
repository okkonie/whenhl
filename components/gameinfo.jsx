import { Modal, Text, View, TouchableOpacity } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { SvgUri } from "react-native-svg";
import { useEffect, useState } from "react";

export default function GameInfo({ gameId, visible = true, onClose }) {
  const [loading, setLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState({});

  const fetchGame = async () => {
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
      const data = await response.json();
      setGameInfo(data);
    } catch (e) {
      console.error("Error fetching game", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=> {
    fetchGame();
  }, [])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#111', minWidth: '100%', height: '90%', borderTopWidth: 1, borderColor: '#222'}}>
          <View style={{width: '100%', justifyContent: 'flex-end', flexDirection: 'row'}}>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={{padding: 15}}>
              <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-evenly'}}>
            <View style={{alignItems: 'center'}}>
              <SvgUri width={80} height={80} uri={gameInfo?.homeTeam?.darkLogo} />
              <Text style={{color: 'white', fontWeight: 700, fontSize: 16}}>{gameInfo?.homeTeam?.commonName?.default}</Text>
            </View>
            
            <View style={{alignItems: 'center'}}>
              <SvgUri width={80} height={80} uri={gameInfo?.awayTeam?.darkLogo} />
              <Text style={{color: 'white', fontWeight: 700, fontSize: 16}}>{gameInfo?.awayTeam?.commonName?.default}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}