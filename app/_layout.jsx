import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (error) {
    console.error('Font loading error:', error);
  }

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar
        style="light"
        hidden={false}
      />
      <Stack screenOptions={() => ({headerShown: false,})}>
        <Stack.Screen name="index" />
        <Stack.Screen name="standings" />
      </Stack>
    </>
  );
}