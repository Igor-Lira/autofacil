import React, { useRef } from 'react';
import { View, Text, Image, Pressable, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { MapStyleElement, Marker } from 'react-native-maps';
import useThemeColors from '@/app/contexts/ThemeColors';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ActionSheet, { ActionSheetRef, useSheetRef, FlatList } from "react-native-actions-sheet";
import SliderCard from '@/components/SliderCard';
import CustomCard from '@/components/CustomCard';
import ShowRating from '@/components/ShowRating';
import ImageCarousel from '@/components/ImageCarousel';
import { Button } from '@/components/Button';
import { CardScroller } from '@/components/CardScroller';
import Icon from '@/components/Icon';
import * as LucideIcons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '@/components/SearchBar';
import PriceMarker from '@/components/PriceMarker';
import Section from '@/components/layout/Section';
import { Chip } from '@/components/Chip';
type IconName = Exclude<keyof typeof LucideIcons, 'createLucideIcon' | 'default'>;

const { height } = Dimensions.get('window');

const properties = [
    {
        id: 1,
        title: 'Beachfront Villa',
        price: '$200',
        rating: '4.9',
        description: 'Stay with Julia',
        lat: 40.7589, // Manhattan - Times Square area
        lng: -73.9851,
        image: ['https://tinyurl.com/2blrf2sk', 'https://tinyurl.com/2yyfr9rc'] // Multiple images for the first property
    },
    {
        id: 2,
        title: 'Cozy Surf Shack',
        price: '$120',
        rating: '4.6',
        description: 'Stay with John',
        lat: 40.6892, // Brooklyn - Park Slope
        lng: -73.9814,
        image: 'https://tinyurl.com/2cmu4ns5' // Single image for the second property
    },
    {
        id: 3,
        title: 'Luxury Penthouse',
        price: '$350',
        rating: '4.8',
        description: 'Stay with Tomas',
        lat: 40.7505, // Manhattan - Chelsea
        lng: -73.9934,
        image: ['https://tinyurl.com/2yyfr9rc', 'https://tinyurl.com/2blrf2sk'] // Multiple images for the last property
    },
    {
        id: 4,
        title: 'Modern Loft',
        price: '$180',
        rating: '4.7',
        description: 'Stay with Sarah',
        lat: 40.7282, // Lower East Side
        lng: -73.9942,
        image: ['https://tinyurl.com/2blrf2sk']
    },
    {
        id: 5,
        title: 'Brooklyn Heights Apartment',
        price: '$160',
        rating: '4.5',
        description: 'Stay with Mike',
        lat: 40.6962, // Brooklyn Heights
        lng: -73.9969,
        image: ['https://tinyurl.com/2yyfr9rc']
    },
    {
        id: 6,
        title: 'Queens Studio',
        price: '$95',
        rating: '4.3',
        description: 'Stay with Anna',
        lat: 40.7282, // Long Island City, Queens
        lng: -73.9442,
        image: ['https://tinyurl.com/2cmu4ns5']
    }
];


const FavoriteListScreen = () => {
    const colors = useThemeColors();
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();
    const [selectedMarkerId, setSelectedMarkerId] = React.useState<number | null>(null);
    const [currentSnapIndex, setCurrentSnapIndex] = React.useState(0);
    React.useEffect(() => {
        actionSheetRef.current?.show();
    }, []);



    const rightComponents = [
        <>
            <HeaderIcon
                onPress={() => {
                    if (!actionSheetRef.current) return;
                    const nextIndex = actionSheetRef.current.currentSnapIndex() === 0 ? 1 : 0;
                    actionSheetRef.current.snapToIndex(nextIndex);
                    setSnapIndex(nextIndex);
                }}
                icon="Map" href="0" />
        </>
    ];

    const [snapIndex, setSnapIndex] = React.useState(0);
    return (
        <>
            <Header showBackButton
                rightComponents={rightComponents} />

            <View className="flex-1 bg-light-primary dark:bg-dark-primary">
                <MapView
                    ref={mapRef}
                    className="w-full h-[100vh]"
                    initialRegion={{
                        latitude: 40.7282, // Center of New York City
                        longitude: -73.9776,
                        latitudeDelta: 0.1, // Zoom out to show more of NYC
                        longitudeDelta: 0.1,
                    }}
                >
                    {properties.map((property) => (
                        <PriceMarker
                            key={property.id}
                            coordinate={{ latitude: property.lat, longitude: property.lng }}
                            price={property.price}
                            title={property.title}
                            isSelected={selectedMarkerId === property.id}
                            onPress={() => {
                                setSelectedMarkerId(property.id);
                                // Optionally scroll to the property in the list
                                console.log('Selected property:', property.title);
                            }}
                        />
                    ))}
                </MapView>

                <ActionSheet
                    ref={actionSheetRef}
                    isModal={false}
                    CustomHeaderComponent={
                        <View className='w-full items-center justify-center mb-2'>
                            <View className="w-14 h-2 mt-2 rounded-full bg-light-secondary dark:bg-dark-secondary" />
                        </View>
                    }
                    backgroundInteractionEnabled
                    initialSnapIndex={1}
                    snapPoints={[10, 100]}
                    gestureEnabled
                    overdrawEnabled={false}
                    closable={false}
                    containerStyle={{
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        backgroundColor: colors.bg
                    }}

                >
                    <FlatList
                        className='px-2'
                        data={properties}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <>
                                <Section title="Favorite List" titleSize='3xl' className='p-global'>
                                    <View className='flex-row pt-3 gap-1'>
                                        <Chip label="2 guests" size='lg' />
                                        <Chip icon="Share2" label="Share" size='lg' />
                                    </View>
                                </Section>
                            </>
                        }
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <CustomCard
                                padding="md"
                                className="my-0 w-full overflow-hidden"
                                href='/screens/product-detail'
                            >
                                <ImageCarousel
                                    rounded='xl'
                                    height={300}
                                    className='w-full'
                                    images={Array.isArray(item.image) ? item.image : [item.image]}
                                />
                                <View className='py-global'>
                                    <View className="flex-row items-center justify-between">
                                        <ThemedText className="text-base font-bold">{item.title}</ThemedText>
                                        <ShowRating rating={Number(item.rating)} size="md" />
                                    </View>
                                    <Text className="text-sm text-light-subtext dark:text-dark-subtext">
                                        {item.description}
                                    </Text>
                                    <ThemedText className='font-bold text-base mt-2'>{item.price} <Text className="font-normal">night</Text></ThemedText>

                                </View>
                            </CustomCard>
                        )}
                    />
                </ActionSheet>
                {/* <View style={{ paddingBottom: insets.bottom }} className='w-full items-center justify-center z-[9999] absolute bottom-0 left-0 right-0'>
                    <Button iconStart="Map" iconColor='white'

                        className={`bg-black`} rounded='full' title="Show map" onPress={() => {
                            if (!actionSheetRef.current) return;
                            const nextIndex = actionSheetRef.current.currentSnapIndex() === 0 ? 1 : 0;
                            actionSheetRef.current.snapToIndex(nextIndex);
                            setSnapIndex(nextIndex);
                        }} />
                </View>*/}
            </View>
        </>
    );
};


const PropertyType = (props: {
    title: string,
    icon: IconName,
    isActive?: boolean,
}) => {
    return (
        <TouchableOpacity className={`items-center justify-normal px-4 py-4 min-w-[50px] flex-shrink-0 ${props.isActive ? 'border-b-2 border-black dark:border-white opacity-100' : 'opacity-70'}`}>
            <Icon name={props.icon} size={25} strokeWidth={1.5} />
            <ThemedText className='text-xs mt-2'>{props.title}</ThemedText>
        </TouchableOpacity>
    )
}

export default FavoriteListScreen;

// This way, the map shows as the first item, and the properties list scrolls naturally! Let me know if you want to add any animations or refine the layout further. 🚀