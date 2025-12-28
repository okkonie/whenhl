import Octicons from '@expo/vector-icons/Octicons';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../assets/colors';
import TeamLogo from './teamLogo';

export default function Team({ item, index, isFavorite, onToggleFavorite }) {
  return (
    <View style={[s.teamRow, index == 0 && { borderTopWidth: 0 }]}>
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
    </View>
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
    borderColor: colors.border
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
    fontSize: 14,
    fontWeight: 600
  },
  favBtn: {
    padding: 8,
    borderRadius: 5,
  }
});
