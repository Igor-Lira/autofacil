import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';

export default function SafeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const bypassRoutes = [
    // '/screens/onboarding-start',
     '/modal',
    // '/fullscreen',
    // //'/(drawer)/(tabs)/index',
  ];

  const shouldBypass = bypassRoutes.includes(pathname);

  return (
    <SafeAreaView
      className="flex-1 bg-light-primary dark:bg-dark-primary"
      edges={shouldBypass ? [] : undefined}
    >
      {children}
    </SafeAreaView>
  );
}
