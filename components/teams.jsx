import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Modal, ActivityIndicator, TouchableOpacity } from "react-native";

export default function Teams({visible, favorites}){
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api-web.nhle.com/v1/standings/now");
        const data = await response.json();
        setStandings(data);
      } catch (error) {
        console.error("Error fetching standings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={s.back}>
        <View style={s.container}>

        {loading ? (
          <View style={s.loader}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : (
          <View style={s.top}>
            <Text style={s.header}>Standings</Text>
            <TouchableOpacity>

            </TouchableOpacity>
          </View>
        )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  header: {
    color: 'white',
    fontSize: 16,
    fontWeight: 600
  },
  top: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  back: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    height: '90%',
    width: '100%',
    backgroundColor: '#161616',
    borderTopWidth: 5,
    borderColor: '#050505'
  },
  loader: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center"
  },
});