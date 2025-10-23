import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const FAVORITES_KEY = '@whenhl_favorite_teams';

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavoriteTeams(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (teams) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(teams));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = async (teamAbbrev) => {
    setFavoriteTeams((prev) => {
      const newFavorites = prev.includes(teamAbbrev)
        ? prev.filter((abbrev) => abbrev !== teamAbbrev)
        : [...prev, teamAbbrev];
      
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  const isFavorite = (teamAbbrev) => {
    return favoriteTeams.includes(teamAbbrev);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteTeams,
        toggleFavorite,
        isFavorite,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
