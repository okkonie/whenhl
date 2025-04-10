import { Tabs } from 'expo-router';

export default function TeamsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name='index' 
      options={{
        tabBarStyle: { display: 'none' }
      }}/>
      <Tabs.Screen name='teaminfo'
      options={{
        tabBarStyle: { display: 'none' }
      }} />
    </Tabs>
  );
}