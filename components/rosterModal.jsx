import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from '../assets/colors';
import CustomModal from './customModal';
import Flag from './flag';

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
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Roster"
      loading={loading}
    >
      <ScrollView style={s.content} contentContainerStyle={{paddingBottom: 20}} showsVerticalScrollIndicator={false}>
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
    </CustomModal>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  rosterCard: {
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
