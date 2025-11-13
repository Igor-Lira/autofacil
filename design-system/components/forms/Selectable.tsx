import React, { ReactNode } from 'react';
import { View, Pressable, StyleProp, ViewStyle } from 'react-native';
import ThemedText from '../ThemedText';
import Icon, { IconName } from '../Icon';
import useThemeColors from '@/app/contexts/ThemeColors';
import AnimatedView from '../AnimatedView';

interface SelectableProps {
  title: string;
  description?: string;
  icon?: IconName;
  customIcon?: ReactNode;
  iconColor?: string;
  selected?: boolean;
  onPress?: () => void;
  error?: string;
  className?: string;
  containerClassName?: string;
  style?: StyleProp<ViewStyle>;
}

const Selectable: React.FC<SelectableProps> = ({
  title,
  description,
  icon,
  customIcon,
  iconColor,
  selected = false,
  onPress,
  error,
  className = '',
  containerClassName = '',
  style,
}) => {
  const colors = useThemeColors();

  return (
    <View className={`mb-2 ${containerClassName}`} >
      <Pressable
        onPress={onPress}
        style={style}
        className={`
          border  dark:border-transparent rounded-2xl p-4 active:opacity-70 y dark:bg-dark-secondary/50
          ${selected ? ' bg-light-subtext/0 dark:bg-dark-secondary border-highlight' : ' border-neutral-400 dark:border-transparent'}
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
      >
        <View className="flex-row items-center">
          {icon && (
            <View className={`mr-4 h-12 w-12 rounded-xl items-center justify-center bg-light-secondary dark:bg-white/10 ${selected ? 'bg-highlight' : ''}`}>
              <Icon 
                name={icon} 
                size={20} 
                strokeWidth={1.2}
                color={iconColor || (selected ? "white" : colors.icon)}
              />
            </View>
          )}
          {customIcon && (
            <View className="mr-4 h-12 w-12 rounded-xl items-center justify-center bg-light-secondary dark:bg-dark-secondary">
              {customIcon}
            </View>
          )}
          <View className="flex-1">
            <ThemedText className="font-semibold text-base">
              {title}
            </ThemedText>
            {description && (
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-0">
                {description}
              </ThemedText>
            )}
          </View>
          {selected ? (
            <AnimatedView className="ml-3" animation="bounceIn" duration={500}>
              <Icon 
                name="CheckCircle2" 
                size={24} 
                color={colors.highlight}
              />
            </AnimatedView>
          ) : (
            <></>
          )}
        </View>
      </Pressable>

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">
          {error}
        </ThemedText>
      )}
    </View>
  );
};

export default Selectable; 