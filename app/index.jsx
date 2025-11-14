import { View, Text, SectionList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Game from "../components/game";
import { useState, useEffect } from "react";
import Entypo from '@expo/vector-icons/Entypo';

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [gameVisible, setGameVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedLabels, setSelectedLabels] = useState({});
  const [currentDate, setCurrentDate] = useState(() => {
    // default to 2 days ago in YYYY-MM-DD format
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [nextStartDate, setNextStartDate] = useState(null);
  const [previousStartDate, setPreviousStartDate] = useState(null);
  const [sections, setSections] = useState([]);
  const [dateRangeText, setDateRangeText] = useState('');

  const fetchGames = async (date = currentDate) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
      const data = await response.json();
      // Flatten { gameWeek: [{ date, games: [...] }, ...] } => games[]
      const flattened = (data?.gameWeek ?? []).flatMap((d) => d?.games ?? []);
      setGames(flattened);

      // Calculate date range from first to last game
      if (flattened.length > 0) {
        const dates = flattened
          .map(g => g?.startTimeUTC ? new Date(g.startTimeUTC) : null)
          .filter(d => d && !isNaN(d))
          .sort((a, b) => a - b);
        
        if (dates.length > 0) {
          const firstDate = dates[0];
          const lastDate = dates[dates.length - 1];
          
          const formatDate = (d) => {
            const date = d.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
            return `${date}`;
          };
          
          if (firstDate.toDateString() === lastDate.toDateString()) {
            // Same day
            setDateRangeText(formatDate(firstDate));
          } else {
            // Date range
            setDateRangeText(`${formatDate(firstDate)} - ${formatDate(lastDate)}`);
          }
        } else {
          setDateRangeText('');
        }
      } else {
        setDateRangeText('No games');
      }

      // Group games by client's local date
      const groups = {};
      flattened.forEach((g) => {
        const start = g?.startTimeUTC ? new Date(g.startTimeUTC) : null;
        let key = 'TBA';
        let title = 'TBA';
        if (start && !isNaN(start)) {
          // local-date key in YYYY-MM-DD
          const y = start.getFullYear();
          const m = String(start.getMonth() + 1).padStart(2, '0');
          const d = String(start.getDate()).padStart(2, '0');
          key = `${y}-${m}-${d}`;
          title = start.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'numeric' });
        }
        if (!groups[key]) groups[key] = { title, data: [] };
        groups[key].data.push(g);
      });
      const sectionsArray = Object.keys(groups)
        .sort()
        .map((k) => groups[k]);
      setSections(sectionsArray);

      setNextStartDate(data?.nextStartDate ?? null);
      setPreviousStartDate(data?.previousStartDate ?? null);
      setCurrentDate(date);
    } catch (e) {
      console.error("Error fetching games", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch for the default date (2 days ago)
    fetchGames(currentDate);
  }, []);

  const handleGamePress = (game, labels) => {
    setGameVisible(true);
    setSelectedGame(game);
    setSelectedLabels(labels);
  };

  return (
    <SafeAreaView style={ s.container }>
      <View style={s.header}>
        <Text style={s.headerText}>
          WHENHL
        </Text>
        <View style={s.buttons}>
          <TouchableOpacity
            onPress={() => previousStartDate && fetchGames(previousStartDate)}
            disabled={!previousStartDate}
            style={[s.navButton, !previousStartDate && s.navButtonDisabled]}
          >
            <Entypo name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={s.dateRangeContainer}>
            <Text style={s.dateRangeText}>{dateRangeText}</Text>
          </View>
          <TouchableOpacity
            onPress={() => nextStartDate && fetchGames(nextStartDate)}
            disabled={!nextStartDate}
            style={[s.navButton, !nextStartDate && s.navButtonDisabled]}
          >
            <Entypo name="chevron-right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <SectionList
          style={s.list}
          sections={sections}
          keyExtractor={(item, index) => item?.id?.toString?.() || item?.gameId?.toString?.() || index.toString()}
          renderItem={({ item, index }) => (
            <Game
              game={item}
              index={index}
              onPress={handleGamePress}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={s.sectionHeader}>
              <Text style={s.sectionHeaderText}>{title}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: "#050505",
    paddingHorizontal: 20,
  },
  header: {
    height: 60,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 700,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  dateRangeContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  dateRangeText: {
    color: '#b0b0b0',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    backgroundColor: '#151515',
    padding: 15,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
  },
  sectionHeaderText: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: '600'
  },
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
  list :{
    flex: 1
  }
})