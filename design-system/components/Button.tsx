// components/Button.tsx
import React from 'react';
import { Text, ActivityIndicator, TouchableOpacity, View, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import Icon, { IconName } from './Icon';

type RoundedOption = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  rounded?: RoundedOption;
  href?: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  iconSize?: number;
  iconColor?: string;
  iconClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'medium',
  rounded = 'lg',
  href,
  className = '',
  textClassName = '',
  disabled = false,
  iconStart,
  iconEnd,
  iconSize,
  iconColor,
  iconClassName = '',
  ...props
}) => {
  const buttonStyles = {
    primary: 'bg-highlight',
    secondary: 'bg-light-secondary dark:bg-dark-secondary',
    outline: 'border border-black dark:border-white bg-transparent',
    ghost: 'bg-transparent',
  };
  
  const buttonSize = {
    small: 'py-2',
    medium: 'py-3',
    large: 'py-5',
  };
  
  const roundedStyles = {
    none: 'rounded-none',
    xs: 'rounded-xs',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  
  const textColor = variant === 'outline' || variant === 'secondary' || variant === 'ghost' ? 'text-black dark:text-white' : 'text-white dark:text-black';
  const disabledStyle = disabled ? 'opacity-50' : '';

  // Default icon sizes based on button size
  const getIconSize = () => {
    if (iconSize) return iconSize;
    
    switch (size) {
      case 'small': return 16;
      case 'medium': return 18;
      case 'large': return 20;
      default: return 18;
    }
  };

  // Default icon color based on variant
  const getIconColor = () => {
    if (iconColor) return iconColor;
    
    // return variant === 'outline' || variant === 'secondary' || variant === 'ghost' 
    //   ? '#000000' // highlight color
    //   : '#FFFFFF'; // white
  };

  const ButtonContent = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' || variant === 'ghost' ? '#0EA5E9' : '#fff'} />
      ) : (
        <View className="flex-row items-center justify-center">
          {iconStart && (
            <Icon 
              name={iconStart} 
              size={getIconSize()} 
              color={getIconColor()} 
              className={`mr-2 ${iconClassName} `} 
            />
          )}
          
          <Text className={`${textColor} font-medium ${textClassName}`}>{title}</Text>
          
          {iconEnd && (
            <Icon 
              name={iconEnd} 
              size={getIconSize()} 
              color={getIconColor()} 
              className={`ml-2 ${iconClassName}`} 
            />
          )}
        </View>
      )}
    </>
  );

  if (href) {
    return (
      <TouchableOpacity
        disabled={loading || disabled}
        activeOpacity={0.8}
        className={`px-4 relative ${buttonStyles[variant]} ${buttonSize[size]} ${roundedStyles[rounded]} items-center justify-center ${disabledStyle} ${className}`} 
        {...props}
        onPress={() => {
          router.push(href);
        }}
      >
        {ButtonContent}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      className={`px-4 relative ${buttonStyles[variant]} ${buttonSize[size]} ${roundedStyles[rounded]} items-center justify-center ${disabledStyle} ${className}`} 
      {...props}
    >
      {ButtonContent}
    </TouchableOpacity>
  );
};
