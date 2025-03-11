import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Tabs } from 'expo-router'; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (error) {
    console.error('Font loading error:', error);
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="black" />
      <Tabs
        screenOptions={() => ({
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        })}
      >
        <Tabs.Screen name="index"/>
        <Tabs.Screen name="teams"/>
        <Tabs.Screen name="teaminfo"/>
      </Tabs>
    </>
  );
}
