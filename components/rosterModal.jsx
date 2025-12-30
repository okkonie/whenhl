import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';

export default function RosterModal({ visible, onClose, teamAbbrev }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && teamAbbrev) {
      setLoading(true);
      setError(null);

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
          setError('Could not load roster right now.');
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
      <SafeAreaView style={[s.modalContainer, s.overlayBg]}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Roster</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Octicons name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={s.loadingRow}>
              <ActivityIndicator color={colors.text} />
              <Text style={s.loadingText}>Loading roster...</Text>
            </View>
          )}
          {error && <Text style={s.errorText}>{error}</Text>}
          {!loading && !error && roster.map(player => (
            <View key={player.id} style={s.playerRow}>
              <View style={s.playerBadge}>
                <Text style={s.playerNumber}>{player.number}</Text>
              </View>
              <View style={s.playerInfo}>
                <Text style={s.playerName}>{player.first} {player.last}</Text>
                <Text style={s.playerMeta}>{player.position}</Text>
              </View>
            </View>
          ))}
          {!loading && !error && roster.length === 0 && (
            <Text style={s.emptyText}>No roster found.</Text>
          )}
        </ScrollView>
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
  overlayBg: {
    backgroundColor: colors.background,
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  loadingText: {
    color: colors.text,
    fontWeight: '600',
  },
  errorText: {
    color: colors.red,
    paddingVertical: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 8,
  },
  playerBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playerNumber: {
    color: colors.text,
    fontWeight: '800',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  playerMeta: {
    color: colors.text2,
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: colors.text2,
    textAlign: 'center',
    paddingVertical: 10,
  },
});
