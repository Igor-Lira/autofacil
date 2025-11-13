import React from 'react';

import Header from '@/components/Header';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedFooter from '@/components/ThemeFooter';
import Section from '@/components/layout/Section';
import ThemedText from '@/components/ThemedText';
import { View } from 'react-native';
import { shadowPresets } from '@/utils/useShadow';
import Icon from '@/components/Icon';
import Grid from '@/components/layout/Grid';


const InsightsScreen = () => {
    const colors = useThemeColors();


    return (
        <>
            <Header
                title=" "
                showBackButton
            />
            <ThemedScroller className="flex-1" keyboardShouldPersistTaps="handled">
                <Section title="Insights" titleSize='3xl' className='py-10' />
                <Grid columns={2} spacing={10}>
                    <InsightCard icon="Calendar" title="Longer Stays" percentage={25} amount="1/4" />
                    <InsightCard icon="WashingMachine" title="Amenities" percentage={50} amount="2/4" />
                    <InsightCard icon="SlidersHorizontal" title="Flexible Stays" percentage={75} amount="3/4" />
                    <InsightCard icon="Users" title="Family Travel" percentage={50} amount="2/4" />
                    <InsightCard icon="Waves" title="Beachfront" percentage={25} amount="1/4" />
                    <InsightCard icon="Dog" title="Pet Friendly" percentage={50} amount="2/4" />
                    <InsightCard icon="Home" title="Star" percentage={75} amount="3/4" />
                </Grid>
            </ThemedScroller>
        </>
    );
};

const InsightCard = (props: any) => {
    return (
        <View
            style={{ ...shadowPresets.large }}
            className='bg-light-primary dark:bg-dark-secondary rounded-3xl p-4'>
            <Icon name={props.icon} size={20} strokeWidth={2} color="white" className='bg-highlight w-12 h-12 rounded-full mb-20' />
            <ThemedText className='text-xl font-semibold mb-1'>{props.title}</ThemedText>
            <View className='flex-row items-center w-full'>
                <View className='h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 flex-1 mr-3' >
                    <View className='h-full bg-highlight rounded-full ' style={{ width: `${props.percentage}%` }} />
                </View>
                <ThemedText className='text-sm opacity-50'>{props.amount}</ThemedText>
            </View>
        </View>
    )
}


export default InsightsScreen;