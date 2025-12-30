import { Octicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { colors } from '../assets/colors';
import { cleanupOldPicks } from '../utils/cleanupPicks';

SplashScreen.preventAutoHideAsync();

const TAB_COUNT = 3;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / TAB_COUNT;
  const translateX = useRef(new Animated.Value(0)).current;

  const animateToTab = (index) => {
    Animated.spring(translateX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      cleanupOldPicks();
    }
  }, [loaded]);

  if (error) {
    console.error('Font loading error:', error);
  }

  const TabBarBackground = () => (
    <View style={styles.tabBarBackground}>
      <Animated.View
        style={[
          styles.tabHighlight,
          {
            width: tabWidth - 60,
            transform: [{ translateX: Animated.add(translateX, 30) }],
          },
        ]}
      />
    </View>
  );

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
            borderTopWidth: 0.5,
            borderTopColor: colors.card,
            height: 50,
            position: 'absolute',
            width: '100%',
            elevation: 0,
            backgroundColor: colors.background
          },
          tabBarBackground: () => <TabBarBackground />,
        })}
        screenListeners={{
          state: (e) => {
            const index = e.data.state.index;
            animateToTab(index);
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'games',
            tabBarIcon: ({ focused }) => (
              <Octicons
                name='calendar'
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
              <Octicons
                name='list-ordered'
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
              <Octicons
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

const styles = StyleSheet.create({
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  tabHighlight: {
    position: 'absolute',
    top: 5,
    height: 27,
    backgroundColor: colors.text2 + '30',
    borderRadius: 999,
  },
});