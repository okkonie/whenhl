import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
      <StatusBar
        style="light"
        translucent={true}
        hidden={false}
      />
      <Tabs
        screenOptions={() => ({
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 1,
            borderColor: '#171717',
            height: height * 0.065,
            position: 'absolute',
            backgroundColor: '#171717',
            width:  width,
            alignItems: 'center'
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'home',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'calendar-clear' : 'calendar-clear-outline'}
                size={height * 0.028}
                color={'white'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="players"
          options={{
            title: 'players',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'shirt' : 'shirt-outline'}
                size={height * 0.028}
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
                name={focused ? 'podium' : 'podium-outline'}
                size={height * 0.028}
                color={'white'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="gameinfo"
          options={{
            href: null
          }}
        />
      </Tabs>
    </>
  );
}