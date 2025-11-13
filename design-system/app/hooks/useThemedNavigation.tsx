import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '@/app/contexts/ThemeContext';
import useThemeColors from '@/app/contexts/ThemeColors';

/**
 * A hook that handles theme-dependent styling for navigation and status bars
 * Returns configuration objects and components for themed navigation
 */
export default function useThemedNavigation() {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  
  // Set up status/navigation bar styling based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set navigation bar color
      NavigationBar.setBackgroundColorAsync(colors.bg);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

      // // Set status bar styling directly using the native StatusBar API
      // RNStatusBar.setBackgroundColor(colors.bg, true);
      // RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);

      // // Prevent translucency which can cause dimming
      // RNStatusBar.setTranslucent(true);
    } 
  }, [isDark, colors.bg]);

  // StatusBar component with appropriate theme styling
  const ThemedStatusBar = () => (
    <StatusBar
      style={isDark ? 'light' : 'dark'}
      backgroundColor="transparent"
      translucent={true}
    />
  );

  // Navigation container/stack screen options for themed backgrounds
  const screenOptions = {
    headerShown: false,
    backgroundColor: colors.bg,
    contentStyle: { 
      backgroundColor: colors.bg 
    }
  };

  return {
    ThemedStatusBar,
    screenOptions,
    colors,
    isDark
  };
} 