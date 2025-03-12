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
          tabBarStyle: {
            borderTopWidth: 0,
            height: '7%',
            position: 'absolute',
            backgroundColor: 'transparent',
            width: '40%',
            transform: [{ translateX: '75%' }],
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'home',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="calendar"
                size={focused ? 26 : 24}
                color={'white'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'teams',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="list"
                size={focused ? 26 : 24}
                color={'white'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="teaminfo"
          options={{
            href: null
          }}
        />
        <Tabs.Screen
          name="logos"
          options={{
            href: null
          }}
        />
      </Tabs>
    </>
  );
}