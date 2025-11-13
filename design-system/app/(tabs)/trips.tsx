import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Link } from 'expo-router';
import { shadowPresets } from '@/utils/useShadow';
import ThemeScroller from '@/components/ThemeScroller';
import AnimatedView from '@/components/AnimatedView';
import Header, { HeaderIcon } from '@/components/Header';
import { useCollapsibleTitle } from '@/app/hooks/useCollapsibleTitle';


const tripsByYear = {
    2025: [
        {
            id: 1,
            title: 'Barcelona',
            descrition: 'Summer vacation',
            image: require('@/assets/img/room-1.avif'),
            date: '15 Aug - 22 Aug, 2025',
        },
        {
            id: 2,
            title: 'Tokyo',
            descrition: 'Cherry blossom season',
            image: require('@/assets/img/room-2.avif'),
            date: '05 Apr - 12 Apr, 2025',
        },
    ],
    2024: [
        {
            id: 3,
            title: 'Paris',
            descrition: 'City of lights',
            image: require('@/assets/img/room-3.avif'),
            date: '10 Sep - 17 Sep, 2024',
        },
        {
            id: 4,
            title: 'London',
            descrition: 'Business trip',
            image: require('@/assets/img/room-4.avif'),
            date: '22 May - 25 May, 2024',
        },
        {
            id: 5,
            title: 'Amsterdam',
            descrition: 'Weekend getaway',
            image: require('@/assets/img/room-5.avif'),
            date: '03 Mar - 06 Mar, 2024',
        },
    ],
    2023: [
        {
            id: 6,
            title: 'Rome',
            descrition: 'Historical tour',
            image: require('@/assets/img/room-1.avif'),
            date: '18 Oct - 25 Oct, 2023',
        },
        {
            id: 7,
            title: 'New York',
            descrition: 'Broadway shows',
            image: require('@/assets/img/room-2.avif'),
            date: '12 Dec - 19 Dec, 2023',
        },
    ],
    2022: [
        {
            id: 8,
            title: 'Dubai',
            descrition: 'Desert adventure',
            image: require('@/assets/img/room-3.avif'),
            date: '20 Nov - 27 Nov, 2022',
        },
        {
            id: 9,
            title: 'Bali',
            descrition: 'Tropical paradise',
            image: require('@/assets/img/room-4.avif'),
            date: '08 Jul - 18 Jul, 2022',
        },
        {
            id: 10,
            title: 'Iceland',
            descrition: 'Northern lights',
            image: require('@/assets/img/room-5.avif'),
            date: '15 Feb - 22 Feb, 2022',
        },
    ],
};

const TripsScreen = () => {
    const { scrollY, scrollHandler, scrollEventThrottle } = useCollapsibleTitle();

    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Header 
                title="Your Trips"
                variant="collapsibleTitle"
                scrollY={scrollY}
            />
            <AnimatedView animation="scaleIn" className='flex-1'>
                <ThemeScroller
                    className='pt-4'
                    onScroll={scrollHandler}
                    scrollEventThrottle={scrollEventThrottle}
                >

                    {Object.entries(tripsByYear)
                        .sort(([a], [b]) => Number(b) - Number(a)) 
                        .map(([year, trips], index) => (
                            <View key={year}>
                                {index > 0 && <YearDivider year={year} />}
                                {trips.map((trip) => (
                                    <TripCard
                                        key={trip.id}
                                        title={trip.title}
                                        image={trip.image}
                                        date={trip.date}
                                    />
                                ))}
                            </View>
                        ))}

                </ThemeScroller>
            </AnimatedView>
        </View>
    );
};

const YearDivider = (props: any) => {
    return (
        <View className='w-full mb-4 items-center justify-center'>
            <View className='w-px h-4 bg-gray-300 dark:bg-gray-800' />
            <ThemedText className='text-base text-gray-500 my-1'>{props.year}</ThemedText>
            <View className='w-px h-4 bg-gray-300 dark:bg-gray-800' />
        </View>
    );
};

const TripCard = (props: { title: string; image: any; date: string; }) => {
    return (
        <View className='relative'>
            <Link asChild href="/screens/trip-detail">
                <TouchableOpacity
                    style={{
                        ...shadowPresets.large
                    }}
                    activeOpacity={0.8} className='w-full p-2 mb-4 flex flex-row items-center rounded-2xl bg-light-primary dark:bg-dark-secondary'>
                    <Image source={props.image} className='w-20 h-20 rounded-xl' />
                    <View className='px-4'>
                        <ThemedText className='text-base font-bold'>{props.title}</ThemedText>
                        <ThemedText className='text-xs text-gray-500'>{props.date}</ThemedText>
                    </View>
                </TouchableOpacity>
            </Link>
        </View>
    );
};

export default TripsScreen; 