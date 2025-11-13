import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Animated, Platform, ViewStyle } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import useThemeColors from '@/app/contexts/ThemeColors';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '@/app/contexts/ThemeContext';
import { InputVariant } from './Input';

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string | number;
    onChange: (value: string | number) => void;
    error?: string;
    className?: string;
    style?: ViewStyle;
    variant?: InputVariant;
}

const Select: React.FC<SelectProps> = ({
    label,
    placeholder = '',
    options,
    value,
    onChange,
    error,
    className,
    style,
    variant = 'animated'
}) => {
    const { isDark } = useTheme();
    const colors = useThemeColors();
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | undefined>(
        options.find(option => option.value === value)
    );

    React.useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync(colors.bg);
            NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

            return () => {
                // Reset to default theme color when component unmounts
                NavigationBar.setBackgroundColorAsync(colors.bg);
                NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
            };
        }
    }, [isDark, colors.bg]);

    const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    React.useEffect(() => {
        if (variant !== 'classic') {
            Animated.timing(animatedLabelValue, {
                toValue: (isFocused || selectedOption) ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [isFocused, selectedOption, animatedLabelValue, variant]);

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

    const handleSelect = (option: SelectOption) => {
        setSelectedOption(option);
        onChange(option.value);
        actionSheetRef.current?.hide();
    };

    const handlePress = () => {
        setIsFocused(true);
        actionSheetRef.current?.show();
    };

    const handleClose = () => {
        setIsFocused(false);
    };

    // Render the action sheet
    const renderActionSheet = () => (
        <ActionSheet
            ref={actionSheetRef}
            onClose={handleClose}
            isModal={true}
            enableGesturesInScrollView={true}
            statusBarTranslucent={true}
            drawUnderStatusBar={false}
            containerStyle={{
                backgroundColor: colors.bg,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20
            }}
            animated={true}
            openAnimationConfig={{
                stiffness: 3000,
                damping: 500,
                mass: 3,
                overshootClamping: true,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01
            }}
            closeAnimationConfig={{
                stiffness: 1000,
                damping: 500,
                mass: 3,
                overshootClamping: true,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01
            }}
        >
            <View className="p-4">
                {options.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => handleSelect(option)}
                        className={`py-3 px-4 rounded-lg mb-2 ${selectedOption?.value === option.value ? 'bg-light-secondary dark:bg-dark-secondary' : ''}`}
                    >
                        <ThemedText>
                            {option.label}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>
        </ActionSheet>
    );

    // Classic variant
    if (variant === 'classic') {
        return (
            <View className={`mb-4 ${className || ''}`} style={style}>
                {label && (
                    <ThemedText className="mb-1 font-medium">{label}</ThemedText>
                )}
                <View className="relative">
                    <TouchableOpacity
                        onPress={handlePress}
                        className={`w-full bg-transparent border rounded-lg px-4 py-3 h-14 flex-row justify-between items-center 
                            ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
                            ${error ? 'border-red-500' : ''}`}
                    >
                        <ThemedText className={selectedOption ? '' : 'text-light-subtext dark:text-dark-subtext'}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </ThemedText>
                        <Icon name="ChevronDown" size={20} />
                    </TouchableOpacity>
                </View>
                {error && (
                    <Text className="text-red-500 text-sm mt-1">{error}</Text>
                )}
                {renderActionSheet()}
            </View>
        );
    }

    // Underlined variant
    if (variant === 'underlined') {
        return (
            <View className={`mb-4 ${className || ''}`} style={style}>
                <View className="relative">
                    <Pressable className='px-0 bg-light-primary dark:bg-dark-primary z-40' onPress={handlePress}>
                        <Animated.Text 
                            style={[underlinedLabelStyle]} 
                            className="absolute z-50 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                        >
                            {label}
                        </Animated.Text>
                    </Pressable>
                    <TouchableOpacity
                        onPress={handlePress}
                        className={`w-full bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 px-0 py-3 h-14 flex-row justify-between items-center 
                            ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
                            ${error ? 'border-red-500' : ''}`}
                    >
                        <ThemedText className={selectedOption ? '' : 'text-light-subtext dark:text-dark-subtext'}>
                            {selectedOption ? selectedOption.label : ''}
                        </ThemedText>
                        <Icon name="ChevronDown" size={20} />
                    </TouchableOpacity>
                </View>
                {error && (
                    <Text className="text-red-500 text-sm mt-1">{error}</Text>
                )}
                {renderActionSheet()}
            </View>
        );
    }

    // Default animated variant
    return (
        <View className={`mb-4 ${className || ''}`} style={style}>
            <View className="relative">
                <Pressable className='px-1 bg-light-primary dark:bg-dark-primary z-40' onPress={handlePress}>
                    <Animated.Text 
                        style={[labelStyle]} 
                        className="absolute z-50 px-1 bg-light-primary dark:bg-dark-primary text-black dark:text-white"
                    >
                        {label}
                    </Animated.Text>
                </Pressable>
                <TouchableOpacity
                    onPress={handlePress}
                    className={`w-full bg-transparent border rounded-lg px-4 py-3 h-14 flex-row justify-between items-center 
                        ${isFocused ? 'border-black dark:border-white' : 'border-black/60 dark:border-white/60'}
                        ${error ? 'border-red-500' : ''}`}
                >
                    <ThemedText className={selectedOption ? '' : 'text-light-subtext dark:text-dark-subtext'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </ThemedText>
                    <Icon name="ChevronDown" size={20} />
                </TouchableOpacity>
            </View>
            {error && (
                <Text className="text-red-500 text-sm mt-1">{error}</Text>
            )}
            {renderActionSheet()}
        </View>
    );
};

export default Select;