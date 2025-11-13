import React from 'react';
import { View, ViewStyle } from 'react-native';
import ThemedText from './ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import Icon from './Icon';
import Avatar from './Avatar';

interface ReviewProps {
  rating: number;
  description: string;
  date: string;
  username?: string;
  avatar?: string;
  className?: string;
  style?: ViewStyle;
}

const Review: React.FC<ReviewProps> = ({
  rating,
  description,
  date,
  username,
  avatar,
  className = '',
  style
}) => {
  const colors = useThemeColors();
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon 
          key={i}
          name="Star" 
          size={16} 
          fill={i < rating ? colors.text : 'none'}
          color={i < rating ? colors.text : colors.text}
          strokeWidth={1.5}
          className="mr-1"
        />
      );
    }
    
    return (
      <View className="flex-row items-center">
        {stars}
        <ThemedText className="text-sm ml-1">{rating}.0</ThemedText>
      </View>
    );
  };

  return (
    <View className={` ${className}`} style={style}>
      <View className="flex-row">
        {(avatar || username) && (
          <Avatar 
            src={avatar}
            name={username}
            size="xs"
            className="mr-3"
          />
        )}
        <View className="flex-1">
          {username && (
            <ThemedText className="font-bold mb-1">{username}</ThemedText>
          )}
          <View className="flex-row justify-between items-center mb-2">
            {renderStars()}
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">{date}</ThemedText>
          </View>
          <ThemedText className="text-sm">{description}</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default Review; 