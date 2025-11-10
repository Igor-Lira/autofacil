import { useRef } from 'react';
import { Animated } from 'react-native';

export const useCollapsibleTitle = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return {
    scrollY,
    scrollHandler,
    scrollEventThrottle: 16,
    // For FlatList compatibility
    onScroll: scrollHandler,
  };
}; 