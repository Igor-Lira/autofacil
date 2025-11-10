import React, { useState, useEffect, useRef } from 'react';

import Header from '@/components/Header';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedFooter from '@/components/ThemeFooter';
import { View, Dimensions, ScrollView, Animated, Pressable } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { BarChart } from 'react-native-chart-kit';
import Divider from '@/components/layout/Divider';
import Icon from '@/components/Icon';

const EarningsScreen = () => {
    const colors = useThemeColors();
    const screenWidth = Dimensions.get('window').width;

    // Sample earnings data for 12 months
    const earningsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                data: [45000, 28000, 35000, 85000, 120000, 95000, 110000, 75000, 90000, 105000, 80000, 125000]
            }
        ]
    };

    const chartConfig = {
        backgroundColor: colors.bg,
        backgroundGradientFrom: colors.bg,
        backgroundGradientTo: colors.bg,
        decimalPlaces: 0,
        color: (opacity = 1) => colors.highlight,
        labelColor: (opacity = 1) => colors.placeholder,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '0',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.border,
            strokeWidth: 1,
        },
        propsForLabels: {
            fontSize: 12,
            fontWeight: '500',
        },
        formatYLabel: (value: string) => {
            const num = parseInt(value);
            if (num >= 1000000) {
                return `₱${(num / 1000000).toFixed(0)}M`;
            } else if (num >= 1000) {
                return `₱${(num / 1000).toFixed(0)}K`;
            }
            return `₱${num}`;
        },
        barPercentage: 0.8,
        fillShadowGradientFrom: colors.highlight,
        fillShadowGradientTo: colors.bg,
        fillShadowGradientFromOpacity: 1,
        fillShadowGradientToOpacity: 1,
    };

    return (
        <>
            <Header
                title=""
                showBackButton
            />
            <ThemedScroller
                className="flex-1 px-0"
                keyboardShouldPersistTaps="handled"
            >
                <Counter />

                {/* Scrollable Bar Chart */}
                <View className="mb-6">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        <BarChart
                            data={earningsData}
                            width={screenWidth * 1.5} // Make chart wider than screen for scrolling
                            height={300}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={chartConfig}
                            style={{
                                borderRadius: 16,
                            }}
                            fromZero={true}
                            showBarTops={false}
                            showValuesOnTopOfBars={false}
                            withInnerLines={true}
                            segments={4}
                        />

                    </ScrollView>
                </View>
                <View className='px-global border-t-8 pt-global border-light-secondary dark:border-dark-secondary'>
                    <ThemedText className='text-2xl font-semibold mb-4'>Upcoming</ThemedText>
                    <UpcomingList status="Scheduled" date="June 12" amount="$1,200.00" />
                    <UpcomingList status="Scheduled" date="June 16" amount="$4,200.00" />
                    <UpcomingList status="Scheduled" date="June 20" amount="$2,200.00" />
                    <UpcomingList status="Scheduled" date="June 24" amount="$3,200.00" />
                    <UpcomingList status="Scheduled" date="June 28" amount="$5,200.00" />

                </View>

            </ThemedScroller>
        </>
    );
};

const UpcomingList = (props: any) => {
    return (
        <View className='flex-row items-center justify-between my-3'>
            <View>
                <ThemedText className='text-base opacity-50'>{props.status}</ThemedText>
                <ThemedText className='text-lg'>{props.date}</ThemedText>
            </View>
            <ThemedText className='text-lg'>{props.amount}</ThemedText>
        </View>
    )
}

const Counter = (props: any) => {
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const countAnim = useRef(new Animated.Value(0)).current;

    const monthsData = [
        { month: 'this month', amount: 10201 },
        { month: 'in April', amount: 8750 },
        { month: 'in March', amount: 12340 },
        { month: 'in February', amount: 9680 },
        { month: 'in January', amount: 11520 },
        { month: 'in December', amount: 15200 },
    ];

    const currentData = monthsData[currentMonthIndex];
    const [displayAmount, setDisplayAmount] = useState(currentData.amount);

    useEffect(() => {
        // Animate number counting
        const startValue = displayAmount;
        const endValue = currentData.amount;
        
        countAnim.setValue(0);
        
        const listener = countAnim.addListener(({ value }) => {
            const currentAmount = Math.round(startValue + (endValue - startValue) * value);
            setDisplayAmount(currentAmount);
        });

        Animated.timing(countAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
        }).start();

        return () => {
            countAnim.removeListener(listener);
        };
    }, [currentMonthIndex]);

    const animateTransition = (callback: () => void) => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
        
        setTimeout(callback, 200);
    };

    const goToPrevious = () => {
        if (currentMonthIndex < monthsData.length - 1) {
            animateTransition(() => {
                setCurrentMonthIndex(currentMonthIndex + 1);
            });
        }
    };

    const goToNext = () => {
        if (currentMonthIndex > 0) {
            animateTransition(() => {
                setCurrentMonthIndex(currentMonthIndex - 1);
            });
        }
    };

    return (
        <View className='mt-14 mb-20 px-global'>
            <ThemedText className='text-5xl font-semibold'>You've made</ThemedText>
            <ThemedText className='text-5xl text-highlight font-semibold'>
                ${displayAmount.toLocaleString()}
            </ThemedText>
            <View className='flex-row items-center justify-between'>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <ThemedText className='text-5xl font-semibold'>{currentData.month}</ThemedText>
                </Animated.View>
                <View className='flex-row items-center justify-center'>
                    <Pressable 
                        onPress={goToPrevious}
                        className={`w-10 h-10 items-center justify-center mr-2 rounded-full border border-neutral-300 ${
                            currentMonthIndex >= monthsData.length - 1 ? 'opacity-30' : 'opacity-100'
                        }`}
                        disabled={currentMonthIndex >= monthsData.length - 1}
                    >
                        <Icon name="ChevronLeft" size={24} className='-translate-x-px' />
                    </Pressable>
                    <Pressable 
                        onPress={goToNext}
                        className={`w-10 h-10 items-center justify-center rounded-full border border-neutral-300 ${
                            currentMonthIndex <= 0 ? 'opacity-30' : 'opacity-100'
                        }`}
                        disabled={currentMonthIndex <= 0}
                    >
                        <Icon name="ChevronRight" size={24} className='translate-x-px' />
                    </Pressable>
                </View>
            </View>
            <ThemedText className='text-lg'>Upcoming <ThemedText className='text-lg font-semibold'>$3,201</ThemedText></ThemedText>
        </View>
    );
};

export default EarningsScreen;