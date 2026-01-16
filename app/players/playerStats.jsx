import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from '../../components/colors';
import CustomModal from '../../components/customModal';
import TeamLogo from '../../components/teamLogo';

export default function PlayerStats({ visible, playerId, teamAbbrev, onClose }) {
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (visible && playerId) {
      fetchPlayerData();
    }
  }, [visible, playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/player/${playerId}/landing`);
      const data = await response.json();
      setPlayer(data);
    } catch (e) {
      console.error('Error fetching player data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPlayer(null);
    onClose();
  };

  const Detail = ({detail, value, isLast}) => {
    return (
      <View style={[s.detailItem, !isLast && s.detailBorder]}>
        <Text style={s.detail}>{detail}</Text>
        <Text style={s.detailValue}>{value}</Text>
      </View>
    )
  }

  const StatItem = ({label, value}) => {
    return (
      <View style={s.statItem}>
        <Text style={s.statLabel}>{label}</Text>
        <Text style={s.statValue}>{value}</Text>
      </View>
    )
  }

  const StatContainer = ({head, category, position}) => {
    const [isRegular, setIsRegular] = useState(true);

    const subCategory = 
      isRegular && category === 'career' ? player?.careerTotals?.regularSeason 
      : isRegular && category === 'subseason' ? player?.featuredStats?.regularSeason?.subSeason
      : !isRegular && category === 'career' ? player?.careerTotals?.playoffs
      : player?.featuredStats?.playoffs?.subSeason;

    const hasPlayoffs = category === 'career' 
      ? player?.careerTotals?.playoffs 
      : player?.featuredStats?.playoffs?.subSeason;

    return (
      <View style={s.statContainer}>
        <View style={s.statHeader}>
          <Text style={s.statHeaderText}>{head}</Text>
          {hasPlayoffs && (
            <View style={s.toggleContainer}>
              <TouchableOpacity 
                style={[s.toggleBtn, isRegular && s.toggleBtnActive]} 
                onPress={() => setIsRegular(true)}
                activeOpacity={0.7}
              >
                <Text style={[s.toggleText, isRegular && s.toggleTextActive]}>REGULAR</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.toggleBtn, !isRegular && s.toggleBtnActive]} 
                onPress={() => setIsRegular(false)}
                activeOpacity={0.7}
              >
                <Text style={[s.toggleText, !isRegular && s.toggleTextActive]}>PLAYOFFS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {subCategory ? (
          position !== 'G' ? (
            <View style={s.statsRow}>
              <StatItem value={subCategory.gamesPlayed} label={'GP'} />
              <StatItem value={subCategory.goals} label={'G'} />
              <StatItem value={subCategory.assists} label={'A'} />
              <StatItem value={subCategory.points} label={'P'} />
              <StatItem value={subCategory.plusMinus} label={'+/-'} />
            </View>
          ) : (
            <View style={s.statsRow}>
              <StatItem value={subCategory.gamesPlayed} label={'GP'} />
              <StatItem value={subCategory.wins} label={'WINS'} />
              <StatItem value={subCategory.goalsAgainstAvg?.toFixed(2)} label={'GAA'} />
              <StatItem value={subCategory.savePctg ? (subCategory.savePctg * 100).toFixed(1) : '-'} label={'SV%'} />
              <StatItem value={subCategory.shutouts} label={'SO'} />
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

  const getPosition = (p) => {
    if(p == 'C') return 'Center'
    else if(p == 'R') return 'Right wing'
    else if(p == 'L') return 'Left wing'
    else if(p == 'D') return 'Defenseman'
    else if(p == 'G') return 'Goalie'
    else return 'Undefined'
  }

  const inchesToFeet = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}' ${remainingInches}"`;
  }

  const getOrdinalSuffix = (n) => {
    if (n >= 11 && n <= 13) return `${n}th`;
    const lastDigit = n % 10;
    switch (lastDigit) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' });
  }

  return (
    <CustomModal
      visible={visible}
      transparent={true}
      onClose={handleClose}
      loading={!player || loading}
      title="Player Stats"
    >
      <ScrollView style={s.content} contentContainerStyle={{paddingBottom: 20}} showsVerticalScrollIndicator={false}>
        {player && (
          <>
            <View style={s.top}>
              <Image source={player.headshot} style={s.headshot}/>
              <View style={s.topTexts}>
                <Text style={s.name}>{player.firstName.default} {player.lastName.default}</Text>
                <View style={s.textsRow}>
                  {player.sweaterNumber && <Text style={s.sweaterNumber}>#{player.sweaterNumber}</Text>}
                  {teamAbbrev && <TeamLogo abbrev={teamAbbrev} size={26} />}
                </View>
              </View>
            </View>
            {(player?.featuredStats?.regularSeason?.subSeason || player?.featuredStats?.playoffs?.subSeason) && (
              <StatContainer 
                head={player?.featuredStats?.season ? (player.featuredStats.season.toString().slice(0,4) + '-' + player.featuredStats.season.toString().slice(6)) : 'SEASON'} 
                category={'subseason'} 
                position={player?.position} 
              />
            )}

            {(player?.careerTotals?.regularSeason || player?.careerTotals?.playoffs) && (
              <StatContainer 
                head={'CAREER'} 
                category={'career'} 
                position={player?.position} 
              />
            )}
            {player.position && <Detail detail="Position" value={getPosition(player.position)} />}
            {player.shootsCatches && <Detail detail="Shoots/Catches" value={player.shootsCatches == 'L' ? 'Left' : 'Right'} />}
            {player.draftDetails &&  <Detail detail="Draft" value={`${getOrdinalSuffix(player.draftDetails.overallPick)} by ${player.draftDetails.teamAbbrev}, ${player.draftDetails.year}`} />}
            {player.birthDate && <Detail detail="Birth Date" value={formatDate(player.birthDate)} />}
            {player.birthCity?.default && <Detail detail="Birth Place" value={`${player.birthCity.default}${player.birthCountry ? `, ${player.birthCountry}` : ''}`} />}
            {player.heightInCentimeters && <Detail detail="Height" value={`${player.heightInCentimeters} cm${player.heightInInches ? ` / ${inchesToFeet(player.heightInInches)}` : ''}`} />}
            {player.weightInKilograms && <Detail detail="Weight" value={`${player.weightInKilograms} kg${player.weightInPounds ? ` / ${player.weightInPounds} lb` : ''}`} isLast />}
          </>
        )}
      </ScrollView>
    </CustomModal>
  );
}

const s = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  player: {
    flex: 1,
    paddingBottom: 20,
  },
  top: {
    gap: 15,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  topTexts: {
    gap: 5,
  },
  headshot: {
    width: 100,
    height: 100,
    contentFit: 'contain',
    borderRadius: 50,
  },
  textsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    color: colors.text,
    fontWeight: 600,
    fontSize: 20,
  },
  sweaterNumber: {
    fontSize: 17,
    fontWeight: 500,
    color: colors.text,
  },
  detailItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border
  },
  detail: {
    color: colors.text2,
    fontSize: 14
  },
  detailValue: {
    fontWeight: 500,
    color: colors.text,
    fontSize: 14,
  },
  statContainer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingVertical: 20,
  },
  statHeader: {
    marginBottom: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statHeaderText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  toggleContainer: {
    flexDirection: 'row',
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  toggleBtnActive: {
    backgroundColor: colors.border,
  },
  toggleText: {
    color: colors.text2,
    fontSize: 10,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: colors.text2,
    fontSize: 12,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  noStatsContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noStatsText: {
    color: colors.text2,
    fontSize: 14,
  },
});
