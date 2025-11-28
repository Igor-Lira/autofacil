import { router } from 'expo-router';
import React from 'react';
import { View, ImageBackground, Text, TouchableOpacity, Pressable, Image } from 'react-native';

import { useBusinessMode } from '@/app/contexts/BusinesModeContext';
import AnimatedView from '@/components/AnimatedView';
import Avatar from '@/components/Avatar';
import BusinessSwitch from '@/components/BusinessSwitch';
import { Button } from '@/components/Button';
import Header, { HeaderIcon } from '@/components/Header';
import ListLink from '@/components/ListLink';
import ThemedScroller from '@/components/ThemeScroller';
import ThemeToggle from '@/components/ThemeToggle';
import ThemedText from '@/components/ThemedText';
import Divider from '@/components/layout/Divider';
import { shadowPresets } from '@/utils/useShadow';

export default function ProfileScreen() {
  const { isBusinessMode } = useBusinessMode();
  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <Header
        leftComponent={<ThemeToggle />}
        rightComponents={[<HeaderIcon icon="Bell" href="/screens/notifications" />]}
      />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">
        <ThemedScroller>{isBusinessMode ? <HostProfile /> : <PersonalProfile />}</ThemedScroller>
        <BusinessSwitch />
      </View>
    </View>
  );
}

const HostProfile = () => {
  return (
    <>
      <AnimatedView className="" animation="scaleIn">
        <View className="mb-8 mt-6 items-center rounded-3xl bg-slate-200 p-10 dark:bg-dark-secondary">
          <View className="relative h-20 w-20">
            <View className="relative z-20 h-full w-full overflow-hidden rounded-xl border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="h-full w-full"
                source={{
                  uri: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400',
                }}
              />
            </View>
            <View className="absolute left-8 top-0 h-full w-full rotate-12 overflow-hidden rounded-xl border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="h-full w-full"
                source={{
                  uri: 'https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200',
                }}
              />
            </View>
            <View className="absolute right-8 top-0 h-full w-full -rotate-12 overflow-hidden rounded-xl border-2 border-light-primary dark:border-dark-primary">
              <Image
                className="h-full w-full"
                source={{
                  uri: 'https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200',
                }}
              />
            </View>
          </View>
          <ThemedText className="mt-4 text-2xl font-semibold">New to hosting?</ThemedText>
          <ThemedText className="px-4 text-center text-sm font-light ">
            Discover how to start hosting and earn extra income
          </ThemedText>
          <Button title="Get started" className="mt-4" textClassName="text-white" />
        </View>
        <View className="px-4">
          <ListLink
            showChevron
            title="Reservations"
            icon="Briefcase"
            href="/screens/reservations"
          />
          <ListLink showChevron title="Earnings" icon="Banknote" href="/screens/earnings" />
          <ListLink showChevron title="Insights" icon="BarChart" href="/screens/insights" />
          <ListLink
            showChevron
            title="Create new listing"
            icon="PlusCircle"
            href="/screens/add-property-start"
          />
        </View>
      </AnimatedView>
    </>
  );
};

const PersonalProfile = () => {
  return (
    <AnimatedView className="pt-4" animation="scaleIn">
      <View
        style={{ ...shadowPresets.large }}
        className="mb-4  flex-row items-center justify-center rounded-3xl bg-light-primary p-10 dark:bg-dark-secondary">
        <View className="w-1/2 flex-col items-center">
          <Avatar src={require('@/assets/img/thomino.jpg')} size="xxl" />
          <View className="flex-1 items-center justify-center">
            <ThemedText className="text-2xl font-bold">Thomino</ThemedText>
            <View className="flex flex-row items-center">
              <ThemedText className="ml-2 text-sm text-light-subtext dark:text-dark-subtext">
                Bratislava, Slovakia
              </ThemedText>
            </View>
          </View>
        </View>
        <View className="w-1/2 flex-col items-start justify-center pl-12">
          <View className="w-full">
            <ThemedText className="text-xl font-bold">16</ThemedText>
            <ThemedText className="text-xs">Trips</ThemedText>
          </View>
          <View className="my-3 w-full border-y border-neutral-300 py-3 dark:border-dark-primary">
            <ThemedText className="text-xl font-bold">10</ThemedText>
            <ThemedText className="text-xs">Reviews</ThemedText>
          </View>
          <View className="w-full">
            <ThemedText className="text-xl font-bold">11</ThemedText>
            <ThemedText className="text-xs">Years</ThemedText>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/screens/add-property-start')}
        style={{ ...shadowPresets.large }}
        className="mb-4 flex flex-row items-center rounded-2xl bg-light-primary p-5 dark:bg-dark-secondary">
        <Image className="mr-4 h-10 w-10" source={require('@/assets/img/house.png')} />
        <View>
          <ThemedText className="flex-1 pr-2 text-base font-medium">Become a host</ThemedText>
          <ThemedText className="text-xs opacity-60">
            It's easy to start hosting and earn extra income
          </ThemedText>
        </View>
      </Pressable>

      <View className="gap-1 px-4">
        <ListLink showChevron title="Account settings" icon="Settings" href="/screens/settings" />
        <ListLink
          showChevron
          title="Edit profile"
          icon="UserRoundPen"
          href="/screens/edit-profile"
        />
        <ListLink showChevron title="Get help" icon="HelpCircle" href="/screens/help" />
        <Divider />
        <ListLink showChevron title="Logout" icon="LogOut" href="/(auth)/login" />
      </View>
    </AnimatedView>
  );
};
