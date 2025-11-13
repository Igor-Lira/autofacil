import { View, Text, FlatList, Dimensions, Image, Pressable, SafeAreaView } from 'react-native';
import { useState, useRef } from 'react';
import ThemedText from '@/components/ThemedText';
import { StatusBar } from 'expo-status-bar';
import ThemeToggle from '@/components/ThemeToggle';
import { AntDesign } from '@expo/vector-icons';
import useThemeColors from '../contexts/ThemeColors';
import { router } from 'expo-router';
import React from 'react';
import Icon from '@/components/Icon';
const { width } = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function OnboardingScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    return (
        <SafeAreaView style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className='flex-1 bg-light-primary dark:bg-dark-primary'>

            <View className="flex-1 relative bg-light-primary dark:bg-dark-primary">
                <View className='w-full flex-row justify-end px-4 pt-2'>
                    <ThemeToggle />
                </View>


                <View className='flex flex-col items-start w-full justify-center gap-2 flex-1 px-global pb-20'>
                    <View className='mb-8'>
                        <ThemedText className='text-4xl font-bold'>Welcome back</ThemedText>
                        <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>Sign in to your account to continue</ThemedText>
                    </View>
                    <Pressable onPress={() => router.push('/screens/signup')} className='w-full  border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4'>
                        <View className='absolute left-4 top-4.5'>
                            <Icon name="Mail" size={20} color={colors.text} />
                        </View>
                        <ThemedText className='text-base font-medium pr-2'>Continue with Email</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => router.push('/(tabs)/(home)')} className='w-full border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4'>
                        <View className='absolute left-4 top-4.5'>
                            <Icon name="Facebook" size={22} color={colors.text} />
                        </View>
                        <ThemedText className='text-base font-medium pr-2'>Continue with Facebook</ThemedText>

                    </Pressable>
                    <Pressable onPress={() => router.push('/(tabs)/(home)')} className='w-full border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4'>
                        <View className='absolute left-4 top-4.5'>
                            <AntDesign name="google" size={22} color={colors.text} />
                        </View>
                        <ThemedText className='text-base font-medium pr-2'>Continue with Google</ThemedText>

                    </Pressable>


                    <Pressable onPress={() => router.push('/(tabs)/(home)')} className='w-full border border-black dark:border-white rounded-2xl flex flex-row items-center justify-center py-4'>
                        <View className='absolute left-4 top-4.5'>
                            <AntDesign name="apple" size={22} color={colors.text} />
                        </View>
                        <ThemedText className='text-base font-medium pr-2'>Continue with Apple</ThemedText>

                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
