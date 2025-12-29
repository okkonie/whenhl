import { Octicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/colors';
import TeamLogo from './teamLogo';

function TeamStats({ visible, logo, item, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.modalContainer}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Team Stats</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Octicons name="x" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.teamHeader}>
            {logo}
            <View>
              <Text style={s.teamHeaderName}>{item?.teamName?.default}</Text>
              <Text style={s.teamScore}>{item?.wins}-{item?.losses}-{item?.otLosses}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function TeamItem({ item, index, isFavorite, onToggleFavorite }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8} style={[s.teamRow, index == 0 && { borderTopWidth: 0 }]}>
        <View style={s.teamLeft}>
          <View style={s.rank}>
            <Text style={s.rankText}>{index + 1}</Text>
          </View>
          <View style={s.team}>
            <TeamLogo abbrev={item.teamAbbrev.default} width={40} height={30} />
            <Text style={s.teamName}>{item.teamCommonName.default}</Text>
          </View>
        </View>
        <View style={s.teamRight}>
          <Text style={s.teamPoints}>{item.points}</Text>
          <TouchableOpacity style={s.favBtn} onPress={onToggleFavorite}>
            <Octicons 
              name={isFavorite ? "star-fill" : "star"} 
              color={isFavorite ? colors.brand : colors.grey} 
              size={16} 
              activeOpacity={0.8} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <TeamStats 
        visible={modalVisible}
        logo={<TeamLogo abbrev={item.teamAbbrev.default} width={80} height={70} />}
        item={item}
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}


const s = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    width: '100%',
    height: '97%',
    bottom: 0,
    backgroundColor: colors.background,
    borderRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  teamHeader: {
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
    paddingVertical: 20,
    paddingLeft: 5
  },
  teamHeaderName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  teamScore:{
    color: colors.text2,
    fontSize: 16,
    fontWeight: 500,
    paddingTop: 4,
  },
  teamRow: {
    paddingVertical: 15,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  rank: {
    width: 18,
  },
  rankText: {
    color: colors.text2,
    textAlign: 'right',
  },
  teamName: {
    color: colors.text,
    fontSize: 14,
  },
  teamPoints: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600'
  },
  favBtn: {
    padding: 8,
    borderRadius: 5,
  },
});
