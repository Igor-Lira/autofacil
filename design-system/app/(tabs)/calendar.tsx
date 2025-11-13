import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import ThemedText from '@/components/ThemedText';
import ThemedScroller from '@/components/ThemeScroller';
import Section from '@/components/layout/Section';
import { Chip } from '@/components/Chip';
import { CardScroller } from '@/components/CardScroller';
import AnimatedView from '@/components/AnimatedView';
import Header from '@/components/Header';
import useThemeColors from '@/app/contexts/ThemeColors';

type OrderStatus = 'all' | 'pending' | 'completed' | 'canceled';

interface Booking {
  id: number;
  guestName: string;
  guestAvatar: string;
  startDate: string;
  endDate: string;
  price: string;
  guestCount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const CalendarScreen = () => {
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
    const { width } = useWindowDimensions();
    const colors = useThemeColors();

    // Mock booking data
    const bookings: Booking[] = [
        {
            id: 1,
            guestName: 'Jonathon Phillip',
            guestAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            startDate: '2025-05-05',
            endDate: '2025-05-07',
            price: '₱19,390',
            guestCount: 2,
            status: 'confirmed'
        },
        {
            id: 2,
            guestName: 'Divina',
            guestAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            startDate: '2025-05-13',
            endDate: '2025-05-17',
            price: '₱19,060',
            guestCount: 6,
            status: 'confirmed'
        },
        {
            id: 3,
            guestName: 'Venus',
            guestAvatar: 'https://randomuser.me/api/portraits/women/55.jpg',
            startDate: '2025-06-18',
            endDate: '2025-06-20',
            price: '₱20,030',
            guestCount: 9,
            status: 'confirmed'
        },
        {
            id: 4,
            guestName: 'Bernard',
            guestAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
            startDate: '2025-06-02',
            endDate: '2025-06-07',
            price: '₱19,000',
            guestCount: 3,
            status: 'confirmed'
        },
        {
            id: 5,
            guestName: 'Audrey',
            guestAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            startDate: '2025-07-20',
            endDate: '2025-07-22',
            price: '₱19,070',
            guestCount: 4,
            status: 'confirmed'
        },
        {
            id: 6,
            guestName: 'Michele',
            guestAvatar: 'https://randomuser.me/api/portraits/women/72.jpg',
            startDate: '2025-07-24',
            endDate: '2025-07-25',
            price: '₱19,560',
            guestCount: 5,
            status: 'confirmed'
        },
        {
            id: 7,
            guestName: 'Jenina',
            guestAvatar: 'https://randomuser.me/api/portraits/women/89.jpg',
            startDate: '2025-07-08',
            endDate: '2025-07-12',
            price: '₱19,500',
            guestCount: 9,
            status: 'confirmed'
        },
        // March bookings
        {
            id: 8,
            guestName: 'Nina',
            guestAvatar: 'https://randomuser.me/api/portraits/women/23.jpg',
            startDate: '2025-08-03',
            endDate: '2025-08-08',
            price: '₱19,000',
            guestCount: 8,
            status: 'confirmed'
        },
        {
            id: 9,
            guestName: 'Isabelle',
            guestAvatar: 'https://randomuser.me/api/portraits/women/34.jpg',
            startDate: '2025-08-19',
            endDate: '2025-08-23',
            price: '₱19,000',
            guestCount: 7,
            status: 'confirmed'
        },
        {
            id: 10,
            guestName: 'Reina',
            guestAvatar: 'https://randomuser.me/api/portraits/women/45.jpg',
            startDate: '2025-09-12',
            endDate: '2025-09-15',
            price: '₱19,320',
            guestCount: 6,
            status: 'confirmed'
        },
        {
            id: 11,
            guestName: 'Dmitrii',
            guestAvatar: 'https://randomuser.me/api/portraits/men/56.jpg',
            startDate: '2025-09-16',
            endDate: '2025-09-19',
            price: '₱19,350',
            guestCount: 6,
            status: 'confirmed'
        },
       
    ];

    // Create marked dates for calendar
    const getMarkedDates = () => {
        const marked: any = {};
        
        bookings.forEach((booking, index) => {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            const color = booking.status === 'confirmed' ? '#FF2056' : '#6B7280';
            
            // Create date range for this booking
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateString = d.toISOString().split('T')[0];
                
                if (!marked[dateString]) {
                    marked[dateString] = {};
                }
                
                // Add this booking to the date
                marked[dateString] = {
                    ...marked[dateString],
                    periods: [
                        ...(marked[dateString].periods || []),
                        {
                            startingDay: dateString === booking.startDate,
                            endingDay: dateString === booking.endDate,
                            color: color,
                            booking: booking
                        }
                    ]
                };
            }
        });
        
        return marked;
    };

