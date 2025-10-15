import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Pressable } from "react-native";
import { useState, useEffect } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import { SvgUri } from "react-native-svg";

export default function PlayerModal({ visible, onClose, playerId }) {
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`https://api-web.nhle.com/v1/player/${playerId}/landing`);
        const data = await response.json();
        setPlayer(data);
      } catch (error) {
        console.error('Failed to fetch player data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible && playerId) {
      fetchPlayerData();
    }
  }, [playerId, visible]);

  if (!visible) return null;

  const StatItem = ({head, stat}) => {
    return (
      <View style={s.statItem}>
        <Text style={s.statHead}>{head}</Text>
        <Text style={s.statValue}>{stat}</Text>
      </View>
    )
  }

  const StatContainer = ({head, category, position}) => {
    const [isRegular, setIsRegular] = useState(true)

    const subCategory = 
    isRegular && category === 'career' ? player?.careerTotals?.regularSeason 
    : isRegular && category === 'subseason' ? player?.featuredStats?.regularSeason?.subSeason
    : !isRegular && category === 'career' ? player?.careerTotals?.playoffs
    : player?.featuredStats?.playoffs?.subSeason

    return (
      <View style={s.statContainer}>
        <View style={s.statHeader}>
          <Text style={s.statHeaderText}>{head}</Text>
          <View style={s.toggleContainer}>
            <Pressable 
              onPress={() => setIsRegular(true)}
              style={[s.toggleButton, isRegular && s.toggleButtonActive]}
            > 
              <Text style={[s.toggleButtonText, isRegular && s.toggleButtonTextActive]}>
                Regular
              </Text>
            </Pressable>
            <Pressable 
              onPress={() => setIsRegular(false)}
              style={[s.toggleButton, !isRegular && s.toggleButtonActive]}
            > 
              <Text style={[s.toggleButtonText, !isRegular && s.toggleButtonTextActive]}>
                Playoffs
              </Text>
            </Pressable>
          </View>
        </View>
        {subCategory ? (
          position !== 'G' ? (
            <View style={s.statsRow}>
              <StatItem stat={subCategory.gamesPlayed} head={'games'} />
              <StatItem stat={subCategory.goals} head={'goals'} />
              <StatItem stat={subCategory.assists} head={'assists'} />
              <StatItem stat={subCategory.points} head={'points'} />
              <StatItem stat={subCategory.plusMinus} head={'+/-'} />
            </View>
          ) : (
            <View style={s.statsRow}>
              <StatItem stat={subCategory.gamesPlayed} head={'games'} />
              <StatItem stat={subCategory.wins} head={'wins'} />
              <StatItem stat={subCategory.goalsAgainstAvg?.toFixed(2)} head={'gaa'} />
              <StatItem stat={subCategory.savePctg ? (subCategory.savePctg * 100).toFixed(1) : '-'} head={'save%'} />
              <StatItem stat={subCategory.shutouts} head={'shutouts'} />
            </View>
          )
        ) : (
          <View style={s.noStatsContainer}>
            <Text style={s.noStatsText}>No stats available</Text>
          </View>
        )}
      </View>
    )
  }

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
              STATS
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {loading || !player ?  (
            <View></View>
          ) : (
            <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
              <View style={s.top}>
                {player?.headshot && <Image source={{uri: player.headshot}} style={s.headshot}/>}
                <View style={s.topTexts}>
                  <Text style={s.bigText}>
                    {player?.firstName?.default} {player?.lastName?.default}
                  </Text>
                  <View style={s.row}>
                    {player?.currentTeamAbbrev && (
                      <View style={{height: 30, width: 30}}>
                        <SvgUri width={30} height={30} uri={`https://assets.nhle.com/logos/nhl/svg/${player.currentTeamAbbrev}_dark.svg`}/> 
                      </View>
                    )}
                    {player?.sweaterNumber && <Text style={s.secondary}>#{player.sweaterNumber}</Text>}
                  </View>
                </View>
              </View>

              <View style={s.details}>
                {player?.birthDate && (
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Born</Text>
                    <Text style={s.detailValue}>
                      {new Date(player.birthDate).toLocaleDateString()} ({Math.floor((new Date() - new Date(player.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))})
                    </Text>
                  </View>
                )}
                
                {(player?.birthCity?.default || player?.birthCountry) && (
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Birthplace</Text>
                    <Text style={s.detailValue}>
                      {player?.birthCity?.default && player?.birthCountry 
                        ? `${player.birthCity.default}, ${player.birthCountry}`
                        : player?.birthCity?.default || player?.birthCountry
                      }
                    </Text>
                  </View>
                )}

                {player?.draftDetails?.year && (
                  <View style={s.detailRow}>
                    <Text style={s.detailLabel}>Draft</Text>
                    <Text style={s.detailValue}>
                      {player.draftDetails.year}
                      {player.draftDetails.teamAbbrev && `, ${player.draftDetails.teamAbbrev}`}
                      {player.draftDetails.overallPick && ` (${player.draftDetails.overallPick}.)`}
                    </Text>
                  </View>
                )}

                <View style={s.infoGrid}>
                  {player?.position && (
                    <View style={s.infoBox}>
                      <Text style={s.infoLabel}>Position</Text>
                      <Text style={s.infoValue}>
                        {player.position === 'C' ? 'Center' 
                          : player.position === 'R' ? 'Right wing'
                          : player.position === 'L' ? 'Left wing'
                          : player.position === 'D' ? 'Defenseman'
                          : player.position === 'G' ? 'Goalie' 
                          : player.position
                        }
                      </Text>
                    </View>
                  )}
                  {player?.shootsCatches && (
                    <View style={s.infoBox}>
                      <Text style={s.infoLabel}>{player?.position === 'G' ? 'Catches' : 'Shoots'}</Text>
                      <Text style={s.infoValue}>{player.shootsCatches === 'R' ? 'Right' : 'Left'}</Text>
                    </View>
                  )}
                  {(player?.heightInInches || player?.heightInCentimeters) && (
                    <View style={s.infoBox}>
                      <Text style={s.infoLabel}>Height</Text>
                      <Text style={s.infoValue}>
                        {player?.heightInInches && player?.heightInCentimeters ? 
                          `${Math.floor(player.heightInInches / 12)}'${player.heightInInches % 12}" / ${player.heightInCentimeters} cm` 
                          : player?.heightInInches ? 
                          `${Math.floor(player.heightInInches / 12)}'${player.heightInInches % 12}"`
                          : `${player.heightInCentimeters} cm`
                        }
                      </Text>
                    </View>
                  )}
                  {(player?.weightInPounds || player?.weightInKilograms) && (
                    <View style={s.infoBox}>
                      <Text style={s.infoLabel}>Weight</Text>
                      <Text style={s.infoValue}>
                        {player?.weightInPounds && player?.weightInKilograms ? 
                          `${player.weightInPounds} lbs / ${player.weightInKilograms} kg` 
                          : player?.weightInPounds ?
                          `${player.weightInPounds} lbs`
                          : `${player.weightInKilograms} kg`
                        }
                      </Text>
                    </View>
                  )}
                </View>
              
              </View>

              {(player?.featuredStats?.regularSeason?.subSeason || player?.featuredStats?.playoffs?.subSeason) && (
                <StatContainer 
                  head={player?.featuredStats?.season ? (player.featuredStats.season.toString().slice(0,4) + '-' + player.featuredStats.season.toString().slice(6)) : 'Season'} 
                  category={'subseason'} 
                  position={player?.position} 
                />
              )}

              {(player?.careerTotals?.regularSeason || player?.careerTotals?.playoffs) && (
                <StatContainer 
                  head={'Career'} 
                  category={'career'} 
                  position={player?.position} 
                />
              )}

              <View style={{height: 50}} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 20,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  infoValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 500,
  },
  details: {
    width: '100%',
    marginTop: 30,
  },
  row:  {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  secondary: {
    color: "#b0b0b0",
    fontSize: 16,
    fontWeight: 600
  },
  topTexts: {
    gap: 10
  },
  bigText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 600
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  headshot: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  body: {
    flex: 1,
    padding: 15
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch'
  },
  sheet: {
    backgroundColor: '#111',
    width: '100%',
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
    fontSize: 14,
    fontWeight: 700,
    color: '#b0b0b0',
  },
  closeBtn: {
    padding: 15,
  },
  statItem: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  statHead: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  statContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginTop: 15,
    overflow: 'hidden',
  },
  statHeader: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#333',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  statHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  toggleContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 3,
    gap: 3,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4a9eff',
  },
  toggleButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#111',
    fontWeight: '700',
  },
  noStatsContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noStatsText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});
