// app/(tabs)/(home)/_layout.tsx
import { View, Text, Pressable, Animated } from 'react-native'
import { Link, router, Stack } from 'expo-router'
import HomeTabs from '@/components/HomeTabs'
import ThemedText from '@/components/ThemedText'
import Icon from '@/components/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRef, createContext } from 'react'
import SearchBar from '@/components/SearchBar'

// Create a context to share the scrollY value
export const ScrollContext = createContext<Animated.Value>(new Animated.Value(0));

export default function HomeLayout() {
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    return (
        <ScrollContext.Provider value={scrollY}>
            <View className="flex-1 bg-light-primary dark:bg-dark-primary" style={{ paddingTop: insets.top }}>
                <SearchBar />
                <HomeTabs scrollY={scrollY} />
                <View className='flex-1'>
                    <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
                </View>
            </View>
        </ScrollContext.Provider>
    )
}