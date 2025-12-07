import Octicons from '@expo/vector-icons/Octicons';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgUri } from "react-native-svg";

export default function Team({ item, index, isFavorite, onToggleFavorite }) {
  return (
    <View style={s.teamRow}>
      <View style={s.teamLeft}>
        <View style={s.rank}>
          <Text style={s.rankText}>{index + 1}</Text>
        </View>
        <View style={s.team}>
          <View style={s.svgPlace}>
            <SvgUri 
              width={40} 
              height={30} 
              uri={`https://assets.nhle.com/logos/nhl/svg/${item.teamAbbrev.default}_dark.svg`} 
            />
          </View>
          <View>
            <Text style={s.teamName}>{item.placeName.default.startsWith('NY') ? 'New York' : item.placeName.default}</Text>
            <Text style={s.teamName}>{item.teamCommonName.default}</Text>
          </View>
        </View>
      </View>
      <View style={s.teamRight}>
        <Text style={s.teamPoints}>{item.points}</Text>
        <TouchableOpacity style={s.favBtn} onPress={onToggleFavorite}>
          <Octicons 
            name={isFavorite ? "star-fill" : "star"} 
            color={isFavorite ? "#FFD700" : "#aaa"} 
            size={16} 
            activeOpacity={0.8} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  svgPlace: {
    width: 40,
    height: 30
  },
  teamRow: {
    paddingVertical: 20,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#222'
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
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
    color: "#aaa",
    textAlign: 'right',
  },
  teamName: {
    color: 'white',
    fontSize: 13,
  },
  teamPoints: {
    color: 'white',
    fontSize: 14,
    fontWeight: 600
  },
  favBtn: {
    padding: 8,
    borderRadius: 5,
  }
});
