import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { colors } from "../assets/colors";
import CustomModal from "./customModal";

export default function Standings({visible, onClose}){
  const [loading, setLoading] = useState(true);
  const [stadings, setStandings] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const fetchStandings = async () => {
        const res = await fetch("https://api-web.nhle.com/v1/standings/now");
        const data = await res.json();
        setStandings(data);
      }
      
      fetchStandings();

    } catch (e){
      console.log("Error fetchings standings", e)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <CustomModal
      title="Standings"
      loading={loading}
      modalHeight={1}
      onClose={onClose}
      visible={visible}
    >
      <ScrollView style={s.content}>

      </ScrollView>
    </CustomModal>
  )
}

const s = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.bg
  }
})