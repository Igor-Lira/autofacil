import Header, { HeaderIcon } from '@/components/Header';
import ThemeScroller from '@/components/ThemeScroller';
import React, { useRef, useEffect, useContext } from 'react';
import { View, Text, Pressable, Image, Animated } from 'react-native';
import Section from '@/components/layout/Section';  
import { CardScroller } from '@/components/CardScroller';
import Card from '@/components/Card';
import AnimatedView from '@/components/AnimatedView';
import { ScrollContext } from './_layout';

const ExperienceScreen = () => {
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
                    {[
                        {
                            title: "Popular Experiences in Manhattan",
                            experiences: [
                                { 
                                    title: "Rooftop Bar Hopping", 
                                    image: "https://images.pexels.com/photos/13542704/pexels-photo-13542704.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                    price: "$75",
                                    rating: 4.8,
                                    badge: "New"
                                },
                                { 
                                    title: "Museum Mile Tour", 
                                    image: "https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                    price: "$45",
                                    rating: 4.9,
                                    badge: "New"
                                },
                                { 
                                    title: "Broadway Behind the Scenes", 
                                    image: "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?q=80&w=400",
                                    price: "$95",
                                    rating: 4.7
                                },
                                { 
                                    title: "Food Tour in Little Italy", 
                                    image: "https://images.pexels.com/photos/1487511/pexels-photo-1487511.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                    price: "$65",
                                    rating: 4.6
                                }
                            ]
                        },
                        {
                            title: "Brooklyn Adventures",
                            experiences: [
                                { 
                                    title: "Street Art Walking Tour", 
                                    image: "https://images.unsplash.com/photo-1503410781609-75b1d892dd28?q=80&w=400",
                                    price: "$35",
                                    rating: 4.9
                                },
                                { 
                                    title: "Craft Beer Experience", 
                                    image: "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?q=80&w=400",
                                    price: "$55",
                                    rating: 4.7
                                },
                                { 
                                    title: "DUMBO Photo Tour", 
                                    image: "https://images.unsplash.com/photo-1520190282873-afe1285c9a2a?q=80&w=400",
                                    price: "$40",
                                    rating: 4.8
                                },
                                { 
                                    title: "Williamsburg Food Scene", 
                                    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400",
                                    price: "$70",
                                    rating: 4.6
                                }
                            ]
                        },
                        {
                            title: "Harlem Culture & Nightlife",
                            experiences: [
                                { 
                                    title: "Jazz Club Evening", 
                                    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=400",
                                    price: "$60",
                                    rating: 4.9
                                },
                                { 
                                    title: "Soul Food Tour", 
                                    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400",
                                    price: "$50",
                                    rating: 4.8
                                },
                                { 
                                    title: "Gospel Experience", 
                                    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400",
                                    price: "$45",
                                    rating: 4.9
                                },
                                { 
                                    title: "Historic Harlem Tour", 
                                    image: "https://images.pexels.com/photos/9471914/pexels-photo-9471914.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                    price: "$40",
                                    rating: 4.7
                                }
                            ]
                        },
                        {
                            title: "Queens Diversity Tour",
                            experiences: [
                                { 
                                    title: "Flushing Food Adventure", 
                                    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400",
                                    price: "$55",
                                    rating: 4.8
                                },
                                { 
                                    title: "Art District Gallery Hop", 
                                    image: "https://images.pexels.com/photos/161154/stained-glass-spiral-circle-pattern-161154.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                    price: "$35",
                                    rating: 4.6
                                },
                                { 
                                    title: "Night Market Experience", 
                                    image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=400",
                                    price: "$45",
                                    rating: 4.7
                                },
                                { 
                                    title: "Cultural Dance Workshop", 
                                    image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=400",
                                    price: "$40",
                                    rating: 4.8
                                }
                            ]
                        },
                        {
                            title: "Unique NYC Experiences",
                            experiences: [
                                { 
                                    title: "Sunset Sail Experience", 
                                    image: "https://images.pexels.com/photos/3346227/pexels-photo-3346227.jpeg?auto=compress&cs=tinysrgb&w=1200",
                                    price: "$95",
                                    rating: 4.9
                                },
                                { 
                                    title: "Helicopter City Tour", 
                                    image: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?q=80&w=400",
                                    price: "$299",
                                    rating: 4.8
                                },
                                { 
                                    title: "Secret Speakeasy Tour", 
                                    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=400",
                                    price: "$85",
                                    rating: 4.7
                                },
                                { 
                                    title: "Urban Photography", 
                                    image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?q=80&w=400",
                                    price: "$65",
                                    rating: 4.8
                                }
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
                                {section.experiences.map((experience, propIndex) => (
                                    <Card
                                        key={`experience-${index}-${propIndex}`}
                                        title={experience.title}
                                        rounded="2xl"
                                        hasFavorite
                                        rating={experience.rating}
                                        href="/screens/experience-detail"
                                        price={experience.price}
                                        width={160}
                                        imageHeight={160}
                                        image={experience.image}
                                        badge={experience.badge}
                                    />
                                ))}
                            </CardScroller>
                        </Section>
                    ))}

                </AnimatedView>
            </ThemeScroller>

    );
}


export default ExperienceScreen;