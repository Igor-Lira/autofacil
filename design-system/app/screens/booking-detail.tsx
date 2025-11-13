import React from 'react';
import { View, ScrollView } from 'react-native';
import Header from '@/components/Header';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedFooter from '@/components/ThemeFooter';
import Section from '@/components/layout/Section';
import ImageCarousel from '@/components/ImageCarousel';
import ThemedText from '@/components/ThemedText';
import Avatar from '@/components/Avatar';
import ShowRating from '@/components/ShowRating';
import ListLink from '@/components/ListLink';
import Divider from '@/components/layout/Divider';
import Icon from '@/components/Icon';
import { Button } from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedView from '@/components/AnimatedView';

// Sample booking request data from host's perspective
const bookingData = {
    id: '1',
    propertyName: 'Luxury Beachfront Villa',
    location: 'Barcelona, Spain',
    guest: {
        name: 'John Smith',
        avatar: require('@/assets/img/user-3.jpg'),
        rating: 4.7,
        reviewCount: 23,
        joinedDate: 'Joined in 2022',
        verifications: ['Email', 'Phone', 'Government ID']
    },
    checkIn: 'Dec 20, 2025',
    checkOut: 'Dec 25, 2025',
    nights: 5,
    guests: 4,
    adults: 3,
    children: 1,
    infants: 0,
    pets: 0,
    requestDate: 'Dec 10, 2024',
    totalPrice: '$1,750',
    priceBreakdown: {
        nightlyRate: '$300',
        nights: 5,
        subtotal: '$1,500',
        cleaningFee: '$75',
        serviceFee: '$125',
        taxes: '$50',
        total: '$1,750'
    },
    paymentMethod: {
        type: 'Visa',
        lastFour: '1234'
    },
    guestMessage: 'Hi! We\'re a family of 4 looking forward to staying at your beautiful villa. We\'re celebrating our anniversary and would love to experience the local culture. We\'re respectful guests and will take great care of your property.',
    specialRequests: [
        'Early check-in if possible (around 1 PM)',
        'Recommendations for family-friendly restaurants',
        'Information about nearby beaches'
    ],
    status: 'pending' // pending, approved, rejected
};

