import AsyncStorage from '@react-native-async-storage/async-storage';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const CACHE_VERSION = 'v1';
const LOGO_PREFIX = `logo_${CACHE_VERSION}_`;

// In-memory cache for instant access
const memoryCache = new Map();

async function getLogo(abbrev) {
  // 1. Check memory cache
  if (memoryCache.has(abbrev)) {
    return memoryCache.get(abbrev);
  }

  // 2. Check AsyncStorage
  try {
    const stored = await AsyncStorage.getItem(`${LOGO_PREFIX}${abbrev}`);
    if (stored) {
      memoryCache.set(abbrev, stored);
      return stored;
    }
  } catch (e) {
    console.error(`Error reading logo from storage for ${abbrev}`, e);
  }

  // 3. Fetch from network
  try {
    const url = `https://assets.nhle.com/logos/nhl/svg/${abbrev}_dark.svg`;
    const response = await fetch(url);
    const xml = await response.text();

    // Save to both caches
    memoryCache.set(abbrev, xml);
    AsyncStorage.setItem(`${LOGO_PREFIX}${abbrev}`, xml).catch(e => 
      console.error(`Error saving logo to storage for ${abbrev}`, e)
    );

    return xml;
  } catch (e) {
    console.error(`Error fetching logo for ${abbrev}`, e);
    return null;
  }
}

function TeamLogo({ abbrev, size = 30 }) {
  const [svgXml, setSvgXml] = useState(() => memoryCache.get(abbrev) || null);

  useEffect(() => {
    if (!abbrev) return;

    // If already have it from initial state, skip
    if (svgXml && memoryCache.has(abbrev)) return;

    let mounted = true;
    getLogo(abbrev).then(xml => {
      if (mounted && xml) setSvgXml(xml);
    });

    return () => { mounted = false; };
  }, [abbrev]);

  return (
    <View style={[s.container, { width: size * 1.5, height: size }]}>
      {svgXml && <SvgXml xml={svgXml} width={size * 1.5} height={size} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(TeamLogo);
