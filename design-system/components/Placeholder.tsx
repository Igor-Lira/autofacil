import { View, StyleProp, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import Icon, { IconName } from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';

interface PlaceholderProps {
    title: string;
    subtitle?: string;
    button?: string;
    href?: string;
    icon?: IconName;
    className?: string;
    style?: StyleProp<ViewStyle>;
}

export function Placeholder({
    title,
    subtitle,
    button,
    href,
    icon = 'Inbox',
    className = '',
    style
}: PlaceholderProps) {
    return (
        <View className={`bg-light-primary dark:bg-dark-primary items-center justify-center p-4 ${className}`} style={style}>
            <View className='w-20 h-20 border border-light-secondary dark:border-dark-secondary rounded-full items-center justify-center mb-4'>
                <Icon name={icon} size={30} className="text-light-tertiary dark:text-dark-tertiary" />
            </View>

            <ThemedText className="text-xl font-bold text-center">
                {title}
            </ThemedText>

            {subtitle && (
                <ThemedText className="text-light-subtext dark:text-dark-subtext text-center mb-4">
                    {subtitle}
                </ThemedText>
            )}

            {button && href && (
                <Button
                    className='mt-4'
                    title={button}
                    variant="outline"
                    href={href}
                    rounded="full"
                />
            )}
        </View>
    );
} 