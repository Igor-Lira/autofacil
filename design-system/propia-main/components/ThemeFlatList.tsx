import React, { forwardRef } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { styled } from 'nativewind';

// Create a styled FlatList
const StyledFlatList = styled(FlatList);

// Define the props type, making it generic
export type ThemedFlatListProps<T> = FlatListProps<T> & {
  className?: string;
};

// Use forwardRef to properly handle refs
function ThemedFlatListInner<T>(
  { className, ...props }: ThemedFlatListProps<T>,
  ref: React.Ref<FlatList<T>>
) {
  // We need to cast StyledFlatList to any to avoid TypeScript errors with generics
  const TypedStyledFlatList = StyledFlatList as any;
  
  return (
    <TypedStyledFlatList
      bounces={true}
      overScrollMode='never'
      ref={ref}
      showsVerticalScrollIndicator={false}
      className={`bg-light-primary dark:bg-dark-primary flex-1 px-global ${className || ''}`}
      {...props}
    />
  );
}

// Create the forwardRef component with proper typing
const ThemedFlatList = forwardRef(ThemedFlatListInner) as <T>(
  props: ThemedFlatListProps<T> & { ref?: React.Ref<FlatList<T>> }
) => React.ReactElement;

export default ThemedFlatList;
