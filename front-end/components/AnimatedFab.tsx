import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TouchableWithoutFeedback, ViewStyle, TextStyle, Dimensions, LayoutChangeEvent } from 'react-native';
import { styled } from 'nativewind';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import Icon, { IconName } from './Icon';
import useThemeColors from '@/app/contexts/ThemeColors';

const StyledAnimatedView = styled(Animated.View);
const StyledView = styled(View);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);
const { width: windowWidth } = Dimensions.get('window');
type AnimatedFabProps = {
  icon: IconName;
  children: React.ReactNode;
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
  iconSize?: number;
  backgroundColor?: string;
  iconColor?: string;
  className?: string;
  contentClassName?: string;
  iconClassName?: string;
  style?: ViewStyle;
  onOpen?: () => void;
  onClose?: () => void;
};

const AnimatedFab: React.FC<AnimatedFabProps> = ({
  icon,
  children,
  position = 'bottomRight',
  iconSize = 24,
  backgroundColor,
  iconColor,
  className,
  contentClassName,
  iconClassName,
  onOpen,
  onClose,
  style
}) => {
  const colors = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  
  // Default size of the FAB in collapsed state
  const baseSize = iconSize * 2;
  
  // Improved content height measurement
  const [contentHeight, setContentHeight] = useState(baseSize * 2);
  const contentMeasureRef = useRef<View>(null);
  const [isContentMeasured, setIsContentMeasured] = useState(false);
  
  // Animation values
  const animation = useSharedValue(0);

  // Cleanup animation value on unmount
  useEffect(() => {
    return () => {
      // Reset animation value before cleanup
      animation.value = 0;
    };
  }, []);

  // Reset animation when theme changes
  useEffect(() => {
    if (isOpen) {
      animation.value = withTiming(1, { duration: 300 });
    } else {
      animation.value = withTiming(0, { duration: 300 });
    }
  }, [colors.isDark]);

  // Measure content using an invisible clone
  useEffect(() => {
    if (contentMeasureRef.current && !isContentMeasured) {
      setTimeout(() => {
        if (contentMeasureRef.current) {
          contentMeasureRef.current.measure((x, y, width, height) => {
            if (height > 0) {
              // Add padding and set minimum height
              const newHeight = Math.max(baseSize * 1, height + 0);
              setContentHeight(newHeight);
              setIsContentMeasured(true);
            }
          });
        }
      }, 100);
    }
  }, [contentMeasureRef.current, isContentMeasured, baseSize]);
  
  // Handle toggle state
  const toggleOpen = useCallback(() => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    
    // Run animation
    animation.value = withTiming(newValue ? 1 : 0, { duration: 300 });
    
    // Trigger callbacks if provided
    if (newValue && onOpen) {
      onOpen();
    } else if (!newValue && onClose) {
      onClose();
    }
  }, [isOpen, animation, onOpen, onClose]);
  
  // Position classes based on the position prop
  const getPositionClasses = (): string => {
    switch (position) {
      case 'bottomRight':
        return 'bottom-4 right-4';
      case 'bottomLeft':
        return 'bottom-4 left-4';
      case 'topRight':
        return 'top-4 right-4';
      case 'topLeft':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };
  
  // Animated styles for the container
  const containerStyle = useAnimatedStyle(() => {
    // Width expands from a circle to a rectangle
    const width = interpolate(
      animation.value,
      [0, 1],
      [baseSize, windowWidth - 30],
      Extrapolate.CLAMP
    );
    
    // Use the measured content height for the expanded state
    const height = interpolate(
      animation.value,
      [0, 1],
      [baseSize, contentHeight],
      Extrapolate.CLAMP
    );
    
    // Border radius changes from circle to rounded rectangle
    const borderRadius = interpolate(
      animation.value,
      [0, 1],
      [baseSize / 2, 12],
      Extrapolate.CLAMP
    );
    
    return {
      width,
      height,
      borderRadius,
    };
  });
  
  // Animated styles for the icon
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      animation.value,
      [0, 1],
      [0, 45], // Rotate 45 degrees when open
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      animation.value,
      [0, 0.5, 1],
      [1, 0.3, 0],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ rotate: `${rotate}deg` }],
      opacity,
    };
  });
  
  // Animated styles for the content
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animation.value,
      [0, 0.7, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      animation.value,
      [0, 1],
      [20, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const bgColor = backgroundColor || colors.highlight;
  
  return (
    <>
      {/* Hidden content measure view */}
      <StyledView 
        className="absolute opacity-0 pointer-events-none left-[-9999px]"
        style={{ width: windowWidth - 30 }}
        ref={contentMeasureRef}
      >
        <View className="pb-10">
          {children}
        </View>
      </StyledView>
    
      <TouchableWithoutFeedback>
        <StyledAnimatedView
          className={
            `absolute items-center justify-center z-10 shadow-md shadow-black/30 bg-black dark:bg-white
            ${getPositionClasses()}
            ${className}`
          }
          style={[
            containerStyle,
            //{ backgroundColor: bgColor }
          ]}
        >
          <TouchableWithoutFeedback onPress={toggleOpen}>
            <StyledAnimatedView 
              className={`absolute items-center justify-center z-20 ${iconClassName}`}
              style={[iconAnimatedStyle, style]}
            >
            <Icon
              name={icon}
              size={iconSize}
                color={iconColor || 'white'}
              />
            </StyledAnimatedView>
          </TouchableWithoutFeedback>

          {/**THIS IS CONTENT OF THE FAB */}
          <StyledAnimatedView 
            className={`absolute w-full h-full p-6 pb-0 items-start justify-start z-10 ${contentClassName}`}
            style={[contentAnimatedStyle, style]}
          >
            <Icon name="X" size={24} color="white" className='absolute top-2 right-2 z-50'  onPress={toggleOpen} />
            {children}
          </StyledAnimatedView>
        </StyledAnimatedView>
      </TouchableWithoutFeedback>
    </>
  );
};

export default AnimatedFab; 