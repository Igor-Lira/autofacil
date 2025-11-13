import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from 'app/contexts/ThemeContext';
import Icon from './Icon';
import useThemeColors from '@/app/contexts/ThemeColors';

interface ThemeToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();
  
  // Use controlled or uncontrolled mode
  const isControlled = value !== undefined;
  const isActive = isControlled ? value : isDark;
  
  // Create animation value - initialize based on current state
  const slideAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  
  // Update animation when theme changes - simplified approach
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive, slideAnim]);

  const handlePress = () => {
    // Handle controlled or uncontrolled mode
    if (isControlled && onChange) {
      onChange(!value);
    } else if (!isControlled) {
      toggleTheme();
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={handlePress}
      className={`flex-row items-center py-1 ${className}`}
    >
      <View className="w-20 h-10 rounded-full flex-row items-center justify-between">
        <View className="absolute w-full h-full rounded-full bg-light-secondary dark:bg-dark-secondary" />
        
        {/* Sun icon on left */}
        <View className="z-10 w-8 h-8 items-center justify-center ml-1">
          <Icon name="Sun" size={16} color={isActive ? colors.placeholder : colors.text} />
        </View>
        
        {/* Moon icon on right */}
        <View className="z-10 w-8 h-8 items-center justify-center mr-1">
          <Icon name="Moon" size={16} color={!isActive ? colors.placeholder : colors.text} />
        </View>
        
        {/* Animated thumb */}
        <Animated.View
          style={{
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 43] // Move from left (1px) to right (41px)
              })
            }],
            position: 'absolute',
            top: 4,
          }}
          className="w-8 h-8 bg-white dark:bg-dark-primary rounded-full shadow-sm"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ThemeToggle;
