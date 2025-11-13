import React from 'react';
import { Image, Pressable, View, Text, ViewStyle, ImageSourcePropType } from 'react-native';
import { Link, router } from 'expo-router';
import ThemedText from './ThemedText';

type AvatarProps = {
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  src?: string | ImageSourcePropType; // Can be a URL string or required image
  name?: string; // for displaying initials if no image
  border?: boolean;
  bgColor?: string; // Optional background color
  onPress?: () => void; // Optional onPress for Pressable or Link
  link?: string; // Optional URL for Link
  className?: string
  style?: ViewStyle;
};

const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  src,
  name,
  border = false,
  bgColor = 'bg-light-secondary dark:bg-dark-secondary',
  onPress,
  link,
  className,
  style,
}) => {
  // Avatar size styles
  const sizeMap = {
    xxs: 'w-7 h-7',
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    xxl: 'w-24 h-24',
  };

  // Define border size and color if enabled
  const borderStyle = border ? 'border-2 border-light-secondary dark:border-dark-secondary' : '';

  // Component for initials if image is not provided
  const renderInitials = () => {
    if (!name) return null;
    const initials = name
      .split(' ')
      .map((part) => part[0].toUpperCase())
      .join('');
    return <ThemedText className=" font-medium text-center">{initials}</ThemedText>;
  };

  // Convert the src prop to an appropriate Image source prop
  const getImageSource = (): ImageSourcePropType => {
    if (!src) {
      // Return a transparent 1x1 pixel as fallback instead of null
      return { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' };
    }
    
    // If src is a string (URL), return it as a uri object
    if (typeof src === 'string') {
      return { uri: src };
    }
    
    // Otherwise it's already a required image or other valid source
    return src;
  };

  const avatarContent = (
    <View
      className={`rounded-full flex-shrink-0 ${bgColor} ${sizeMap[size]} ${borderStyle} items-center justify-center ${className}`}
      style={style}
     >
      {src ? (
        <Image
          source={getImageSource()}
          className="rounded-full w-full h-full object-cover"
        />
      ) : (
        renderInitials()
      )}
    </View>
  );

  if (link) {
    return <Pressable onPress={() => router.push(link)}>{avatarContent}</Pressable>;
  }

  return onPress ? (
    <Pressable onPress={onPress}>{avatarContent}</Pressable>
  ) : (
    avatarContent
  );
};

export default Avatar;
