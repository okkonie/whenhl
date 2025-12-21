import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';
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
          tabBarLabelStyle: {
            color: colors.text,
            fontSize: 9,
            fontWeight: 400
          },
          tabBarStyle: {
            borderTopWidth: 0,
            height: 50,
            position: 'absolute',
            width: '100%',
            elevation: 0,
          },
          tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  bottom: 18,
                  left: 33,
                  width: tabWidth / 2.2,
                  height: 27,
                  backgroundColor: colors.border,
                  borderRadius: 15,
                  transform: [{ translateX }],
                }}
              />
            </View>
          ),
        })}
        screenListeners={{
          state: (e) => {
            const index = e.data.state.index;
            Animated.spring(translateX, {
              toValue: index * tabWidth,
              useNativeDriver: true,
              damping: 50,
              stiffness: 400,
            }).start();
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'games',
            tabBarIcon: () => (
              <Ionicons
                name='calendar-clear'
                size={20}
                color={colors.text}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'standings',
            tabBarIcon: () =>(
              <Ionicons
                name='list'
                size={20}
                color={colors.text}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="players"
          options={{
            title: 'players',
            tabBarIcon: () =>(
              <Ionicons
                name='people'
                size={20}
                color={colors.text}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}