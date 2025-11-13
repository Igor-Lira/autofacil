import React, { forwardRef } from 'react';
import ActionSheet, { ActionSheetProps, ActionSheetRef } from 'react-native-actions-sheet';
import useThemeColors from '@/app/contexts/ThemeColors';

interface ActionSheetThemedProps extends ActionSheetProps {}

const ActionSheetThemed = forwardRef<ActionSheetRef, ActionSheetThemedProps>(({ containerStyle, ...props }, ref) => {
    const colors = useThemeColors();

    return (
        <ActionSheet
            {...props}
            ref={ref}
            containerStyle={{
                backgroundColor: colors.sheet,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                ...containerStyle
            }}
        />
    );
});

export default ActionSheetThemed;