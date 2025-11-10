import React from 'react';
import { ScrollView, ScrollViewProps, View, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styled } from 'nativewind';

interface ThemeScrollerProps extends ScrollViewProps {
  children: React.ReactNode;
  onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | any;
  contentContainerStyle?: any;
  scrollEventThrottle?: number;
  headerSpace?: boolean;
}

// Use basic ScrollView instead of styled for better compatibility with Animated
const StyledScrollView = styled(ScrollView);

export default function ThemedScroller({
  children,
  className,
  onScroll,
  contentContainerStyle,
  scrollEventThrottle = 16,
  headerSpace = false,
  ...props
}: ThemeScrollerProps) {
  return (
    <StyledScrollView
      showsVerticalScrollIndicator={false}
      style={{ width: "100%" }}
      //bounces={false}
      overScrollMode='never'
      className={`bg-light-primary dark:bg-dark-primary flex-1 px-global ${className || ''}`}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      contentContainerStyle={[
        headerSpace && { paddingTop: 70 }, // Add space for fixed header 
        contentContainerStyle
      ]}
      {...props}
    >
      {children}
      <View className="h-20 w-full" />
    </StyledScrollView>
  );
}

// Create an Animated version of ScrollView for use with Animated.event
export const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
