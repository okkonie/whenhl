import { Modal, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { SvgUri } from "react-native-svg";
import { useEffect, useState } from "react";

export default function GameInfo({ game, visible = true, onClose, dateLabel, timeLabel }) {
  const [loading, setLoading] = useState(true);
  const [gameInfo, setGameInfo] = useState({});

  const fetchGame = async () => {
    try {
      const response = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game.id}/landing`);
      const data = await response.json();
      setGameInfo(data);
    } catch (e) {
      console.error("Error fetching game", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=> {
    if (game) {
      fetchGame();
    }
  }, [game])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.modalContainer}>
        <View style={s.sheet}>
          <View style={s.headerRow}>
            <Text style={s.headerText}>
              {
                game?.gameType === 1 ? 'PRESEASON' 
                : game?.gameType === 2 ? 'REGULAR SEASON' 
                : `${game?.seriesStatus?.seriesAbbrev} GAME ${game?.seriesStatus?.gameNumberOfSeries} (${game?.seriesStatus?.topSeedTeamAbbrev} ${game?.seriesStatus?.topSeedWins} - ${game?.seriesStatus?.bottomSeedTeamAbbrev} ${game?.seriesStatus?.bottomSeedWins})` 
              }
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
              <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={s.teamsRow}>
            <View style={s.teamCol}>
              <SvgUri width={70} height={70} uri={game?.homeTeam?.darkLogo} />
              <Text style={s.teamName}>{game?.homeTeam?.commonName?.default}</Text>
            </View>
            <View style={s.centerCol}>
              <Text style={s.dateLabel}>{dateLabel}</Text>
              <Text style={[
                s.stateLabel,
                game.gameState === 'LIVE' && s.liveLabel
              ]}>
                {game.gameState === 'FUT' ? timeLabel : `${game?.homeTeam?.score} - ${game?.awayTeam?.score}`}
              </Text>
            </View>
            <View style={s.teamCol}>
              <SvgUri width={70} height={70} uri={game?.awayTeam?.darkLogo} />
              <Text style={s.teamName}>{game?.awayTeam?.commonName?.default}</Text>
            </View>
          </View>
          {game.gameState != 'FUT' && (
            <View style={s.statsRow}>
              <Text style={s.statsText}>{gameInfo?.homeTeam?.sog}</Text>
              <Text style={s.dateLabel}>SOG</Text>
              <Text style={s.statsText}>{gameInfo?.awayTeam?.sog}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: '#111',
    minWidth: '100%',
    height: '90%',
    borderTopWidth: 1,
    borderColor: '#222',
  },
  headerRow: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    paddingLeft: 15,
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
  },
  closeBtn: {
    padding: 15,
  },
  teamsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  teamCol: {
    alignItems: 'center',
    width: '33%',
  },
  teamName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  centerCol: {
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
  },
  dateLabel: {
    color: '#b0b0b0',
    textAlign: 'center',
  },
  stateLabel: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: '#222',
  },
  liveLabel: {
    backgroundColor: '#e62b1e',
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  statsText: {
    color: 'white',
    fontWeight: 700,
    fontSize: 18
  },
});