import React, { ReactNode, useState, useRef, useEffect, Children, isValidElement } from 'react';
import { View, Pressable, ScrollView, Animated } from 'react-native';
import Header from '@/components/Header';
import { Button } from '@/components/Button';
import ThemedText from '@/components/ThemedText';
import Icon from '@/components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Step component that will be used as children
export interface StepProps {
  title: string;
  optional?: boolean;
  children: ReactNode;
}

export const Step: React.FC<StepProps> = ({ children }) => {
  return <>{children}</>; // Just render children, this is mainly for type safety
};

// Add this to help with type checking
const isStepComponent = (child: any): child is React.ReactElement<StepProps> => {
  return isValidElement(child) && (child.type === Step || (typeof child.type === 'function' && child.type.name === 'Step'));
};

interface StepData {
  key: string;
  title: string;
  optional?: boolean;
  component: ReactNode;
}

interface MultiStepProps {
  children: ReactNode;
  onComplete: () => void;
  onClose?: () => void;
  showHeader?: boolean;
  showStepIndicator?: boolean;
  className?: string;
  onStepChange?: (nextStep: number) => boolean;
}

export default function MultiStep({
  children,
  onComplete,
  onClose,
  showHeader = true,
  showStepIndicator = true,
  className = '',
  onStepChange,
}: MultiStepProps) {
  // Filter and validate children to only include Step components
  const validChildren = Children.toArray(children)
    .filter(isStepComponent);
  
  // Extract step data from children
  const steps: StepData[] = validChildren.map((child, index) => {
    const { title, optional, children: stepContent } = (child as React.ReactElement<StepProps>).props;
    return {
      key: `step-${index}`,
      title: title || `Step ${index + 1}`,
      optional,
      component: stepContent
    };
  });

  // Ensure we have at least one step
  if (steps.length === 0) {
    steps.push({
      key: 'empty-step',
      title: 'Empty',
      component: <View><ThemedText>No steps provided</ThemedText></View>
    });
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnims = useRef(steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Reset and start fade/slide animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Animate progress indicators
    steps.forEach((_, index) => {
      Animated.timing(progressAnims[index], {
        toValue: index <= currentStepIndex ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStepIndex]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      const nextStep = currentStepIndex + 1;
      const canProceed = onStepChange ? onStepChange(nextStep) : true;
      
      if (canProceed) {
        setCurrentStepIndex(nextStep);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep.optional && !isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={{paddingBottom: insets.bottom}} className={`flex-1 bg-light-primary dark:bg-dark-primary ${className}`}>
      {showHeader && (
        <Header
          rightComponents={[
            onClose ? (
              <Pressable
                key="close"
                onPress={() => router.back()}
                className="p-2 rounded-full active:bg-light-secondary dark:active:bg-dark-secondary"
                hitSlop={8}
              >
                <Icon
                  name="X"
                  size={24}
                  className="text-light-text dark:text-dark-text"
                />
              </Pressable>
            ) : undefined
          ]}
          leftComponent={[
            currentStep.optional && !isLastStep && (
              <Button
                key="skip"
                title="Skip"
                variant="ghost"
                onPress={handleSkip}
                size="small"
              />
            ),
            !isFirstStep && (
              <Icon
                name="ArrowLeft"
                key="back"
                size={24}
                className="text-light-text dark:text-dark-text"
                onPress={handleBack}
              />
            ),
          ]}
        />
      )}

      

      {/* Step Content */}
      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStep.component}
        </ScrollView>
      </Animated.View>

      {/* Step Indicators */}
      {showStepIndicator && (
        <View className="px-4 py-3 flex-row justify-center">
          {steps.map((_, index) => (
            <Animated.View
              key={index}
              className="h-1 rounded-full flex-1 mx-1 overflow-hidden bg-neutral-500 dark:bg-dark-secondary"
              style={{
                width: 20,
                opacity: index === currentStepIndex ? 1 : 0.5,
              }}
            >
              <Animated.View
                className="h-full bg-light-accent dark:bg-dark-accent"
                style={{
                  width: progressAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }}
              />
            </Animated.View>
          ))}
        </View>
      )}

      {/* Bottom Navigation */}
      <View className="px-4 py-3 border-t border-light-secondary dark:border-dark-secondary">
        <Button
          title={isLastStep ? "Complete" : "Next"}
          onPress={handleNext}
          className="w-full"
          size="large"
          textClassName='text-white'
        />
      </View>
    </View>
  );
} 