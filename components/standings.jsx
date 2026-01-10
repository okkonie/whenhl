import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import CustomModal from "./customModal";

export default function(visible, onClose){
  const [loading, setLoading] = useState(true);
  const [stadings, setStandings] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const res = fetch("https://api-web.nhle.com/v1/standings/now");
      const data = res.json();
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
  }
})