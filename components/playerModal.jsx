import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from "react-native";
import { useState, useEffect } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import { SvgUri } from "react-native-svg";

export default function PlayerModal({ visible, onClose, playerId }) {
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`https://api-web.nhle.com/v1/player/${playerId}/landing`);
        const data = await response.json();
        setPlayer(data);
      } catch (error) {
        console.error('Failed to fetch player data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible && playerId) {
      fetchPlayerData();
    }
  }, [playerId, visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.modalContainer}>
        <View style={s.sheet}>
          <View style={s.headerRow}>
            <Text style={s.headerText}>
              STATS
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {loading ?  (
            <View></View>
          ) : (
            <ScrollView style={s.body}>
              <View style={s.top}>
                <Image source={{uri: player?.headshot}} style={s.headshot}/>
                <View style={s.topTexts}>
                  <Text style={s.bigText}>{player?.firstName.default} {player?.lastName.default}</Text>
                  <View style={s.row}>
                    <Text style={s.secondary}>{player?.position}   /   {player?.birthCountry}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  row:  {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  secondary: {
    color: "#b0b0b0",
  },
  topTexts: {
    gap: 10
  },
  bigText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 600
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  headshot: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  body: {
    flex: 1,
    padding: 25
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch'
  },
  sheet: {
    backgroundColor: '#111',
    width: '100%',
    height: '90%',
    borderTopWidth: 1,
    borderColor: '#222',
  },
  headerRow: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    paddingLeft: 15,
    fontSize: 14,
    fontWeight: 700,
    color: '#b0b0b0',
  },
  closeBtn: {
    padding: 15,
  },
});
