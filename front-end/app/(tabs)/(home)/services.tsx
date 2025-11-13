import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React, { useRef, useEffect, useContext } from 'react';
import { View, Text, Pressable, Image, Animated } from 'react-native';
import Section from '@/components/layout/Section';
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import AnimatedView from '@/components/AnimatedView';
import { ScrollContext } from './_layout';

const ServicesScreen = () => {
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

                <Section
                    title="Services in New York"
                    titleSize="lg"
                >
                    <CardScroller space={15} className='mt-1.5 pb-4'>
                        <Card
                            title="Photography"
                            rounded="2xl"
                            description='10 Available'
                            width={100}
                            imageHeight={100}
                            image="https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1200"
                        />
                        <Card
                            title="Chefs"
                            rounded="2xl"
                            description='1 Available'
                            width={100}
                            imageHeight={100}
                            image="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1200"
                        />
                        <Card
                            title="Massage"
                            rounded="2xl"
                            description='Coming soon'
                            width={100}
                            imageHeight={100}
                            image="https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=1200"
                        />
                        <Card
                            title="Training"
                            rounded="2xl"
                            description='Coming soon'
                            width={100}
                            imageHeight={100}
                            image="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200"
                        />
                    </CardScroller>
                </Section>
               

                {[
                    {
                        title: "Top Photographers",
                        services: [
                            { 
                                title: "Sarah's Portrait Studio", 
                                image: "https://images.pexels.com/photos/2773498/pexels-photo-2773498.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$150/hr",
                                badge: "Featured"
                            },
                            { 
                                title: "NYC Wedding Photos", 
                                image: "https://images.pexels.com/photos/3321793/pexels-photo-3321793.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$200/hr"
                            },
                            { 
                                title: "Urban Photography", 
                                image: "https://images.pexels.com/photos/2901581/pexels-photo-2901581.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$125/hr"
                            },
                            { 
                                title: "Event Photography", 
                                image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$175/hr",
                                badge: "Popular"
                            }
                        ]
                    },
                    {
                        title: "Private Chefs",
                        services: [
                            { 
                                title: "Chef Maria's Italian", 
                                image: "https://images.pexels.com/photos/3338497/pexels-photo-3338497.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$250/event",
                                badge: "Top Rated"
                            },
                            { 
                                title: "Asian Fusion Chef", 
                                image: "https://images.pexels.com/photos/3298637/pexels-photo-3298637.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$200/event"
                            },
                            { 
                                title: "Vegan Specialist", 
                                image: "https://images.pexels.com/photos/3338537/pexels-photo-3338537.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$180/event",
                                badge: "New"
                            },
                            { 
                                title: "BBQ Master", 
                                image: "https://images.pexels.com/photos/3338523/pexels-photo-3338523.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$220/event"
                            }
                        ]
                    },
                    {
                        title: "Professional Massage",
                        services: [
                            { 
                                title: "Wellness Massage", 
                                image: "https://images.pexels.com/photos/3865776/pexels-photo-3865776.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$90/hr",
                                badge: "Best Value"
                            },
                            { 
                                title: "Sports Massage", 
                                image: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$110/hr"
                            },
                            { 
                                title: "Deep Tissue", 
                                image: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$100/hr",
                                badge: "Popular"
                            },
                            { 
                                title: "Couples Massage", 
                                image: "https://images.pexels.com/photos/3757957/pexels-photo-3757957.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$160/hr"
                            }
                        ]
                    },
                    {
                        title: "Top Restaurants",
                        services: [
                            { 
                                title: "La Bella Italia", 
                                image: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$$$$",
                                badge: "Michelin Star"
                            },
                            { 
                                title: "Sushi Master", 
                                image: "https://images.pexels.com/photos/359993/pexels-photo-359993.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$$$"
                            },
                            { 
                                title: "Urban Bistro", 
                                image: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$$",
                                badge: "New"
                            },
                            { 
                                title: "The Steakhouse", 
                                image: "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$$$$"
                            }
                        ]
                    },
                    {
                        title: "Makeup Artists",
                        services: [
                            { 
                                title: "Bridal Makeup", 
                                image: "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$200/session",
                                badge: "Top Choice"
                            },
                            { 
                                title: "Editorial Style", 
                                image: "https://images.pexels.com/photos/2442906/pexels-photo-2442906.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$150/session"
                            },
                            { 
                                title: "Natural Glam", 
                                image: "https://images.pexels.com/photos/2683821/pexels-photo-2683821.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$120/session",
                                badge: "Trending"
                            },
                            { 
                                title: "Special Effects", 
                                image: "https://images.pexels.com/photos/2695679/pexels-photo-2695679.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                price: "$180/session"
                            }
                        ]
                    }
                ].map((section, index) => (
                    <Section
                        key={`service-section-${index}`}
                        title={section.title}
                        titleSize="lg"
                        link="/screens/map"
                        linkText="View all"
                    >
                        <CardScroller space={15} className='mt-1.5 pb-4'>
                            {section.services.map((service, propIndex) => (
                                <Card
                                    key={`service-${index}-${propIndex}`}
                                    title={service.title}
                                    rounded="2xl"
                                    hasFavorite
                                    rating={4.8}
                                    href="/screens/service-detail"
                                    price={service.price}
                                    width={160}
                                    imageHeight={160}
                                    image={service.image}
                                    badge={service.badge}
                                />
                            ))}
                        </CardScroller>
                    </Section>
                ))}

            </AnimatedView>
        </ThemeScroller>

    );
}


export default ServicesScreen;