import { View, Animated, Image, TouchableOpacity } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import ThemedText from './ThemedText';
import { Link, router, usePathname } from 'expo-router';

const HomeTabs = (props: any) => {
    // Get current path to determine active tab
    const currentPath = usePathname();
    
    return (
        <View 
        style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 4 } }}
        className='w-full flex-row justify-center  bg-light-primary dark:bg-dark-primary border-b border-gray-200 dark:border-dark-secondary'>
            <TabItem 
                href="/" 
                active={currentPath === '/'} 
                label="Home" 
                icon={require('@/assets/img/house.png')} 
                scrollY={props.scrollY} 
            />
            <TabItem 
                href="/experience" 
                active={currentPath === '/experience'} 
                label="Experiences" 
                icon={require('@/assets/img/experience.png')} 
                scrollY={props.scrollY} 
            />
            <TabItem 
                href="/services" 
                active={currentPath === '/services'} 
                label="Services" 
                icon={require('@/assets/img/services.png')} 
                scrollY={props.scrollY} 
            />
        </View>
    )
}

const TabItem = (props: any) => {
    // Track if we're in expanded or collapsed state
    const [isExpanded, setIsExpanded] = useState(true);
    
    // Animated value for size only
    const animatedSize = useRef(new Animated.Value(45)).current;
    
    // Listen for scroll position changes
    useEffect(() => {
        const listenerId = props.scrollY.addListener(({ value }: { value: number }) => {
            // Only trigger animation when crossing the threshold
            if (value > 20 && isExpanded) {
                setIsExpanded(false);
                
                // Size animation only
                Animated.timing(animatedSize, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false
                }).start();
            } 
            else if (value <= 10 && !isExpanded) {
                setIsExpanded(true);
                
                // Size animation only
                Animated.timing(animatedSize, {
                    toValue: 45,
                    duration: 200,
                    useNativeDriver: false
                }).start();
            }
        });
        
        // Clean up listener
        return () => props.scrollY.removeListener(listenerId);
    }, [props.scrollY, animatedSize, isExpanded]);

    return (
            <TouchableOpacity onPress={() => router.push(props.href)} activeOpacity={0.5} className={`items-center pb-2 mx-8 border-b-2 ${props.active ? 'border-black dark:border-white' : 'border-transparent'}`}>
                <Animated.View
                    style={{
                        width: animatedSize,
                        height: animatedSize,
                        overflow: 'hidden',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Image 
                        source={props.icon} 
                        className='w-full h-full'
                        resizeMode="contain"
                    />
                </Animated.View>
                <ThemedText className={`text-xs mt-2 ${props.active ? 'font-bold' : 'font-normal text-gray-500 dark:text-gray-400'}`}>{props.label}</ThemedText>
            </TouchableOpacity>
    )
}

export default HomeTabs;