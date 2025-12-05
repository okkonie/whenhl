import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';

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
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 0,
            height: 50,
            position: 'absolute',
            backgroundColor: '#161616',
            width: '100%',
            paddingTop: 5,
            elevation: 0,
            borderTopWidth: 1,
            borderColor: '#202020'
          },
          tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: '#161616' }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 20,
                  width: tabWidth / 1.5,
                  height: 34,
                  backgroundColor: '#2a2a2a',
                  borderRadius: 25,
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
            title: 'home',
            tabBarIcon: () => (
              <Ionicons
                name='calendar-clear'
                size={25}
                color={'white'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'teams',
            tabBarIcon: () =>(
              <Ionicons
                name='list'
                size={25}
                color={'white'}
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
                size={25}
                color={'white'}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}