    // Get bookings for a specific date
    const getBookingsForDate = (date: string) => {
        return bookings.filter(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            const currentDate = new Date(date);
            return currentDate >= bookingStart && currentDate <= bookingEnd;
        });
    };

    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <AnimatedView animation="scaleIn" className='flex-1'>
                <Header title="Calendar" />
                <ThemedScroller className="px-0">
                    <Section className="mb-4">
                        <View className=" rounded-xl overflow-hidden h-[420px]">
                            <CalendarList
                                horizontal={true}
                                pagingEnabled={true}
                                scrollEnabled={true}
                                showScrollIndicator={false}
                                calendarWidth={width}
                                calendarHeight={420}
                                style={{
                                    width: width,
                                    backgroundColor: 'transparent'
                                }}
                                theme={{
                                    backgroundColor: 'transparent',
                                    calendarBackground: 'transparent',
                                    textSectionTitleColor: colors.text,
                                    selectedDayBackgroundColor: colors.highlight,
                                    selectedDayTextColor: 'white',
                                    todayTextColor: colors.highlight,
                                    dayTextColor: colors.text,
                                    textDisabledColor: colors.placeholder,
                                    dotColor: colors.highlight,
                                    selectedDotColor: 'white',
                                    arrowColor: colors.text,
                                    monthTextColor: colors.text,
                                    indicatorColor: colors.highlight,
                                    textDayFontFamily: 'System',
                                    textMonthFontFamily: 'System',
                                    textDayHeaderFontFamily: 'System',
                                    textDayFontSize: 14,
                                    textMonthFontSize: 18,
                                    textDayHeaderFontSize: 12,
                                    textSectionTitleDisabledColor: colors.placeholder
                                }}
                                markingType="multi-period"
                                markedDates={getMarkedDates()}
                                firstDay={0}
                                hideExtraDays={false}
                                dayComponent={({ date, state, marking }) => {
                                    const dateString = date?.dateString || '';
                                    const isToday = dateString === new Date().toISOString().split('T')[0];
                                    const bookingsForDate = getBookingsForDate(dateString);
                                    
                                    return (
                                        <View className="w-full h-14 relative">
                                            {/* Render booking periods */}
                                            {marking?.periods?.map((period: any, index: number) => {
                                                const booking = period.booking;
                                                const isStartDate = period.startingDay;
                                                const isEndDate = period.endingDay;
                                                
                                                return (
                                                    <View
                                                        key={`${booking.id}-${index}`}
                                                        className={`absolute left-0 overflow-visible right-0 h-10 flex-row items-center px-1 ${
                                                            isStartDate ? 'rounded-l-full' : ''
                                                        } ${isEndDate ? 'rounded-r-full' : ''}`}
                                                        style={{
                                                            backgroundColor: period.color,
                                                            top: 20 + (index * 10), // Stack multiple bookings with more space
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        {isStartDate && (
                                                            <>
                                                                <Image
                                                                    source={{ uri: booking.guestAvatar }}
                                                                    className="w-8 h-8 rounded-full mr-px"
                                                                />
                                                                <ThemedText 
                                                                    className="text-white overflow-visible text-xs font-medium w-32" 
                                                                    numberOfLines={1}
                                                                >
                                                                    {booking.guestCount > 1 && ` +${booking.guestCount - 1}`}
                                                                </ThemedText>
                                                            </>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                            
                                            {/* Date number */}
                                            <View className="absolute top-0 left-0 right-0 h-5 items-center justify-center">
                                                <ThemedText 
                                                    className={`text-sm ${
                                                        isToday 
                                                            ? 'text-red-500 font-bold'
                                                            : state === 'disabled' 
                                                                ? 'text-gray-400' 
                                                                : 'text-gray-700 dark:text-gray-300'
                                                    }`}
                                                    style={{ zIndex: 20 }}
                                                >
                                                    {date?.day}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    </Section>

                    <Section title="Upcoming Bookings" titleSize="lg" className="mt-0 px-4">
                        <CardScroller className="mt-2">
                            <Chip label="This week (3)" size="lg" />
                            <Chip label="Next week (2)" size="lg" />
                            <Chip label="This month (12)" size="lg" />
                        </CardScroller>
                        
                        <View className="mt-4 space-y-3">
                            {bookings.slice(0, 3).map(booking => (
                                <View key={booking.id} className="bg-white dark:bg-dark-secondary rounded-xl p-4 flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <Image
                                            source={{ uri: booking.guestAvatar }}
                                            className="w-12 h-12 rounded-full mr-3"
                                        />
                                        <View className="flex-1">
                                            <ThemedText className="font-semibold text-base">
                                                {booking.guestName}
                                            </ThemedText>
                                            <ThemedText className="text-sm text-gray-500">
                                                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                            </ThemedText>
                                            <ThemedText className="text-sm text-gray-500">
                                                {booking.guestCount} guests
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <ThemedText className="font-bold text-lg">
                                            {booking.price}
                                        </ThemedText>
                                        
                                    </View>
                                </View>
                            ))}
                        </View>
                    </Section>
                </ThemedScroller>
            </AnimatedView>
        </View>
    );
};

export default CalendarScreen;