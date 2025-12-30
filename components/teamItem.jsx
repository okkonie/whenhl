import { Octicons } from '@expo/vector-icons';
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
        <View style={s.teamRight}>
          <Text style={s.teamPoints}>{item.points}</Text>
          <TouchableOpacity style={s.favBtn} onPress={onToggleFavorite}>
            <Octicons 
              name={isFavorite ? "star-fill" : "star"} 
              color={isFavorite ? colors.brand : colors.grey} 
              size={16} 
              activeOpacity={0.8} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <TeamStats 
        visible={modalVisible}
        logo={<TeamLogo abbrev={item.teamAbbrev.default} width={80} height={70} />}
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
    gap: 20
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
  teamPoints: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600'
  },
  favBtn: {
    padding: 8,
    borderRadius: 5,
  },
});
