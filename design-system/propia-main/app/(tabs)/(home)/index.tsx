import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React, { useRef, useEffect, useContext } from 'react';
import { View, Text, Pressable, Image, Animated } from 'react-native';
import Section from '@/components/layout/Section';
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import AnimatedView from '@/components/AnimatedView';
import { ScrollContext } from './_layout';
import ThemedText from '@/components/ThemedText';
import useShadow, { shadowPresets } from '@/utils/useShadow';
import { router } from 'expo-router';

const HomeScreen = () => {
    const scrollY = useContext(ScrollContext);

    return (


        <ThemeScroller
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
        >
            <AnimatedView animation="scaleIn" className='flex-1 mt-4'>
                <Pressable onPress={() => router.push('/screens/map')} style={{ ...shadowPresets.large }} className='p-5 mb-8 flex flex-row items-center rounded-2xl bg-light-primary dark:bg-dark-secondary'>
                    <ThemedText className='text-base font-medium flex-1 pr-2'>
                        Continue searching for experiences in New York
                    </ThemedText>
                    <View className='w-20 h-20 relative'>
                        <View className='w-full h-full rounded-xl relative z-20 overflow-hidden border-2 border-light-primary dark:border-dark-primary'>
                            <Image className='w-full h-full' source={{ uri: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400' }} />
                        </View>
                        <View className='w-full h-full absolute top-0 left-1 rotate-12 rounded-xl overflow-hidden border-2 border-light-primary dark:border-dark-primary'>
                            <Image className='w-full h-full' source={{ uri: 'https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200' }} />
                        </View>
                    </View>
                </Pressable>
                {[
                    {
                        title: "Popular homes in New York",
                        properties: [
                            { title: "Apartment in Brooklyn", image: require('@/assets/img/room-1.avif'), price: "$85" },
                            { title: "Flat in Manhattan", image: require('@/assets/img/room-2.avif'), price: "$90" },
                            { title: "House in Long Island", image: require('@/assets/img/room-3.avif'), price: "$110" },
                            { title: "Flat in Manhattan", image: require('@/assets/img/room-4.avif'), price: "$95" }
                        ]
                    },
                    {
                        title: "Trending in Queens",
                        properties: [
                            { title: "Modern Loft in Astoria", image: require('@/assets/img/room-5.avif'), price: "$85" },
                            { title: "Studio in Long Island", image: require('@/assets/img/room-6.avif'), price: "$90" },
                            { title: "Condo in Forest Hills", image: require('@/assets/img/room-7.avif'), price: "$110" },
                            { title: "Apartment in Flushing", image: require('@/assets/img/room-1.avif'), price: "$95" }
                        ]
                    },
                    {
                        title: "Best rated in The Bronx",
                        properties: [
                            { title: "Cozy Home in Riverdale", image: require('@/assets/img/room-2.avif'), price: "$75" },
                            { title: "Apartment at Riverdale", image: require('@/assets/img/room-3.avif'), price: "$80" },
                            { title: "Loft in Mott Haven", image: require('@/assets/img/room-4.avif'), price: "$95" },
                            { title: "Condo in Fordham", image: require('@/assets/img/room-5.avif'), price: "$85" }
                        ]
                    },
                    {
                        title: "Top picks in Staten Island",
                        properties: [
                            { title: "House in St. George", image: require('@/assets/img/room-6.avif'), price: "$120" },
                            { title: "Apartment in George", image: require('@/assets/img/room-7.avif'), price: "$95" },
                            { title: "Bungalow in Great Kills", image: require('@/assets/img/room-1.avif'), price: "$110" },
                            { title: "Condo in Todt Hill", image: require('@/assets/img/room-2.avif'), price: "$135" }
                        ]
                    },
                    {
                        title: "New listings in Harlem",
                        properties: [
                            { title: "Brownstone in Hamilton", image: require('@/assets/img/room-3.avif'), price: "$125" },
                            { title: "Studio in East Harlem", image: require('@/assets/img/room-4.avif'), price: "$90" },
                            { title: "Apartment in Sugar Hill", image: require('@/assets/img/room-5.avif'), price: "$105" },
                            { title: "Loft in Manhattanville", image: require('@/assets/img/room-6.avif'), price: "$115" }
                        ]
                    },
                    {
                        title: "Featured in Williamsburg",
                        properties: [
                            { title: "Industrial Loft", image: require('@/assets/img/room-7.avif'), price: "$140" },
                            { title: "Rooftop Apartment", image: require('@/assets/img/room-1.avif'), price: "$125" },
                            { title: "Modern Studio", image: require('@/assets/img/room-2.avif'), price: "$110" },
                            { title: "Converted Warehouse", image: require('@/assets/img/room-3.avif'), price: "$130" }
                        ]
                    }
                ].map((section, index) => (
                    <Section
                        key={`ny-section-${index}`}
                        title={section.title}
                        titleSize="lg"
                        link="/screens/map"
                        linkText="View all"
                    >
                        <CardScroller space={15} className='mt-1.5 pb-4'>
                            {section.properties.map((property, propIndex) => (
                                <Card
                                    key={`property-${index}-${propIndex}`}
                                    title={property.title}
                                    rounded="2xl"
                                    hasFavorite
                                    rating={4.5}
                                    href="/screens/product-detail"
                                    price={property.price}
                                    width={160}
                                    imageHeight={160}
                                    image={property.image}
                                />
                            ))}
                        </CardScroller>
                    </Section>
                ))}

            </AnimatedView>
        </ThemeScroller>

    );
}


export default HomeScreen;