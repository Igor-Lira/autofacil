import React, { useState } from 'react';
import { Pressable, Animated } from 'react-native';
import { useTheme } from 'app/contexts/ThemeContext';
import Icon from './Icon';

interface ThemeToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange }) => {
  const { isDark, toggleTheme } = useTheme();
  const [scale] = useState(new Animated.Value(1)); // Initial scale value
  const [rotate] = useState(new Animated.Value(0)); // Initial rotate value
  const [isAnimating, setIsAnimating] = useState(false);

  const animateIcon = () => {
    if (isAnimating) return; 

    setIsAnimating(true); 
    // Start the animation (scaling and rotating out)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9, // Scale up
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 45, // Rotate 45 degrees
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1, // Reset scale back to 1
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0, // Reset rotation back to 0
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setIsAnimating(false)); // Reset animation state when animation completes
  };

  const handlePress = () => {
    if (onChange) {
      onChange(!value);
    } else {
      toggleTheme();
    }
    animateIcon();
  };

  const isActive = value !== undefined ? value : isDark;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={{
          transform: [
            { scale },
            { rotate: rotate.interpolate({ inputRange: [0, 45], outputRange: ['0deg', '45deg'] }) },
          ],
        }}
      >
        {isActive ? (
          <Icon name="Sun" size={22}  />
        ) : (
          <Icon name="Moon" size={22}  />
        )}
      </Animated.View>
    </Pressable>
  );
};

export default ThemeToggle;
