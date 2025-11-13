import React, { useState, useRef } from 'react';
import { Pressable, View, Text } from 'react-native';
import Icon from './Icon';
import { Button } from './Button';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import ActionSheetThemed from './ActionSheetThemed';
import { ActionSheetRef } from 'react-native-actions-sheet';
import ThemedText from './ThemedText';
import { router } from 'expo-router';

interface FavoriteProps {
  initialState?: boolean;
  size?: number;
  className?: string;
  productName?: string;
  isWhite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

const Favorite: React.FC<FavoriteProps> = ({
  initialState = false,
  size = 24,
  className = '',
  productName = 'Product',
  onToggle,
  isWhite = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialState);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const colors = useThemeColors();

  const handleToggle = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    actionSheetRef.current?.show();

    if (onToggle) {
      onToggle(newState);
    }
  };

  const handleViewFavorites = () => {
    actionSheetRef.current?.hide();
    // Navigate to favorites screen
    router.push('/(drawer)/(tabs)/favorites');
  };

  return (
    <>
      <Pressable onPress={handleToggle} className={className}>
        {isWhite ? (
          <Icon
            name="Heart"
            size={size}
            fill={isFavorite ? colors.highlight : 'rgba(0,0,0,0.3)'}
            color={isFavorite ? colors.highlight : 'white'}
            strokeWidth={1.8}
          />
        ) : (
          <Icon
            name="Heart"
            size={size}
            fill={isFavorite ? colors.highlight : 'none'}
            color={isFavorite ? colors.highlight : colors.icon}
            strokeWidth={1.8}
          />
        )}
      </Pressable>

      <ActionSheetThemed
        ref={actionSheetRef}
        gestureEnabled
      >
        <View className="p-4 pb-6">
          <ThemedText className="text-lg font-bold mt-4 mb-1 text-left">
            {isFavorite ? 'Added to Bookmarks' : 'Removed from Bookmarks'}
          </ThemedText>

          <ThemedText className="text-left mb-6">
            {isFavorite
              ? `${productName} has been added to your bookmarks.`
              : `${productName} has been removed from your bookmarks.`
            }
          </ThemedText>

          <View className="flex-row w-full justify-center">
            {isFavorite && (
              <Button
                title="View Bookmarks"
                className="flex-1"
                onPress={handleViewFavorites}
              />
            )}

            <Button
              title="Continue Browsing"
              variant="outline"
              className={isFavorite ? "ml-3 px-6" : "px-6"}
              onPress={() => actionSheetRef.current?.hide()}
            />
          </View>
        </View>
      </ActionSheetThemed>
    </>
  );
};

export default Favorite; 