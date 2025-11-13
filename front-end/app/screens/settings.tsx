import { View, Image, ScrollView } from 'react-native';
import Header, { HeaderIcon } from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import Avatar from '@/components/Avatar';
import ListLink from '@/components/ListLink';
import AnimatedView from '@/components/AnimatedView';
import ThemedScroller from '@/components/ThemeScroller';
import Section from '@/components/layout/Section';

export default function ProfileScreen() {
    return (
        <AnimatedView className='flex-1 bg-light-primary dark:bg-dark-primary' animation='fadeIn' duration={350} playOnlyOnce={false}   >
            <Header showBackButton />
            <ThemedScroller>
                <Section titleSize='3xl' className='pt-4 pb-10 px-4' title="Settings" subtitle="Manage your account settings" />

                <View className='px-4'>
                    <ListLink title="Payments" description="Manage payment methods" icon="CreditCard" href="/screens/profile/payments" />
                    <ListLink title="Notifications" description="Push notifications, email notifications" icon="Bell" href="/screens/profile/notifications" />
                    <ListLink title="Currency" description="USD - United states dollar" icon="DollarSign" href="/screens/profile/currency" />
                    <ListLink title="Help" description="Contact support" icon="HelpCircle" href="/screens/help" />
                </View>
            </ThemedScroller>

        </AnimatedView>
    );
}