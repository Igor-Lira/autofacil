import { useTheme } from './ThemeContext';

export const useThemeColors = () => {
  const { isDark } = useTheme();

  return {
    icon: isDark ? 'white' : 'black',
    bg: isDark ? '#171717' : '#ffffff',
    invert: isDark ? '#000000' : '#ffffff',
    secondary: isDark ? '#262626' : '#F5F5F5',
    state: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    sheet: isDark ? '#262626' : '#ffffff',
    highlight: '#FF2056',    
    lightDark: isDark ? '#262626' : 'white',
    border: isDark ? '#404040' : '#E2E8F0',
    text: isDark ? 'white' : 'black',
    placeholder: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    switch: isDark ? 'rgba(255,255,255,0.4)' : '#ccc',
    chatBg: isDark ? '#262626' : '#efefef',
    isDark
  };
};

export default useThemeColors;