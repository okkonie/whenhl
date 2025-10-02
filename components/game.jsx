import { View, Text, TouchableOpacity } from "react-native";
import { SvgUri } from "react-native-svg";

export function Game({ game, onPress, index }) {
  // Pre-compute formatted date/time for FUT games
  const start = game?.startTimeUTC ? new Date(game.startTimeUTC) : null;
  const isValidStart = start && !isNaN(start);
  const dateLabel = isValidStart
    ? start.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'numeric' })
    : '';
  const timeLabel = isValidStart
    ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      key={index} 
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1, 
        borderColor: game.gameState === 'LIVE' ? '#7a2121': '#1c1c1e', 
        backgroundColor: '#121212', 
        borderRadius: 8, 
        marginBottom: 8, 
        flexDirection: 'row',
        justifyContent: "space-between",
      }}
    >
      <View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5
        }}>
          <SvgUri width={30} height={30} uri={game?.homeTeam?.darkLogo} />
          <Text style={{color: "white"}}>{game?.homeTeam?.commonName?.default }</Text>
        </View>
        
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5
        }}>
          <SvgUri width={30} height={30} uri={game?.awayTeam?.darkLogo} />
          <Text style={{color: "white"}}>{game?.awayTeam?.commonName?.default }</Text>
        </View>
      </View>
      {game.gameState === 'FUT' ? (
        <View style={{ justifyContent: 'space-evenly', alignItems: 'flex-end' }}>
          <Text style={{ color: '#959595', fontSize: 12 }}>{dateLabel}</Text>
          <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>{timeLabel}</Text>
        </View>
      ) : (
        <View style={{justifyContent: 'space-evenly'}}>
          <Text style={{color: "white", fontWeight: 600, fontSize: 18}}>{game?.homeTeam?.score}</Text>
          <Text style={{color: "white", fontWeight: 600, fontSize: 18}}>{game?.awayTeam?.score}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}