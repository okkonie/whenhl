import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../assets/colors';
import TeamLogo from './teamLogo';
import TeamStats from './teamStats';

export default function TeamItem({ item, index, isFavorite, onToggleFavorite }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8} style={[s.teamRow, index == 0 && { borderTopWidth: 0 }]}>
        <View style={s.teamLeft}>
          <View style={s.rank}>
            <Text style={s.rankText}>{index + 1}</Text>
          </View>
          <View style={s.team}>
            <TeamLogo abbrev={item.teamAbbrev.default} width={40} height={30} />
            <Text style={s.teamName}>{item.teamCommonName.default}</Text>
          </View>
        </View>
        <Text style={s.statValue}>{item.points}</Text>
      </TouchableOpacity>

      <TeamStats 
        visible={modalVisible}
        logo={<TeamLogo abbrev={item.teamAbbrev.default} size={70} />}
        item={item}
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}

const s = StyleSheet.create({
  teamRow: {
    paddingVertical: 15,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 10,
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  statValue: {
    width: 35,
    textAlign: 'center',
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    color: colors.text2,
    fontSize: 10,
    fontWeight: '500',
  },
  rank: {
    width: 18,
  },
  rankText: {
    color: colors.text2,
    textAlign: 'right',
  },
  teamName: {
    color: colors.text,
    fontSize: 14,
  },
  favBtn: {
    padding: 8,
    borderRadius: 5,
  },
});