const BookingDetailScreen = () => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const handleApprove = () => {
        console.log('Booking approved');
        // Handle approval logic
    };

    const handleReject = () => {
        console.log('Booking rejected');
        // Handle rejection logic
    };

    return (
        <>
            <Header
                title="Booking Request"
                showBackButton
            />
            <ThemedScroller
                className="flex-1 px-0"
                keyboardShouldPersistTaps="handled"
            >
                <AnimatedView animation="fadeIn" duration={400} delay={100}>
                    {/* Property Images */}
                    <View className='px-global'>
                        <ImageCarousel
                            height={300}
                            rounded='2xl'
                            images={['https://tinyurl.com/2blrf2sk', 'https://tinyurl.com/2yyfr9rc', 'https://tinyurl.com/2cmu4ns5']}
                        />
                    </View>

                    {/* Property Name and Location */}
                    <View className="px-global pt-6 pb-4">
                        <ThemedText className="text-2xl font-bold mb-2">{bookingData.propertyName}</ThemedText>
                        <View className="flex-row items-center">
                            <Icon name="MapPin" size={16} className="mr-2 text-light-subtext dark:text-dark-subtext" />
                            <ThemedText className="text-light-subtext dark:text-dark-subtext">{bookingData.location}</ThemedText>
                        </View>
                    </View>

                    <Divider className="h-2 bg-light-secondary dark:bg-dark-darker" />

                    {/* Guest Information */}
                    <Section title="Guest Information" titleSize="lg" className="px-global pt-4">
                        <View className="flex-row items-center justify-between mt-4 mb-4">
                            <View className="flex-row items-center flex-1">
                                <Avatar src={bookingData.guest.avatar} size="lg" />
                                <View className="ml-3 flex-1">
                                    <ThemedText className="text-lg font-semibold">{bookingData.guest.name}</ThemedText>
                                    <View className="flex-row items-center mt-px">
                                        <ShowRating rating={bookingData.guest.rating} size="sm" />
                                        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext ml-2">
                                            ({bookingData.guest.reviewCount} reviews)
                                        </ThemedText>
                                    </View>
                                  
                                </View>
                            </View>
                        </View>

                      

                        <ListLink
                            icon="MessageCircle"
                            title="Message guest"
                            description="Communicate with your guest"
                            href="/screens/chat/user"
                            showChevron
                            className="px-4 py-3 bg-light-secondary dark:bg-dark-secondary rounded-xl"
                        />
                    </Section>

                    <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

                    {/* Booking Details */}
                    <Section title="Booking details" titleSize="lg" className="px-global pt-4">
                        <View className="mt-4 space-y-4">
                            <View className="flex-row items-center justify-between bg-light-secondary dark:bg-dark-secondary rounded-xl p-4">
                                <View>
                                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">Check-in</ThemedText>
                                    <ThemedText className="text-lg font-semibold">{bookingData.checkIn}</ThemedText>
                                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">After 3:00 PM</ThemedText>
                                </View>
                                <View className="items-end">
                                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">Check-out</ThemedText>
                                    <ThemedText className="text-lg font-semibold">{bookingData.checkOut}</ThemedText>
                                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">Before 11:00 AM</ThemedText>
                                </View>
                            </View>

                            <View className="grid grid-cols-2 gap-4">
                                <View>
                                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">Duration</ThemedText>
                                    <ThemedText className="text-lg font-semibold">{bookingData.nights} nights</ThemedText>
                                </View>
                                <View>
                                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">Total guests</ThemedText>
                                    <ThemedText className="text-lg font-semibold">{bookingData.guests} guests</ThemedText>
                                </View>
                            </View>

                            <View className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-4">
                                <ThemedText className="font-medium mb-3">Guest breakdown</ThemedText>
                                <View className="space-y-2">
                                    <View className="flex-row justify-between">
                                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Adults</ThemedText>
                                        <ThemedText>{bookingData.adults}</ThemedText>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Children</ThemedText>
                                        <ThemedText>{bookingData.children}</ThemedText>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Infants</ThemedText>
                                        <ThemedText>{bookingData.infants}</ThemedText>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <ThemedText className="text-light-subtext dark:text-dark-subtext">Pets</ThemedText>
                                        <ThemedText>{bookingData.pets}</ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Section>

                    <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

                    {/* Guest Message */}
                    <Section title="Message from guest" titleSize="lg" className="px-global pt-4">
                        <View className="mt-4 bg-light-secondary dark:bg-dark-secondary rounded-xl p-4">
                            <ThemedText className="text-sm leading-6">
                                {bookingData.guestMessage}
                            </ThemedText>
                        </View>

                        {bookingData.specialRequests.length > 0 && (
                            <View className="mt-4">
                                <ThemedText className="font-medium mb-3">Special requests</ThemedText>
                                {bookingData.specialRequests.map((request, index) => (
                                    <View key={index} className="flex-row items-start mb-2">
                                        <Icon name="Circle" size={6} className="mr-3 mt-2 text-light-subtext dark:text-dark-subtext" />
                                        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext flex-1">
                                            {request}
                                        </ThemedText>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Section>

                    <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

                    {/* Price Breakdown */}
                    <Section title="Earnings breakdown" titleSize="lg" className="px-global pt-4">
                        <View className="mt-4 space-y-3">
                            <View className="flex-row justify-between">
                                <ThemedText className="text-light-subtext dark:text-dark-subtext">
                                    {bookingData.priceBreakdown.nightlyRate} x {bookingData.priceBreakdown.nights} nights
                                </ThemedText>
                                <ThemedText>{bookingData.priceBreakdown.subtotal}</ThemedText>
                            </View>

                            <View className="flex-row justify-between">
                                <ThemedText className="text-light-subtext dark:text-dark-subtext">Cleaning fee</ThemedText>
                                <ThemedText>{bookingData.priceBreakdown.cleaningFee}</ThemedText>
                            </View>

                            <View className="flex-row justify-between">
                                <ThemedText className="text-light-subtext dark:text-dark-subtext">Service fee (deducted)</ThemedText>
                                <ThemedText className="text-red-600 dark:text-red-400">-{bookingData.priceBreakdown.serviceFee}</ThemedText>
                            </View>

                            <View className="flex-row justify-between">
                                <ThemedText className="text-light-subtext dark:text-dark-subtext">Taxes</ThemedText>
                                <ThemedText>{bookingData.priceBreakdown.taxes}</ThemedText>
                            </View>

                            <Divider className="my-3" />

                            <View className="flex-row justify-between">
                                <ThemedText className="font-bold text-lg">Your earnings</ThemedText>
                                <ThemedText className="font-bold text-lg text-green-600 dark:text-green-400">
                                    ${(parseInt(bookingData.priceBreakdown.total.replace('$', '').replace(',', '')) - 
                                       parseInt(bookingData.priceBreakdown.serviceFee.replace('$', ''))).toLocaleString()}
                                </ThemedText>
                            </View>
                        </View>
                    </Section>

                    <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

                    {/* Payment Information */}
                    <Section title="Payment method" titleSize="lg" className="px-global pt-4">
                        <View className="flex-row items-center mt-4">
                            <Icon name="CreditCard" size={20} className="mr-3" />
                            <View>
                                <ThemedText className="font-medium">
                                    {bookingData.paymentMethod.type} •••• {bookingData.paymentMethod.lastFour}
                                </ThemedText>
                                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                                    Payment will be processed upon approval
                                </ThemedText>
                            </View>
                        </View>
                    </Section>

                    <Divider className="mt-6 h-2 bg-light-secondary dark:bg-dark-darker" />

                    {/* Request Details */}
                    <Section title="Request details" titleSize="lg" className="px-global pt-4 pb-6">
                        <View className="mt-4 space-y-3">
                            <View className="flex-row justify-between">
                                <ThemedText className="text-light-subtext dark:text-dark-subtext">Request date</ThemedText>
                                <ThemedText className="font-medium">{bookingData.requestDate}</ThemedText>
                            </View>

                            <View className="flex-row justify-between">
                                <ThemedText className="text-light-subtext dark:text-dark-subtext">Status</ThemedText>
                                <View className="bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                                    <ThemedText className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                        Pending Review
                                    </ThemedText>
                                </View>
                            </View>

                            <View className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                <View className="flex-row items-start">
                                    <Icon name="Info" size={16} className="mr-3 mt-1 text-blue-600 dark:text-blue-400" />
                                    <View className="flex-1">
                                        <ThemedText className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Response required
                                        </ThemedText>
                                        <ThemedText className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                            Please respond within 24 hours to maintain your response rate
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Section>
                </AnimatedView>
            </ThemedScroller>

            <ThemedFooter>
                <View className="flex-row space-x-3">
                    <Button
                        title="Reject"
                        variant="outline"
                        iconStart="X"
                        className="flex-1"
                        onPress={handleReject}
                    />
                    <Button
                        title="Approve"
                        variant="primary"
                        textClassName='text-white'
                        iconStart="Check"
                        className="flex-1"
                        iconColor='white'
                        onPress={handleApprove}
                    />
                </View>
            </ThemedFooter>
        </>
    );
};

export default BookingDetailScreen;