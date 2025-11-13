import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';

interface ListLinkProps {
  icon?: IconName;
  title: string;
  description?: string;
  href?: string;
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
  iconSize?: number;
  rightIcon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
  hasBorder?: boolean;
}

const ListLink: React.FC<ListLinkProps> = ({
  icon,
  title,
  description,
  href,
  onPress,
  showChevron = false,
  className = '',
  iconSize = 24,
  rightIcon = "ChevronRight",
  disabled = false,
  style,
  hasBorder = false
}) => {
  // Component for the actual content
  const Content = () => (
    <View className={`flex-row items-center py-4 ${className} ${disabled ? 'opacity-50' : ''}`} style={style}>
      {icon && (
        <View className="mr-4">
          <Icon name={icon} size={iconSize} strokeWidth={1.3} />
        </View>
      )}
      <View className="flex-1">
        <ThemedText className="text-base font-normal">{title}</ThemedText>
        {description && (
          <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
            {description}
          </ThemedText>
        )}
      </View>
      {showChevron && (
        <View className='opacity-20'>
          <Icon
            name={rightIcon}
            size={24}
            strokeWidth={2}
          />
        </View>
      )}
    </View>
  );

  // If we have an href, make it a Link, otherwise a Pressable
  if (href && !disabled) {
    return (
      <Link href={href} asChild className={` ${hasBorder ?  'border-b border-light-secondary dark:border-dark-secondary' : ''}`}>
        <Pressable>
          <Content />
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className={` ${hasBorder ? 'border-light-secondary border-b dark:border-dark-secondary' : ''}`}
    >
      <Content />
    </Pressable>
  );
};

export default ListLink; 