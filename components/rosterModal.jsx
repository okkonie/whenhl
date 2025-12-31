import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import Flag from './flag';
import Loader from './loader';

export default function RosterModal({ visible, onClose, teamAbbrev }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && teamAbbrev) {
      setLoading(true);

      fetch(`https://api-web.nhle.com/v1/roster/${teamAbbrev}/current`)
        .then(res => res.json())
        .then(data => {
          const forwards = data?.forwards || [];
          const defensemen = data?.defensemen || [];
          const goalies = data?.goalies || [];

          const normalize = (player, positionLabel) => ({
            id: player?.id || `${player?.firstName?.default}-${player?.lastName?.default}-${player?.sweaterNumber}`,
            first: player?.firstName?.default || '',
            last: player?.lastName?.default || '',
            number: player?.sweaterNumber || '-',
            position: player?.positionCode || positionLabel,
            birthCountry: player?.birthCountry
          });

          const combined = [
            ...forwards.map(p => normalize(p, 'F')),
            ...defensemen.map(p => normalize(p, 'D')),
            ...goalies.map(p => normalize(p, 'G')),
          ];

          setRoster(combined);
        })
        .catch(err => {
          console.error('Error fetching roster:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [visible, teamAbbrev]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.modalContainer}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Roster</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Octicons name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        {loading ? <Loader /> : (
          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            <View style={s.rosterCard}>
              {roster.map((player, index) => {
                const isLast = index === roster.length - 1;
                return (
                  <View key={player.id} style={[s.playerRow, !isLast && s.playerRowBorder]}>
                    <View style={s.left}>
                      <Text style={s.position}>{player.position}</Text>
                      <View style={s.nameContainer}>
                        <Flag country={player.birthCountry} />
                        <Text style={s.player} numberOfLines={1}>{player.first} {player.last}</Text>
                      </View>
                    </View>
                    <Text style={s.number}>#{player.number}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
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
    backgroundColor: colors.background,
    borderRadius: 15,
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  content: {
    paddingHorizontal: 10,
    paddingBottom: 20,
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
  rosterCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  playerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    gap: 20,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  number: {
    color: colors.text,
    fontWeight: '600',
  },
  player: {
    color: colors.text,
    fontWeight: '400',
  },
  position: {
    color: colors.text2
  },
});
