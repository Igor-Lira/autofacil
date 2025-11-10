import React, { forwardRef } from 'react';
import { View, Pressable, ViewStyle, PressableProps } from 'react-native';
import { Link } from 'expo-router';
import ThemedText from '../ThemedText';
import Avatar from '../Avatar';
import Icon, { IconName } from '../Icon';

interface IconConfig {
    name: IconName;
    color?: string;
    size?: number;
    variant?: 'plain' | 'bordered' | 'contained';
    iconSize?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
}

interface ListItemProps extends PressableProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    leading?: React.ReactNode;
    avatar?: {
        src?: string;
        name?: string;
        size?: 'xs' | 'sm' | 'md';
    };
    icon?: IconConfig;
    trailing?: React.ReactNode;
    trailingIcon?: IconConfig;
    disabled?: boolean;
    className?: string;
    style?: ViewStyle;
    href?: string;
}

const ListItem = forwardRef<View, ListItemProps>((props, ref) => {
    const {
        title,
        subtitle,
        leading,
        avatar,
        icon,
        trailing,
        trailingIcon,
        onPress,
        disabled = false,
        className = '',
        style,
        href,
        ...rest
    } = props;

    const renderLeading = () => {
        if (leading) return leading;
        if (avatar) return <Avatar {...avatar} size={avatar.size || 'sm'} />;
        if (icon) return (
            <Icon 
                name={icon.name}
                color={icon.color}
                variant="bordered"
                iconSize="m"
            />
        );
        return null;
    };

    const renderTrailing = () => {
        if (trailing) return trailing;
        if (trailingIcon) return <Icon {...trailingIcon} />;
        return null;
    };

    const hasLeading = leading || avatar || icon;
    const hasTrailing = trailing || trailingIcon;

    const itemContent = (
        <View 
            className={`
                flex-row items-center
                ${disabled ? 'opacity-50' : ''}
                ${className}
            `}
            style={style}
        >
            {hasLeading && (
                <View className="mr-3">
                    {renderLeading()}
                </View>
            )}
            
            <View className="flex-1">
                {typeof title === 'string' ? (
                    <ThemedText className="text-base font-semibold">
                        {title}
                    </ThemedText>
                ) : (
                    title
                )}
                {subtitle && (
                    <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
                        {subtitle}
                    </ThemedText>
                )}
            </View>

            {hasTrailing && (
                <View className="ml-4">
                    {renderTrailing()}
                </View>
            )}
        </View>
    );

    // If href is provided, use Link component
    if (href && !disabled) {
        return (
            <Link href={href} asChild>
                <Pressable
                    ref={ref}
                    className={`active:bg-light-secondary/10 dark:active:bg-dark-secondary/10`}
                    {...rest}
                >
                    {itemContent}
                </Pressable>
            </Link>
        );
    }

    // Otherwise, use standard Pressable
    return (
        <Pressable
            ref={ref}
            onPress={disabled ? undefined : onPress}
            className={`
                ${onPress ? 'active:bg-light-secondary/10 dark:active:bg-dark-secondary/10' : ''}
            `}
            {...rest}
        >
            {itemContent}
        </Pressable>
    );
});

ListItem.displayName = 'ListItem';

export default ListItem; 