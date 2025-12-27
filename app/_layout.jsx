import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import { colors } from '../assets/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / 3;
  const [translateX] = useState(new Animated.Value(0));

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
        hidden={false}
      />
      <Tabs
        screenOptions={() => ({
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.text2,
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: 400
          },
          tabBarStyle: {
            borderTopWidth: 0,
            height: 50,
            position: 'absolute',
            width: '100%',
            elevation: 0,
            backgroundColor: colors.background
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'games',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name='calendar-clear'
                size={20}
                color={focused ? colors.text : colors.text2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'standings',
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name='list'
                size={20}
                color={focused ? colors.text : colors.text2}
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
                name='people'
                size={20}
                color={focused ? colors.text : colors.text2}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}