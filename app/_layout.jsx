import { Octicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { colors } from '../components/colors';
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
          tabBarShowLabel: false,
          tabBarStyle: {
            paddingTop: 3,
            borderTopWidth: 0,
            height: 45,
            position: 'absolute',
            width: '100%',
            elevation: 0,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center'
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
          name="home"
          options={{
            title: 'home',
            tabBarIcon: ({ focused }) => (
              <Octicons
                name='home'
                size={24}
                color={focused ? colors.text : colors.text2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="standings"
          options={{
            title: 'standings',
            tabBarIcon: ({ focused }) => (
              <Octicons
                name="list-ordered"
                size={24}
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
                name='search'
                size={24}
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
    height: 35,
    backgroundColor: colors.highlight,
    borderRadius: 999,
  },
});