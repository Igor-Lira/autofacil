import React, { useState } from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import AnimatedView from '@/components/AnimatedView';
import Icon from '@/components/Icon';
import { Button } from '@/components/Button';
import Divider from '@/components/layout/Divider';
import Section from '@/components/layout/Section';
import ShowRating from '@/components/ShowRating';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Property interface
interface Property {
  id: string;
  name: string;
  image: any;
  rating: number;
  reviews: number;
  location: string;
}

// Trip details interface
interface TripDetails {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
}

// Payment method interface
interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'online_banking';
  name: string;
  details: string;
  icon: string;
}

// Price breakdown interface
interface PriceBreakdown {
  basePrice: number;
  nights: number;
  serviceFee: number;
  cleaningFee: number;
  taxes: number;
  total: number;
}

// Sample property data
const propertyData: Property = {
  id: '1',
  name: 'Luxury Penthouse with Central Park View',
  image: require('@/assets/img/room-2.avif'),
  rating: 4.9,
  reviews: 284,
  location: 'Upper East Side, Manhattan',
};

// Sample trip details
const tripDetails: TripDetails = {
  checkIn: 'Jun 5, 2024',
  checkOut: 'Jun 12, 2024',
  guests: 4,
  nights: 7
};

// Sample payment methods
const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit_card',
    name: 'Visa ending in 1234',
    details: '•••• •••• •••• 1234',
    icon: 'CreditCard'
  },
  {
    id: '2',
    type: 'credit_card',
    name: 'Mastercard ending in 5678',
    details: '•••• •••• •••• 5678',
    icon: 'CreditCard'
  },
  {
    id: '3',
    type: 'online_banking',
    name: 'Online Banking',
    details: 'Pay with your bank account',
    icon: 'Building2'
  }
];

// Sample price breakdown
const priceBreakdown: PriceBreakdown = {
  basePrice: 850,
  nights: 7,
  serviceFee: 95,
  cleaningFee: 75,
  taxes: 142,
  total: 6107
};

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('1');

  return (

    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header 
        showBackButton 
        title="Confirm and pay"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <AnimatedView animation="fadeIn" duration={400} delay={100}>
          
          {/* Property Card */}
          <View className="px-global pt-4">
            <View className="border-neutral-300 border dark:border-dark-neutral-500 rounded-lg p-2">
              <View className="flex-row items-center">
                <Image
                  source={propertyData.image}
                  className="w-20 h-20 rounded-lg mr-4"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <ThemedText className="text-base font-semibold" numberOfLines={2}>
                    {propertyData.name}
                  </ThemedText>
                  <View className="flex-row items-center">
                    <ShowRating rating={propertyData.rating} size="sm" />
                    <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext ml-2">
                      ({propertyData.reviews} reviews)
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Divider className="my-6" />

          {/* Trip Details */}
          <Section title="Your trip" titleSize="lg" className="px-global">
            <View className="mt-4">
              {/* Dates */}
              <View className="flex-row items-center justify-between py-4">
                <View>
                  <ThemedText className="font-semibold">Dates</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-1">
                    {tripDetails.checkIn} - {tripDetails.checkOut}
                  </ThemedText>
                </View>
                <Button
                  title="Change"
                  variant='outline'
                  size="small"
                  rounded="lg"
                />
              </View>

              <Divider />

              {/* Guests */}
              <View className="flex-row items-center justify-between py-4">
                <View>
                  <ThemedText className="font-semibold">Guests</ThemedText>
                  <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-1">
                    {tripDetails.guests} guests
                  </ThemedText>
                </View>
                <Button
                  title="Change"
                  variant='outline'
                  size="small"
                  rounded="lg"
                />
              </View>
            </View>
          </Section>

          <Divider className="my-6" />

          {/* Cancellation Policy */}
          <Section title="Cancellation policy" titleSize="lg" className="px-global">
            <View className="mt-4 flex-row items-start">
              <Icon name="Shield" size={20} className="mr-3 mt-1 text-green-500" />
              <View className="flex-1">
                <ThemedText className="font-semibold text-green-600 dark:text-green-400">
                  Free cancellation before Jun 3
                </ThemedText>
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-1">
                  Cancel before Jun 3 for a full refund. After that, cancel before check-in and get a 50% refund.
                </ThemedText>
              </View>
            </View>
          </Section>

          <Divider className="my-6" />

          {/* Payment Method */}
          <Section title="Choose how to pay" titleSize="lg" className="px-global">
            <View className="mt-4 space-y-3">
              {paymentMethods.map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                  className={`flex-row items-center p-4 rounded-lg border ${
                    selectedPaymentMethod === method.id
                      ? 'border-highlight '
                      : 'border-light-secondary dark:border-dark-secondary'
                  }`}
                >
                  <Icon name={method.icon as any} size={24} className="mr-4" />
                  <View className="flex-1">
                    <ThemedText className="font-medium">{method.name}</ThemedText>
                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                      {method.details}
                    </ThemedText>
                  </View>
                  <View className={`w-5 h-5 rounded-full border-2 ${
                    selectedPaymentMethod === method.id
                      ? 'border-highlight bg-highlight'
                      : 'border-light-subtext dark:border-dark-subtext'
                  } items-center justify-center`}>
                    {selectedPaymentMethod === method.id && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Add payment method */}
            <Pressable className="flex-row items-center p-4 mt-3 border border-dashed border-light-subtext dark:border-dark-subtext rounded-lg">
              <Icon name="Plus" size={24} className="mr-4 text-light-subtext dark:text-dark-subtext" />
              <ThemedText className="text-light-subtext dark:text-dark-subtext">
                Add payment method
              </ThemedText>
            </Pressable>
          </Section>

          <Divider className="my-6" />

          {/* Price Details */}
          <Section title="Price details" titleSize="lg" className="px-global">
            <View className="mt-4 space-y-3">
              <View className="flex-row justify-between">
                <ThemedText>${priceBreakdown.basePrice} x {priceBreakdown.nights} nights</ThemedText>
                <ThemedText>${(priceBreakdown.basePrice * priceBreakdown.nights).toLocaleString()}</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Service fee</ThemedText>
                <ThemedText>${priceBreakdown.serviceFee}</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Cleaning fee</ThemedText>
                <ThemedText>${priceBreakdown.cleaningFee}</ThemedText>
              </View>
              
              <View className="flex-row justify-between">
                <ThemedText>Taxes</ThemedText>
                <ThemedText>${priceBreakdown.taxes}</ThemedText>
              </View>

              <Divider className="my-3" />

              <View className="flex-row justify-between">
                <ThemedText className="font-bold text-lg">Total (USD)</ThemedText>
                <ThemedText className="font-bold text-lg">${priceBreakdown.total.toLocaleString()}</ThemedText>
              </View>
            </View>
          </Section>

          {/* Terms and conditions */}
          <View className="px-global mt-6">
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext leading-5">
              By selecting the button below, I agree to the Host's House Rules, Ground rules for guests, 
              Airbnb's Rebooking and Refund Policy, and that Airbnb can charge my payment method if I'm responsible for damage.
            </ThemedText>
          </View>
        </AnimatedView>
      </ScrollView>

      {/* Bottom Confirm Button */}
      <View 
        className="absolute bottom-0 left-0 right-0 px-global py-4 bg-light-primary dark:bg-dark-primary border-t border-light-secondary dark:border-dark-secondary"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          title="Confirm and pay"
          className="w-full bg-highlight"
          textClassName="text-white font-semibold"
          size="large"
          rounded="lg"
          href="/screens/trip-detail"
        />
      </View>
    </View>
  );
} 