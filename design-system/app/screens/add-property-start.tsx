import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Platform } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Divider from '@/components/layout/Divider';

export default function AddPropertyStart() {
    const insets = useSafeAreaInsets();



    return (
        <>
            <Header showBackButton />
            <View className=" flex-1 px-6  flex justify-start h-full bg-light-primary dark:bg-dark-primary">
                <View className='pb-6 mt-4'>
                    <ThemedText className='text-4xl font-semibold mb-8'>It's easy to get started on Propia</ThemedText>
                </View>

                <IntroStep number="1" title="Add your property" description="Share your property with the world." image={require('@/assets/img/bed.png')} />
                <Divider className='my-4' />
                <IntroStep number="2" title="Make it stand out" description="Add photos, a description, and amenities to make your property stand out." image={require('@/assets/img/sofa.png')} />
                <Divider className='my-4' />
                <IntroStep number="3" title="Finish up and publish" description="Choose price, availability, and publish your property." image={require('@/assets/img/door.png')} />
                
                <View className=' pb-2 mt-auto' style={{ paddingBottom: insets.bottom }}>
                    <Button size="large" className='bg-highlight' textClassName='text-white' rounded="full" title="Let's go" href='/screens/add-property' />
                </View>
            </View>
        </>
    );
} 

const IntroStep = (props: { number: string, title: string, description: string, image: any }) => {
    return (
        <View className='flex-row items-start py-4'>
            <ThemedText className='text-lg font-semibold mr-4'>{props.number}</ThemedText>
            <View className='flex-1 mr-6'>
                <ThemedText className='text-lg font-semibold'>{props.title}</ThemedText>
                <ThemedText className='text-sm text-light-subtext dark:text-dark-subtext'>{props.description}</ThemedText>
            </View>
            <Image source={props.image} className='w-16 h-16 ml-auto' />
        </View>
    )
}