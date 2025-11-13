import React from 'react';
import { View, ViewStyle } from 'react-native';
import ThemedText from '../ThemedText';
import Icon, { IconName } from '../Icon';
import { Link } from 'expo-router';

type TitleSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface SectionProps {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    className?: string;
    icon?: IconName;
    titleSize?: TitleSize;
    style?: ViewStyle;
    link?: string;
    linkText?: string;
    linkClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
    children,
    title,
    subtitle,
    header,
    footer,
    padding = 'none',
    className = '',
    style,
    icon,
    titleSize = 'xl',
    link,
    linkText,
    linkClassName = '',
}) => {
    const getPaddingClass = () => {
        switch (padding) {
            case 'none': return 'py-0';
            case 'sm': return 'py-2';
            case 'md': return 'py-4';
            case 'lg': return 'py-6';
            case 'xl': return 'py-8';
            case '2xl': return 'py-10';
            case '3xl': return 'py-12';
            case '4xl': return 'py-16';
            default: return 'py-4';
        }
    };

    const getTitleClass = () => {
        switch (titleSize) {
            case 'sm': return 'text-sm';
            case 'md': return 'text-base';
            case 'lg': return 'text-lg';
            case 'xl': return 'text-xl';
            case '2xl': return 'text-2xl';
            case '3xl': return 'text-3xl';
            case '4xl': return 'text-4xl';
            default: return 'text-xl';
        }
    };

    return (
        <View
            className={`w-full ${getPaddingClass()} ${className}`}
            style={style}
        >
            {/* Header Section */}
            {(title || header) && (
                <View className="flex-row items-center">
                    {icon && (
                        <View className="mr-4">
                            <Icon name={icon} size={24} />
                        </View>
                    )}
                    <View>
                        {header || (
                            <>
                                {title && (
                                    <View className='flex-row items-center w-full justify-start'>
                                        <ThemedText className={`${getTitleClass()} font-semibold`}>
                                            {title}
                                        </ThemedText>
                                        {link && (
                                            <Link href={link} className={`${linkClassName} text-black dark:text-white underline ml-2`}>
                                                <Icon name="ChevronRight" size={20} />
                                            </Link>
                                        )}
                                    </View>
                                )}
                                {subtitle && (
                                    <ThemedText className={` text-light-subtext dark:text-dark-subtext`}>
                                        {subtitle}
                                    </ThemedText>
                                )}
                            </>
                        )}
                    </View>
                </View>
            )}

            {/* Content */}
            <View>
                {children}
            </View>

            {/* Footer Section */}
            {footer && (
                <View className="mt-4">
                    {footer}
                </View>
            )}
        </View>
    );
};

export default Section; 