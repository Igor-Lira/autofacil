import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { CalendarList, DateData } from 'react-native-calendars';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedText from './ThemedText';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface DateRangeCalendarProps {
  onDateRangeChange?: (range: DateRange) => void;
  initialRange?: DateRange;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  onDateRangeChange,
  initialRange,
  minDate,
  maxDate,
  className = ''
}) => {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange || {});

  // Calculate calendar width accounting for parent padding
  // SearchBar has px-global (24px on each side = 48px total)
  // Accordion has p-global (24px on each side = 48px total)
  const calendarWidth = screenWidth - 96; // 48px for SearchBar + 48px for accordion padding

  // Determine marking type based on selection state
  const getMarkingType = () => {
    if (selectedRange.startDate && selectedRange.endDate) {
      return 'period';
    }
    return undefined; // Use default marking for single selection
  };

  const handleDayPress = (day: DateData) => {
    const { dateString } = day;
    
    if (!selectedRange.startDate || (selectedRange.startDate && selectedRange.endDate)) {
      // Start new selection
      const newRange = { startDate: dateString, endDate: undefined };
      setSelectedRange(newRange);
      onDateRangeChange?.(newRange);
    } else if (selectedRange.startDate && !selectedRange.endDate) {
      // Complete the range
      const startDate = selectedRange.startDate;
      const endDate = dateString;
      
      // Ensure start date is before end date
      const newRange = startDate <= endDate 
        ? { startDate, endDate }
        : { startDate: endDate, endDate: startDate };
      
      setSelectedRange(newRange);
      onDateRangeChange?.(newRange);
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    if (selectedRange.startDate && selectedRange.endDate) {
      const start = new Date(selectedRange.startDate);
      const end = new Date(selectedRange.endDate);
      
      // Mark all dates in range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        
        if (dateString === selectedRange.startDate) {
          marked[dateString] = {
            startingDay: true,
            color: colors.highlight,
            textColor: 'white'
          };
        } else if (dateString === selectedRange.endDate) {
          marked[dateString] = {
            endingDay: true,
            color: colors.highlight,
            textColor: 'white'
          };
        } else {
          marked[dateString] = {
            color: colors.highlight + '40',
            textColor: colors.text
          };
        }
      }
    } else if (selectedRange.startDate) {
      // For single date selection, use standard selected styling
      marked[selectedRange.startDate] = {
        selected: true,
        selectedColor: colors.highlight,
        selectedTextColor: 'white'
      };
    }
    
    return marked;
  };

  const formatDateRange = () => {
    if (selectedRange.startDate && selectedRange.endDate) {
      const start = new Date(selectedRange.startDate);
      const end = new Date(selectedRange.endDate);
      const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startFormatted} - ${endFormatted}`;
    } else if (selectedRange.startDate) {
      const start = new Date(selectedRange.startDate);
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return 'Select dates';
  };

  return (
    <View className={` ${className}`}>
      {/*<View className="mb-4">
        <ThemedText className="text-sm font-medium mb-2">Selected dates</ThemedText>
        <ThemedText className="text-lg font-semibold">{formatDateRange()}</ThemedText>
      </View>*/}
      
      <CalendarList
        horizontal={true}
        pagingEnabled={true}
        scrollEnabled={true}
        showScrollIndicator={false}
        calendarWidth={calendarWidth}
        calendarHeight={350} 
        onDayPress={handleDayPress}
        markingType={getMarkingType()}
        markedDates={getMarkedDates()}
        minDate={minDate}
        maxDate={maxDate}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: colors.placeholder,
          selectedDayBackgroundColor: colors.highlight,
          selectedDayTextColor: 'white',
          todayTextColor: colors.highlight,
          dayTextColor: colors.text,
          textDisabledColor: colors.placeholder,
          dotColor: colors.highlight,
          selectedDotColor: 'white',
          arrowColor: colors.text,
          disabledArrowColor: colors.placeholder,
          monthTextColor: colors.text,
          indicatorColor: colors.highlight,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          width: '100%'
        }}
      />
    </View>
  );
};

export default DateRangeCalendar; 