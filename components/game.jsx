import { View, Text, TouchableOpacity } from "react-native";
import { SvgUri } from "react-native-svg";

export function Game({ game, onPress, index }) {
  return (
    <TouchableOpacity 
      key={index} 
      onPress={onPress}
      style={{
        padding: 10, 
        borderWidth: 1, 
        borderColor: '#1c1c1e', 
        backgroundColor: '#121212', 
        borderRadius: 8, 
        marginBottom: 8, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5
      }}
    >
      <View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5
        }}>
          <SvgUri width={30} height={30} uri={game?.homeTeam?.darkLogo} />
          <Text style={{color: "white", fontWeight: 600}}>{game?.homeTeam?.commonName?.default }</Text>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5
        }}>
          <SvgUri width={30} height={30} uri={game?.awayTeam?.darkLogo} />
          <Text style={{color: "white", fontWeight: 600}}>{game?.awayTeam?.commonName?.default }</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}