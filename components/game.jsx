import { View, Text, TouchableOpacity } from "react-native";
import { SvgUri } from "react-native-svg";

export default function Game({ game, onPress, index }) {

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
        paddingHorizontal: 25,
        borderBottomWidth: 1, 
        borderColor: '#222', 
        backgroundColor: '#111', 
        flexDirection: 'row',
        justifyContent: "space-between",
        gap: 30,
      }}
    >
      <View style={{justifyContent: 'space-between', flexDirection: 'row', flex: 1}}>
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
        {game.gameState != "FUT" &&(
          <View style={{ alignItems: 'flex-end', justifyContent: 'space-evenly', minWidth: 30 }}>
            <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>{game?.homeTeam?.score}</Text>
            <Text style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>{game?.awayTeam?.score}</Text>
          </View>
        )}
      </View>
      <View style={{ justifyContent: 'space-evenly', alignItems: 'center' }}>
        <View style={{paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: '#222'}}>
          <Text style={{ color: 'white', fontWeight: 600, fontSize: 12}}>{game.gameState === 'FUT' ? timeLabel : game?.periodDescriptor?.periodType}</Text>
        </View>
        <Text style={{ color: '#959595', fontSize: 12 }}>{dateLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}