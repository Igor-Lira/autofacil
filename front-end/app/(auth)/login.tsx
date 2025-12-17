import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth

import { auth } from '@/app/config/firebaseConfig';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';

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

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
 
    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      
      try {
        // Firebase Login Call
        await signInWithEmailAndPassword(auth, email, password);
        
        // Success
        router.replace('/(tabs)/(home)');
      } catch (error: any) {
        console.error(error);
        
        // Handle Firebase Errors
        if (error.code === 'auth/invalid-credential') {
            Alert.alert('Erro', 'E-mail ou senha incorretos.');
        } else if (error.code === 'auth/user-not-found') {
            Alert.alert('Erro', 'Usuário não encontrado.');
        } else {
            Alert.alert('Erro', 'Ocorreu um erro ao fazer login.');
        }
      } finally {
        setIsLoading(false);
      }
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
        <View className="mt-2 w-full items-center">
          <Image 
            source={require('@/assets/img/logo.png')}
            className="h-32 w-40"
            resizeMode="contain"
          />
        </View>
      </View>

      <View className="mt-10 px-6">
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

        <Pressable className="mb-6 items-end">
          <ThemedText className="text-dark text-sm underline">Esqueci a senha</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          className="mb-6 w-full rounded-2xl py-4 flex-row justify-center items-center"
          style={{ backgroundColor: '#98D143', opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText className="text-center text-base font-semibold text-white">Entrar</ThemedText>
          )}
        </Pressable>

        <View className="my-3 w-full items-center">
          <ThemedText className="text-sm text-light-subtext">Ou</ThemedText>
        </View>

        <Pressable
          onPress={() => router.replace('/(tabs)/(home)')} // Implement Google Auth Logic separately
          className="flex w-full flex-row items-center justify-center rounded-2xl border border-black py-4 dark:border-white">
          <View className="absolute left-4">
            <AntDesign name="google" size={22} color={colors.text} />
          </View>
          <ThemedText className="pr-2 text-base font-medium">Continue with Google</ThemedText>
        </Pressable>

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