import React from 'react';

import Header from '@/components/Header';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedScroller from '@/components/ThemeScroller';
import ThemedFooter from '@/components/ThemeFooter';


const EmptyScreen = () => {
        const colors = useThemeColors();


    return (
        <>
            <Header
                title=" "
                showBackButton
            />
            <ThemedScroller
                className="flex-1 pt-8"
                keyboardShouldPersistTaps="handled"
            >
                <></>
            </ThemedScroller>
            <ThemedFooter>
                <></>
            </ThemedFooter>
        </>
    );
};

export default EmptyScreen;