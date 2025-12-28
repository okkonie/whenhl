import { Octicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from '../assets/colors';
import Flag from "./flag";
import Loader from './loader';

export default function PlayerStats({ visible, playerId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);

  console.log(playerId);

  useEffect(() => {
    if (visible && playerId) {
      fetchPlayerData();
    }
  }, [visible, playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/player/${playerId}/landing`);
      const data = await response.json();
      setPlayer(data);
    } catch (e) {
      console.error('Error fetching player data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPlayer(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={s.modalContainer}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Player Stats</Text>
          <TouchableOpacity onPress={handleClose} style={s.btn}>
            <Octicons name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={s.content}>
          {!player ? <Loader /> : (
            <View style={s.top}>
              <Image source={player.headshot} style={s.headshot}/>
              <View style={s.topTexts}>
                <Text style={s.name}>{player.firstName.default} {player.lastName.default}</Text>
                <Text style={s.underText}><Flag country={player.birthCountry} />  {player.birthCity.default}</Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    width: '100%',
    height: '97%',
    bottom: 0,
    backgroundColor: colors.card,
    borderRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  top: {
    gap: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headshot: {
    width: 90,
    height: 90,
    contentFit: 'contain',
    borderRadius: 45,
  },
  topTexts: {
    gap: 5,
  },
  name: {
    color: colors.text,
    fontWeight: 600,
    fontSize: 18,
  },
  underText: {
    color: colors.text2
  }
});
