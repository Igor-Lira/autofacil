import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';
import { Button } from '@/components/Button';

export default function Login() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email é obrigatório');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Por favor insira um email valido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Senha é Obrigatoria');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = () => {
    console.log('handleLogin')
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    console.log(email)
    console.log(password)
 
    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to home screen after successful login
        router.replace('/(tabs)/(home)');
      }, 1500);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View
        style={{
          paddingTop: insets.top + 20,
          backgroundColor: '#B7DA30',
          paddingBottom: 60,
          alignItems: 'flex-start',
        }}>

        {/* Logo */}
        <View className="mt-2 w-full items-center">
          <Image 
            source={require('@/assets/img/logo.png')}
            className="h-32 w-40"
            resizeMode="contain"
          />
        </View>
      </View>

      <View className="mt-10 px-6">
        {/* Campo Email */}
        <Input
          label="E-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          error={emailError}
          autoCapitalize="none"
          keyboardType="email-address"
          containerClassName="mb-4"
        />

        {/* Campo Senha */}
        <Input
          label="Senha"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) validatePassword(text);
          }}
          error={passwordError}
          isPassword
          autoCapitalize="none"
          containerClassName="mb-2"
        />

        {/* Esqueci a senha */}
        <Pressable className="mb-6 items-end">
          <ThemedText className="text-dark text-sm underline">Esqueci a senha</ThemedText>
        </Pressable>

        {/* Botão Entrar */}
        <Pressable
          onPress={() => handleLogin()}
          className="mb-6 w-full rounded-2xl py-4"
          style={{ backgroundColor: '#98D143' }}>
          <ThemedText className="text-center text-base font-semibold text-white">Entrar</ThemedText>
        </Pressable>

        {/* <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          size="large"
          className="mb-6 w-full rounded-2xl py-4"
        /> */}

        {/* Divider */}
        <View className="my-3 w-full items-center">
          <ThemedText className="text-sm text-light-subtext">Ou</ThemedText>
        </View>

        {/* Botão Google */}
        <Pressable
          onPress={() => router.replace('/(tabs)/(home)')}
          className="flex w-full flex-row items-center justify-center rounded-2xl border border-black py-4 dark:border-white">
          <View className="absolute left-4">
            <AntDesign name="google" size={22} color={colors.text} />
          </View>

          <ThemedText className="pr-2 text-base font-medium">Continue with Google</ThemedText>
        </Pressable>

        {/* Criar conta */}
        <View className="mt-8 flex-row justify-center">
          <ThemedText className="text-light-subtext dark:text-dark-subtext">
            Ainda não tem conta?
          </ThemedText>

          <Pressable onPress={() => router.push('/register')}>
            <ThemedText className="ml-1 text-highlight underline">Criar conta</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
