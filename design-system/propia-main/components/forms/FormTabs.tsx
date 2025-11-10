import React, { useState } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';
import ThemedText from '../ThemedText';

interface FormTabProps {
  title: string;
  isActive?: boolean;
  onPress?: () => void;
}

export function FormTab({ title, isActive, onPress }: FormTabProps) {
  return (
    <Pressable
      onPress={onPress}
      className={
        `flex-1 py-2.5 px-4 rounded-xl ${isActive ? "bg-light-primary dark:bg-light-primary shadow-lg" : "bg-transparent"}`
      }
    >
      <ThemedText
        className={
          `text-center text-sm font-medium ${isActive ? "text-black dark:text-black" : "text-black dark:text-white"}`
        }
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

interface FormTabsProps {
  children: React.ReactElement<FormTabProps>[];
  defaultActiveTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
  props?: any;
  style?: ViewStyle;
}

export default function FormTabs({ children, defaultActiveTab, style, onChange, className = '' }: FormTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || children[0].props.title);

  return (

    <View className={`flex-row p-1 bg-light-secondary dark:bg-dark-secondary rounded-xl overflow-hidden ${className}`} style={style}>
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            isActive: activeTab === child.props.title,
            onPress: () => {
              setActiveTab(child.props.title);
              onChange?.(child.props.title);
            }
          });
        })}
      </View>
      
  );
} 