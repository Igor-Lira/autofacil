import React from 'react';

import Header from '@/components/Header';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedFooter from '@/components/ThemeFooter';
import { Image, Pressable } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { View } from 'react-native';
import { shadowPresets } from '@/utils/useShadow';
import Section from '@/components/layout/Section';
import { CardScroller } from '@/components/CardScroller';
import { Chip } from '@/components/Chip';
import { router } from 'expo-router';

interface Reservation {
    id: number;
    guestName: string;
    guestAvatar: string;
    checkIn: string;
    checkOut: string;
    status: 'upcoming' | 'cancelled' | 'past';
    statusText: string;
    nights: number;
    guests: number;
}

const ReservationsScreen = () => {
    const colors = useThemeColors();

    // Map of 6 reservations (5 upcoming + 1 cancelled)
    const reservations: Reservation[] = [
        {
            id: 1,
            guestName: 'Maria Rodriguez',
            guestAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
            checkIn: 'Dec 15',
            checkOut: 'Dec 18',
            status: 'upcoming',
            statusText: 'Arriving tomorrow',
            nights: 3,
            guests: 2
        },
        {
            id: 2,
            guestName: 'John Smith',
            guestAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            checkIn: 'Dec 20',
            checkOut: 'Dec 25',
            status: 'upcoming',
            statusText: 'Arriving in 5 days',
            nights: 5,
            guests: 4
        },
        {
            id: 3,
            guestName: 'Sarah Johnson',
            guestAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            checkIn: 'Dec 28',
            checkOut: 'Jan 2',
            status: 'upcoming',
            statusText: 'Arriving in 2 weeks',
            nights: 5,
            guests: 3
        },
        {
            id: 4,
            guestName: 'Michael Chen',
            guestAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
            checkIn: 'Jan 5',
            checkOut: 'Jan 8',
            status: 'upcoming',
            statusText: 'Arriving in 3 weeks',
            nights: 3,
            guests: 2
        },
        {
            id: 5,
            guestName: 'Emma Wilson',
            guestAvatar: 'https://randomuser.me/api/portraits/women/89.jpg',
            checkIn: 'Jan 12',
            checkOut: 'Jan 19',
            status: 'upcoming',
            statusText: 'Arriving in 4 weeks',
            nights: 7,
            guests: 6
        },
        {
            id: 6,
            guestName: 'David Thompson',
            guestAvatar: 'https://randomuser.me/api/portraits/men/78.jpg',
            checkIn: 'Dec 10',
            checkOut: 'Dec 13',
            status: 'cancelled',
            statusText: 'Cancelled',
            nights: 3,
            guests: 2
        }
    ];

    return (
        <>
            <Header
                showBackButton

            />

            <ThemedScroller
                className="flex-1 pt-8"
                keyboardShouldPersistTaps="handled"
            >
                <Section title="Reservations" titleSize="3xl" className="mt-4" />
                <CardScroller className='mt-1 mb-4'>
                    <Chip size="lg" label="All" />
                    <Chip size="lg" label="Upcoming (5)" />
                    <Chip size="lg" label="Past" />
                    <Chip size="lg" label="Cancelled (1)" />
                </CardScroller>
                
                {reservations.map((reservation) => (
                    <ReservationCard 
                        key={reservation.id}
                        reservation={reservation}
                    />
                ))}
            </ThemedScroller>
            <ThemedFooter>
                <></>
            </ThemedFooter>
        </>
    );
};

interface ReservationCardProps {
    reservation: Reservation;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
    const getStatusColor = () => {
        switch (reservation.status) {
            case 'upcoming':
                return 'text-black dark:text-white';
            case 'cancelled':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getCardOpacity = () => {
        return reservation.status === 'cancelled' ? 'opacity-60' : 'opacity-100';
    };

    return (
        <View style={shadowPresets.large} className={`rounded-xl mt-4 border border-neutral-300 dark:border-neutral-700 bg-light-primary dark:bg-dark-primary ${getCardOpacity()}`}>
            <View className="p-4">
                <ThemedText className={`mb-16 text-base font-semibold ${getStatusColor()}`}>
                    {reservation.statusText}
                </ThemedText>
                <View className="flex-row items-center justify-between">
                    <View>
                        <ThemedText className='text-xl font-semibold'>{reservation.guestName}</ThemedText>
                        <ThemedText className='text-base font-regular'>
                            {reservation.checkIn} - {reservation.checkOut}
                        </ThemedText>
                        <ThemedText className='text-sm text-gray-500 mt-1'>
                            {reservation.nights} nights • {reservation.guests} guests
                        </ThemedText>
                    </View>
                    <Image source={{ uri: reservation.guestAvatar }} className="w-12 h-12 rounded-full" />
                </View>
            </View>
            {reservation.status !== 'cancelled' && (
                <View className='w-full flex-row border-t border-neutral-300 dark:border-neutral-700'>
                    <Pressable onPress={() => router.push('/screens/booking-detail')} className='w-1/2 py-5 items-center border-r border-neutral-300 dark:border-neutral-700'>
                        <ThemedText className="font-semibold">View booking</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => router.push('/screens/chat/user')} className='w-1/2 py-5 items-center'>
                        <ThemedText className='font-semibold'>Message</ThemedText>
                    </Pressable>
                </View>
            )}
        </View>
    )
}

export default ReservationsScreen;