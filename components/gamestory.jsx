import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomModal from './customModal';
import { colors } from '../assets/colors';

export default function GameStory({ gameId, visible, onClose }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!visible || !gameId) return;
      setLoading(true);
      try {
        const res = await fetch(`https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
        const data = await res.json();
        setDetails(data);
      } catch (e) {
        console.log('Failed to load game');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [gameId, visible]);

  return (
    <CustomModal title="Game details" visible={visible} onClose={onClose} loading={loading}>
      <ScrollView style={s.content} contentContainerStyle={s.contentContainer}>
        <View>
          <Text style={s.heading}>Summary</Text>
          <Text selectable style={s.textMono}>
            
          </Text>
        </View>
      </ScrollView>
    </CustomModal>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  textMono: {
    color: colors.text2,
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  error: {
    color: colors.red,
  },
});