import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Platform, Animated, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import { InputVariant } from './Input';

interface TimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  is24Hour?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  variant?: InputVariant;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  error,
  is24Hour = false,
  disabled = false,
  containerClassName = '',
  variant = 'animated',
}) => {
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const [isFocused, setIsFocused] = useState(false);
  const colors = useThemeColors();
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (variant !== 'classic') {
      Animated.timing(animatedLabelValue, {
        toValue: (isFocused || value) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, animatedLabelValue, variant]);

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
    left: 12,
    paddingHorizontal: 8,
  };

  const underlinedLabelStyle = {
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
    left: 0,
    paddingHorizontal: 0,
  };

  const showTimePicker = () => {
    if (disabled) return;
    setIsFocused(true);
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setIsFocused(false);
    setTimePickerVisible(false);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      hideTimePicker();
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    hideTimePicker();
  };

  const formattedTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour
    });
  };

  // Helper function to render time picker
  const renderTimePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          isVisible={isTimePickerVisible}
          onBackdropPress={hideTimePicker}
          style={{ margin: 0, justifyContent: 'flex-end' }}
        >
          <View className="bg-light-primary dark:bg-dark-primary rounded-t-xl items-center justify-center w-full">
            <View className="flex-row justify-between items-center p-4 border-b border-light-secondary dark:border-dark-secondary w-full">
              <Button
                title="Cancel"
                variant="ghost"
                onPress={hideTimePicker}
                textClassName="text-base font-normal"
              />
              <ThemedText className="text-lg font-medium">
                {label || 'Select Time'}
              </ThemedText>
              <Button
                title="Done"
                variant="ghost"
                onPress={handleConfirm}
                textClassName="text-base font-semibold"
              />
            </View>
            <DateTimePicker
              value={tempDate}
              mode="time"
              is24Hour={is24Hour}
              display="spinner"
              onChange={handleTimeChange}
              themeVariant={colors.isDark ? 'dark' : 'light'}
              style={{ backgroundColor: colors.bg }}
            />
          </View>
        </Modal>
      );
    } else {
      return isTimePickerVisible && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          is24Hour={is24Hour}
          display="default"
          onChange={handleTimeChange}
        />
      );
    }
  };

  // Classic variant
  if (variant === 'classic') {
    return (
      <View className={`mb-global ${containerClassName}`}>
        {label && (
          <ThemedText className="mb-1 font-medium">{label}</ThemedText>
        )}
        <View className="relative">
          <TouchableOpacity
            onPress={showTimePicker}
            disabled={disabled}
            className={`border rounded-lg py-4 px-3 h-14 pr-10 text-black dark:text-white bg-transparent
              ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50' : ''}`}
          >
            <ThemedText className={value ? 'text-base' : 'text-base text-gray-500'}>
              {value ? formattedTime(value) : placeholder}
            </ThemedText>
          </TouchableOpacity>
          <Pressable className="absolute right-3 top-[18px] z-10">
            <Icon name="Clock" size={20} color={colors.text} />
          </Pressable>
        </View>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    );
  }

  // Underlined variant
  if (variant === 'underlined') {
    return (
      <View className={`mb-global ${containerClassName}`}>
        <View className="relative">
          <Pressable className='px-0 bg-light-primary dark:bg-dark-primary z-40' onPress={showTimePicker}>
            <Animated.Text 
              style={[underlinedLabelStyle]} 
              className="absolute z-50 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
            >
              {label}
            </Animated.Text>
          </Pressable>
          <TouchableOpacity
            onPress={showTimePicker}
            disabled={disabled}
            className={`border-b-2 py-4 px-0 h-14 pr-10 text-black dark:text-white bg-transparent border-t-0 border-l-0 border-r-0
              ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50' : ''}`}
          >
            <ThemedText className={value ? 'text-base' : 'text-base text-gray-500'}>
              {value ? formattedTime(value) : ''}
            </ThemedText>
          </TouchableOpacity>
          <Pressable className="absolute right-0 top-[18px] z-10">
            <Icon name="Clock" size={20} color={colors.text} />
          </Pressable>
        </View>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    );
  }

  // Default animated variant
  return (
    <View className={`mb-global ${containerClassName}`}>
      <View className="relative">
        <Pressable className='px-1 bg-light-primary dark:bg-dark-primary z-40' onPress={showTimePicker}>
          <Animated.Text 
            style={[labelStyle]} 
            className="absolute z-50 px-1 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
          >
            {label}
          </Animated.Text>
        </Pressable>
        <TouchableOpacity
          onPress={showTimePicker}
          disabled={disabled}
          className={`border rounded-lg py-4 px-3 h-14 pr-10 text-black dark:text-white bg-transparent
            ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'opacity-50' : ''}`}
        >
          <ThemedText className={value ? 'text-base' : 'text-base text-gray-500'}>
            {value ? formattedTime(value) : ''}
          </ThemedText>
        </TouchableOpacity>
        <Pressable className="absolute right-3 top-[18px] z-10">
          <Icon name="Clock" size={20} color={colors.text} />
        </Pressable>
      </View>
      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
      {renderTimePicker()}
    </View>
  );
}; 