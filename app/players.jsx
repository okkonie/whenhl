import { Octicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";
import Loader from "../components/loader";
import StatMode from "../components/statMode";

export default function Players() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('points');
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaView style={s.container}>
      {loading ? <Loader /> : (
        <>
          <Header text={'PLAYERS'}>
            <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7} style={s.btn}>
              <Octicons name="arrow-switch" size={20} color="white"/>
            </TouchableOpacity>
          </Header>
          <StatMode mode={mode} setMode={setMode} onClose={() => setModalVisible(false)} visible={modalVisible}/>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: "#111",
  },
  header: {
    height: 65,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    paddingLeft: 10,
    fontSize: 18,
    color: 'white',
    fontWeight: 700,
  },
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
  list :{
    flex: 1
  },
  btn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
})