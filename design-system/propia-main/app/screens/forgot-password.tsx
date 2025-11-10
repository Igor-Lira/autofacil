import React, { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import Input from '@/components/forms/Input';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = () => {
    const isEmailValid = validateEmail(email);

    if (isEmailValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Show success message
        Alert.alert(
          "Password Reset Link Sent",
          "We've sent a password reset link to your email address. Please check your inbox.",
          [
            { text: "OK", onPress: () => router.back() }
          ]
        );
      }, 1500);
    }
  };

  return (

    <>
    <Header showBackButton />
    <View className="flex-1 bg-light-primary dark:bg-dark-primary p-6" style={{paddingTop: insets.top}}>
     
      
      <View className="mt-8">
        <ThemedText className="text-3xl font-bold mb-1">Reset Password</ThemedText>
        <ThemedText className="text-light-subtext dark:text-dark-subtext mb-14">
          Enter your email address and we'll send you a link to reset your password
        </ThemedText>
        
        <Input
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          containerClassName='mb-4'
        />
        
        <Button 
          title="Send Reset Link" 
          onPress={handleResetPassword} 
          loading={isLoading}
          size="large"
          className="mb-6"
        />
        
        <View className="flex-row justify-center mt-8">
          <ThemedText className="text-light-subtext dark:text-dark-subtext">Remember your password? </ThemedText>
          <Link href="/screens/login" asChild>
            <Pressable>
              <ThemedText className="underline">Log in</ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
    </>
  );
}