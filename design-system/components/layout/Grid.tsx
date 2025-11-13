import React from 'react';
import { View, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';

interface GridProps {
  children: React.ReactNode[];
  columns?: number;
  spacing?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Grid({
  children,
  columns = 2,
  spacing = 16,
  className,
  style
}: GridProps) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Calculate item dimensions
  const totalSpacing = spacing * (columns - 1);
  const itemWidth = containerWidth > 0 ? (containerWidth - totalSpacing) / columns : 0;
  
  // Create rows based on number of children and columns
  const rows = React.useMemo(() => {
    const items = React.Children.toArray(children);
    const rowsArray = [];
    
    for (let i = 0; i < items.length; i += columns) {
      rowsArray.push(items.slice(i, i + columns));
    }
    
    return rowsArray;
  }, [children, columns]);

  return (
    <View 
      className={`w-full ${className}`}
      style={style}
      onLayout={handleLayout}
    >
      {rows.map((row, rowIndex) => (
        <View 
          key={rowIndex}
          className="flex-row"
          style={{
            marginBottom: rowIndex < rows.length - 1 ? spacing : 0,
          }}
        >
          {row.map((item, colIndex) => (
            <View
              key={colIndex}
              style={{
                width: itemWidth,
                marginRight: colIndex < row.length - 1 ? spacing : 0,
              }}
            >
              {item}
            </View>
          ))}
          
          {/* Add placeholder views to maintain grid structure when row is not complete */}
          {row.length < columns && Array(columns - row.length)
            .fill(null)
            .map((_, index) => (
              <View
                key={`placeholder-${index}`}
                style={{
                  width: itemWidth,
                  marginRight: index < columns - row.length - 1 ? spacing : 0,
                }}
              />
            ))}
        </View>
      ))}
    </View>
  );
} 