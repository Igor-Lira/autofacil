import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput as RNTextInput, Animated, Pressable, TextInputProps } from 'react-native';
import { styled } from 'nativewind';
import Icon from '../Icon';

import ThemedText from '../ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';

interface CustomTextInputProps extends TextInputProps {
  label: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  isPassword?: boolean;
  className?: string;
  containerClassName?: string;
}

const StyledTextInput = styled(RNTextInput);

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  className = '',
  containerClassName = '',
  value,
  onChangeText,
  ...props
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<RNTextInput>(null);

  // Handle label animation
  useEffect(() => {
    Animated.timing(animatedLabelValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedLabelValue]);

  const labelStyle = {
    top: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.placeholder, colors.text],
    }),
    left: 12, // Consistent left padding
    paddingHorizontal: 8, // Consistent padding on both sides
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the right icon based on props and password state
  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <Pressable 
          onPress={togglePasswordVisibility} 
          className="absolute right-3 top-[18px] z-10"
        >
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.text} />
        </Pressable>
      );
    }
    
    if (rightIcon) {
      return (
        <Pressable 
          onPress={onRightIconPress} 
          className="absolute right-3 top-[18px] z-10"
        >
          <Icon name={rightIcon} size={20} color={colors.text} />
        </Pressable>
      );
    }
    
    return null;
  };

  return (
    <View className={`mb-global ${containerClassName}`}>
      <View className="relative">
        <Pressable className='px-1 bg-light-primary dark:bg-dark-primary z-40' onPress={() => inputRef.current?.focus()}>
          <Animated.Text 
            style={[labelStyle]} 
            className="absolute z-50 px-1 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
          >
            {label}
          </Animated.Text>
        </Pressable>
        
        <StyledTextInput
          ref={inputRef}
          className={`border rounded-lg py-3 px-3 h-14 ${(isPassword || rightIcon) ? 'pr-10' : ''} 
            text-black dark:text-white bg-transparent
            ${isFocused ? 'border-black dark:border-white' : 'border-black/40 dark:border-white/40'}
            ${error ? 'border-red-500' : ''}
            ${className}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="transparent"
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
    </View>
  );
};

export default TextInput;