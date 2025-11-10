import React from 'react';
import { View, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import ThemedText from './ThemedText';

interface PriceMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  price: string;
  title?: string;
  onPress?: () => void;
  isSelected?: boolean;
}

const PriceMarker: React.FC<PriceMarkerProps> = ({
  coordinate,
  price,
  title,
  onPress,
  isSelected = false
}) => {
  
  if (Platform.OS === 'android') {
    // Android: Use default pin markers to avoid sizing issues
    return (
      <Marker
        coordinate={coordinate}
        title={title || price}
        description={`Price: ${price}`}
        onPress={onPress}
        pinColor={isSelected ? '#000000' : '#FF5722'}
      />
    );
  }

  // iOS: Use custom black rectangle markers
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View 
        className={`
          rounded-lg px-3 py-2 min-w-[60px] items-center justify-center
          ${isSelected 
            ? 'bg-black' 
            : 'bg-black'
          }
        `}
      >
        <ThemedText 
          className="text-white text-sm font-bold"
          numberOfLines={1}
        >
          {price}
        </ThemedText>
      </View>
    </Marker>
  );
};

export default PriceMarker; 