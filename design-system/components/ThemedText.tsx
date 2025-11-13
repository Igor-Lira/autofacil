// components/ThemedText.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { styled } from 'nativewind';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
}

// Wrap the native Text component so we can use className
const StyledText = styled(Text);

export default function ThemedText({ children, className, ...props }: ThemedTextProps) {
  return (
    <StyledText
      className={`text-black dark:text-white ${className || ''}`}
      {...props}
    >
      {children}
    </StyledText>
  );
}
