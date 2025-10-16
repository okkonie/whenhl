import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { Image } from 'expo-image';
import { useState, useEffect } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import { SvgUri } from "react-native-svg";

export default function PlayerModal({ visible, onClose, team }) {
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);

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
              TEAM STATS
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View></View>
          ) : (
            <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
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
