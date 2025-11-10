import React, { useState } from 'react';
import { View, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import ThemedScroller from '@/components/ThemeScroller';
import Icon from '@/components/Icon';
import AnimatedView from '@/components/AnimatedView';

interface Currency {
    code: string;
    title: string;
}

const CurrencyScreen = () => {
    const navigation = useNavigation();
    const [selectedCurrency, setSelectedCurrency] = useState("USD");

    const currencies: Currency[] = [
        { code: "USD", title: "United States Dollar" },
        { code: "EUR", title: "Euro" },
        { code: "GBP", title: "British Pound" },
        { code: "CAD", title: "Canadian Dollar" },
        { code: "AUD", title: "Australian Dollar" },
        { code: "CHF", title: "Swiss Franc" },
        { code: "JPY", title: "Japanese Yen" },
        { code: "CNY", title: "Chinese Yuan" },
        { code: "INR", title: "Indian Rupee" },
        { code: "BRL", title: "Brazilian Real" },
        { code: "ZAR", title: "South African Rand" },
        { code: "MXN", title: "Mexican Peso" },
    ];

    const saveSettings = () => {
        // Here you would save the selected currency
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-light-bg dark:bg-dark-bg">
            <Header showBackButton
                title="Currency"
                rightComponents={[
                    <Button title="Save" onPress={saveSettings} />
                ]}
            />
            <ThemedScroller>
                {currencies.map((currency) => (
                    <CurrencyItem
                        key={currency.code}
                        title={currency.title}
                        code={currency.code}
                        selected={selectedCurrency === currency.code}
                        onSelect={() => setSelectedCurrency(currency.code)}
                    />
                ))}
            </ThemedScroller>
        </View>
    );
};

interface CurrencyItemProps {
    title: string;
    code: string;
    selected: boolean;
    onSelect: () => void;
}

const CurrencyItem = ({ title, code, selected, onSelect }: CurrencyItemProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSelect}
            className={`flex-row items-center justify-between py-4 border-b border-light-secondary dark:border-dark-secondary ${selected ? 'opacity-100' : 'opacity-100 '}`}
        >
            <View>
                <ThemedText className='text-lg font-bold'>{code}</ThemedText>
                <ThemedText className="text-light-subtext dark:text-dark-subtext">{title}</ThemedText>
            </View>
            {selected &&
                <AnimatedView animation="bounceIn" duration={500}>
                    <Icon name="Check" size={25} />
                </AnimatedView>

            }
        </TouchableOpacity>
    );
};

export default CurrencyScreen;
