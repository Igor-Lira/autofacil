import { Dimensions, View } from 'react-native';
import { Button } from '@/components/Button';
import ThemedText from '@/components/ThemedText';
import { Stack } from 'expo-router';
import Header from '@/components/Header';
import React from 'react';
import Icon from '@/components/Icon';
const windowWidth = Dimensions.get('window').width;
export default function NotFoundScreen() {

    return (
        <>
            <Stack.Screen />
            <Header title=" " showBackButton />
            <View className="flex-1 items-center justify-center bg-light-primary dark:bg-dark-primary p-global">
                <View className=" mb-8">
                    <Icon name="AlertCircle" strokeWidth={1} size={70} />
                </View>
                <ThemedText className="text-2xl font-bold mb-2">Page Not Found</ThemedText>
                <ThemedText className="text-base w-2/3 text-center mb-8 text-light-subtext dark:text-dark-subtext">
                    The page you're looking for doesn't exist or has been moved.
                </ThemedText>
                <View className='flex-row items-center justify-center'>
                    <Button
                        title="Back to Home"
                        href="/"
                        size="medium"
                        className="px-6"
                    /> 
                </View>
            </View>
        </>
    );
}