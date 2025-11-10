import React from 'react';
import { ScrollView, View, ViewProps } from 'react-native';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ThemeFooterProps extends ViewProps {
  children: React.ReactNode;
}

const ThemeFooter = styled(View);

export default function ThemedFooter({ children, className, ...props }: ThemeFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <ThemeFooter
      style={{paddingBottom: insets.bottom}}
      className={`bg-light-primary dark:bg-dark-primary px-global pt-global w-full  ${className || ''}`}
      {...props}
    >
      {children}
    </ThemeFooter>
  );
}
