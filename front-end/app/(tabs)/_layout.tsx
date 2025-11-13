import { useThemeColors } from 'app/contexts/ThemeColors';
import { TabButton } from 'components/TabButton';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { KeyboardAvoidingView, Platform, SafeAreaView, View } from 'react-native';
import React from 'react';
import { useBusinessMode } from '@/app/contexts/BusinesModeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout() {
  const colors = useThemeColors();
  const { isBusinessMode } = useBusinessMode();
  const insets = useSafeAreaInsets();
  return (


    <Tabs

    >
      <TabSlot />
      <TabList
        style={{
          //height: 80,
          backgroundColor: colors.bg,
          borderTopColor: colors.secondary,
          borderTopWidth: 1,
          // paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {/****Host tabs */}
        <TabTrigger
          name="dashboard"
          href="/(tabs)/dashboard"
          asChild
          style={{ display: isBusinessMode ? 'flex' : 'none' }}
        >
          <TabButton labelAnimated={false} icon="Home">Home</TabButton>
        </TabTrigger>
        <TabTrigger
          name="calendar"
          href="/(tabs)/calendar"
          asChild
          style={{ display: isBusinessMode ? 'flex' : 'none' }}
        >
          <TabButton labelAnimated={false} icon="CalendarFold">Calendar</TabButton>
        </TabTrigger>
        <TabTrigger
          name="analytics"
          href="/(tabs)/listings"
          asChild
          style={{ display: isBusinessMode ? 'flex' : 'none' }}
        >
          <TabButton labelAnimated={false} icon="File">Listings</TabButton>
        </TabTrigger>


        {/* Consumer mode tabs */}
        <TabTrigger
          name="(home)"
          href="/(tabs)/(home)"
          asChild
          style={{ display: isBusinessMode ? 'none' : 'flex' }}
        >
          <TabButton labelAnimated={false} icon="Search">Home</TabButton>
        </TabTrigger>

        <TabTrigger
          name="favorites"
          href="/favorites"
          asChild
          style={{ display: isBusinessMode ? 'none' : 'flex' }}
        >
          <TabButton labelAnimated={false} icon="Heart">Favorites</TabButton>
        </TabTrigger>

        <TabTrigger
          name="trips"
          href="/trips"
          asChild
          style={{ display: isBusinessMode ? 'none' : 'flex' }}
        >
          <TabButton labelAnimated={false} icon="Plane">Trips</TabButton>
        </TabTrigger>

        <TabTrigger
          name="chat"
          href="/(tabs)/chat"
          asChild
          style={{ display: isBusinessMode ? 'flex' : 'flex' }}
        >
          <TabButton labelAnimated={false} hasBadge icon="MessageSquare">Messages</TabButton>
        </TabTrigger>



        <TabTrigger
          name="profile"
          href="/profile"
          asChild
          style={{ display: isBusinessMode ? 'flex' : 'flex' }}
        >
          <TabButton labelAnimated={false} icon="CircleUser">Profile</TabButton>
        </TabTrigger>


      </TabList>
    </Tabs>

  );
}
