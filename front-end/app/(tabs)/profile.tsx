import { View, ImageBackground, Text, TouchableOpacity, Pressable, Image } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { useBusinessMode } from '@/app/contexts/BusinesModeContext';
import Avatar from '@/components/Avatar';
import ListLink from '@/components/ListLink';
import AnimatedView from '@/components/AnimatedView';
import ThemedScroller from '@/components/ThemeScroller';
import {Button} from '@/components/Button';
import BusinessSwitch from '@/components/BusinessSwitch';
import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { shadowPresets } from '@/utils/useShadow';
import Divider from '@/components/layout/Divider';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const { isBusinessMode } = useBusinessMode();
    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
            <Header
                leftComponent={<ThemeToggle />}
                rightComponents={[<HeaderIcon icon="Bell" href="/screens/notifications" />]} />
            <View className='flex-1 bg-light-primary dark:bg-dark-primary'>

                <ThemedScroller>



                    {isBusinessMode ? (
                        <HostProfile />
                    ) : (
                        <PersonalProfile />
                    )}

                </ThemedScroller>
                <BusinessSwitch />

            </View>
        </View>
    );
}

const HostProfile = () => {
    return (
        <>
            <AnimatedView className='' animation='scaleIn'>
                <View className="p-10 items-center rounded-3xl bg-slate-200 mt-6 mb-8 dark:bg-dark-secondary">
                    <View className='w-20 h-20 relative'>
                        <View className='w-full h-full rounded-xl relative z-20 overflow-hidden border-2 border-light-primary dark:border-dark-primary'>
                            <Image className='w-full h-full' source={{ uri: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400' }} />
                        </View>
                        <View className='w-full h-full absolute top-0 left-8 rotate-12 rounded-xl overflow-hidden border-2 border-light-primary dark:border-dark-primary'>
                            <Image className='w-full h-full' source={{ uri: 'https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200' }} />
                        </View>
                        <View className='w-full h-full absolute top-0 right-8 -rotate-12 rounded-xl overflow-hidden border-2 border-light-primary dark:border-dark-primary'>
                            <Image className='w-full h-full' source={{ uri: 'https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200' }} />
                        </View>
                    </View>
                    <ThemedText className='text-2xl font-semibold mt-4'>New to hosting?</ThemedText>
                    <ThemedText className="text-sm font-light text-center px-4 ">Discover how to start hosting and earn extra income</ThemedText>
                    <Button title="Get started" className='mt-4' textClassName='text-white' />
                </View>
                <View className='px-4'>
                    <ListLink showChevron title="Reservations" icon="Briefcase" href="/screens/reservations" />
                    <ListLink showChevron title="Earnings" icon="Banknote" href="/screens/earnings" />
                    <ListLink showChevron title="Insights" icon="BarChart" href="/screens/insights" />
                    <ListLink showChevron title="Create new listing" icon="PlusCircle" href="/screens/add-property-start" />
                </View>
            </AnimatedView>
        </>
    );
}

const PersonalProfile = () => {
    return (
        <AnimatedView className='pt-4' animation='scaleIn'>
            <View style={{ ...shadowPresets.large }} className="flex-row  items-center justify-center mb-4 bg-light-primary dark:bg-dark-secondary rounded-3xl p-10">
                <View className='flex-col items-center w-1/2'>
                    <Avatar src={require('@/assets/img/thomino.jpg')} size="xxl" />
                    <View className="flex-1 items-center justify-center">
                        <ThemedText className="text-2xl font-bold">Thomino</ThemedText>
                        <View className='flex flex-row items-center'>
                            <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext ml-2'>Bratislava, Slovakia</ThemedText>
                        </View>
                    </View>
                </View>
                <View className='flex-col items-start justify-center w-1/2 pl-12'>
                    <View className='w-full'>
                        <ThemedText className="text-xl font-bold">16</ThemedText>
                        <ThemedText className="text-xs">Trips</ThemedText>
                    </View>
                    <View className='w-full py-3 my-3 border-y border-neutral-300 dark:border-dark-primary'>
                        <ThemedText className="text-xl font-bold">10</ThemedText>
                        <ThemedText className="text-xs">Reviews</ThemedText>
                    </View>
                    <View className='w-full'>
                        <ThemedText className="text-xl font-bold">11</ThemedText>
                        <ThemedText className="text-xs">Years</ThemedText>
                    </View>
                </View>

            </View>

            <Pressable onPress={() => router.push('/screens/add-property-start')} style={{ ...shadowPresets.large }} className='p-5 mb-4 flex flex-row items-center rounded-2xl bg-light-primary dark:bg-dark-secondary'>
                <Image className='w-10 h-10 mr-4' source={require('@/assets/img/house.png')} />
                <View>
                    <ThemedText className='text-base font-medium flex-1 pr-2'>
                        Become a host
                    </ThemedText>
                    <ThemedText className="text-xs opacity-60">It's easy to start hosting and earn extra income</ThemedText>
                </View>

            </Pressable>

            <View className='gap-1 px-4'>
                <ListLink showChevron title="Account settings" icon="Settings" href="/screens/settings" />
                <ListLink showChevron title="Edit profile" icon="UserRoundPen" href="/screens/edit-profile" />
                <ListLink showChevron title="Get help" icon="HelpCircle" href="/screens/help" />
                <Divider />
                <ListLink showChevron title="Logout" icon="LogOut" href="/screens/welcome" />
            </View>
        </AnimatedView>

    );
}

