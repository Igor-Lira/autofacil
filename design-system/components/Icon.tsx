import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useThemeColors } from '@/app/contexts/ThemeColors';
import { LucideProps } from 'lucide-react-native';


type IconVariant = 'plain' | 'bordered' | 'contained';
type IconSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
type IconName = Exclude<keyof typeof LucideIcons, 'createLucideIcon' | 'default'>;

interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    variant?: IconVariant;
    iconSize?: IconSize;
    href?: string;
    onPress?: () => void;
    disabled?: boolean;
    className?: string;
    style?: ViewStyle;
    strokeWidth?: number;
    fill?: string;
}

const Icon: React.FC<IconProps> = ({
    name,
    size,
    color,
    variant = 'plain',
    iconSize,
    href,
    onPress,
    disabled = false,
    className,
    style,
    strokeWidth = 2,
    fill = 'none'
}) => {
    const colors = useThemeColors();

    const sizeMap = {
        xs: { container: 'w-8 h-8', icon: 16 },
        s: { container: 'w-10 h-10', icon: 20 },
        m: { container: 'w-12 h-12', icon: 24 },
        l: { container: 'w-16 h-16', icon: 32 },
        xl: { container: 'w-20 h-20', icon: 40 },
        xxl: { container: 'w-24 h-24', icon: 48 },
    };

    const getSize = () => {
        if (iconSize && sizeMap[iconSize]) {
            return sizeMap[iconSize];
        }
        if (typeof size === 'number') {
            return { container: '', icon: size };
        }
        return { container: '', icon: 24 };
    };

    const getVariantClass = () => {
        switch (variant) {
            case 'bordered':
                return 'border border-light-secondary dark:border-dark-secondary rounded-full items-center justify-center';
            case 'contained':
                return 'bg-light-secondary dark:bg-dark-secondary rounded-full items-center justify-center';
            default:
                return '';
        }
    };

    const { container, icon } = getSize();
    
    const classes = [
        'items-center justify-center',
        (variant !== 'plain' && container) ? container : '',
        variant !== 'plain' ? getVariantClass() : '',
        className || ''
    ].filter(Boolean).join(' ').trim();

    const IconComponent = LucideIcons[name] as React.ComponentType<LucideProps>;

    const content = (
        <View style={style} className={classes || undefined}>
            <IconComponent
                size={icon}
                color={color || colors.text}
                strokeWidth={strokeWidth}
                fill={fill}
            />
        </View>
    );

    if (href) {
        return (
            <Link href={href} asChild>
                <Pressable disabled={disabled}>
                    {content}
                </Pressable>
            </Link>
        );
    }

    if (onPress) {
        return (
            <Pressable
                onPress={disabled ? undefined : onPress}
                disabled={disabled}
                style={style} className={classes || undefined}
            >
                {content}
            </Pressable>
        );
    }

    return content;
};

export default Icon;
export type { IconName };