import React, { useState, useRef } from 'react';
import { View, Pressable, Animated, Platform, UIManager, ViewStyle } from 'react-native';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface ExpandableProps {
  icon?: IconName;
  title: string;
  description?: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
}

const Expandable: React.FC<ExpandableProps> = ({
  icon,
  title,
  description,
  children,
  defaultExpanded = false,
  expanded,
  onPress,
  className,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded ?? defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(expanded ?? defaultExpanded ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value(expanded ?? defaultExpanded ? 1 : 0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    onPress?.();

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  return (
    <View className={`border-b border-light-secondary dark:border-dark-secondary ${className}`} style={style}>
      <Pressable
        onPress={toggleExpand}
        className="flex-row items-center py-5"
      >
        {icon && (
          <View className="mr-4">
            <Icon name={icon} size={24} strokeWidth={1.2} />
          </View>
        )}
        <View className="flex-1">
          <ThemedText className="text-base font-medium">{title}</ThemedText>
          {description && (
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
              {description}
            </ThemedText>
          )}
        </View>
        <Animated.View style={{
          transform: [{
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['-90deg', '0deg']
            })
          }]
        }}>
          <Icon
            name="ChevronDown"
            size={20}
          />
        </Animated.View>
      </Pressable>
      <Animated.View 
        style={{
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000]
          }),
          opacity: heightAnim,
          overflow: 'hidden'
        }}
      >
        <View className="px-4 pb-4 pt-4">{children}</View>
      </Animated.View>
    </View>
  );
};

export default Expandable;