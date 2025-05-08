import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Dimensions, StatusBar } from 'react-native';

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
        barStyle="light-content"
        backgroundColor="black"
        translucent={false}
        hidden={false}
      />
      <Tabs
        screenOptions={() => ({
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 0,
            height: height * 0.07,
            position: 'absolute',
            backgroundColor: 'transparent',
            width:  width * 0.5,
            marginLeft: width * 0.25,
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
                name={focused ? 'calendar' : 'calendar-outline'}
                size={focused ? 26 : 24}
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
                name={focused ? 'people' : 'people-outline'}
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
                name={focused ? 'albums' : 'albums-outline'}
                size={focused ? 26 : 24}
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