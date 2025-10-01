import { View, Text, TouchableOpacity } from "react-native";
import { SvgUri } from "react-native-svg";

export function Game({ game, onPress, index }) {
  return (
    <TouchableOpacity key={index} className="py-3 border mb-2 border-neutral-900 bg-neutral-950 p-2 rounded justify-center" onPress={onPress}>
      <View className="flex-row items-center gap-2">
        <SvgUri width={30} height={30} uri={game?.homeTeam?.darkLogo} />
        <Text className="text-white text-base">{game?.homeTeam?.commonName?.default }</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <SvgUri width={30} height={30} uri={game?.awayTeam?.darkLogo} />
        <Text className="text-white text-base">{game?.awayTeam?.commonName?.default }</Text>
      </View>
    </TouchableOpacity>
  );
}