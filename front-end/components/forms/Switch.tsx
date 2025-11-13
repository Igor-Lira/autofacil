import React, { useState, useRef } from 'react';
import { View, Pressable, Animated, Switch as RNSwitch, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import ThemedText from '../ThemedText';
import Icon, { IconName } from '../Icon';
import useThemeColors from '@/app/contexts/ThemeColors';

interface SwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = '',
  style,
}) => {
  const colors = useThemeColors();
  const [isOn, setIsOn] = useState(value ?? false);
  const slideAnim = useRef(new Animated.Value(value ?? false ? 1 : 0)).current;

  // Handle controlled vs uncontrolled state
  const isControlled = value !== undefined;
  const switchValue = isControlled ? value : isOn;

  const toggleSwitch = () => {
    if (disabled) return;
    
    const newValue = !switchValue;
    
    // Update internal state if uncontrolled
    if (!isControlled) {
      setIsOn(newValue);
    }
    
    // Call callback if provided
    onChange?.(newValue);
    
    // Animate the switch
    Animated.spring(slideAnim, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12
    }).start();
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={toggleSwitch} 
      disabled={disabled}
      className={`flex-row items-center py-1 ${disabled ? 'opacity-100' : ''} ${className}`}
      style={style}
    >
      {icon && (
        <View className="mr-3">
          <Icon name={icon} size={20} color={colors.text} />
        </View>
      )}
      
      <View className="flex-1">
        {label && (
          <ThemedText className="font-medium text-base">{label}</ThemedText>
        )}
        {description && (
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
            {description}
          </ThemedText>
        )}
      </View>
      

        <View className="w-10 h-6 rounded-full">
          <View
            className={`w-full h-full rounded-full absolute ${switchValue ? 'bg-highlight' : 'bg-light-secondary dark:bg-white/40'}`}
          />
          <Animated.View
            style={{
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1.2],
                  outputRange: [1, 21]
                })
              }]
            }}
            className="w-5 h-5 bg-white dark:bg-white rounded-full shadow-sm my-0.5"
          />
        </View>
    </TouchableOpacity>
  );
};

export default Switch; 