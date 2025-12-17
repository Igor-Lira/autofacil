import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/app/config/firebaseConfig';

import useThemeColors from '@/app/contexts/ThemeColors';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import Input from '@/components/forms/Input';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
  });

  const validateFields = () => {
    let valid = true;
    const temp = { ...errors };

    Object.keys(temp).forEach(k => (temp[k as keyof typeof temp] = ''));

    if (!fullName.trim()) {
      temp.fullName = 'Digite seu nome completo';
      valid = false;
    }

    if (!phone.trim()) {
      temp.phone = 'Digite seu número de telefone';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      temp.email = 'Digite seu e-mail';
      valid = false;
    } else if (!emailRegex.test(email)) {
      temp.email = 'E-mail inválido';
      valid = false;
    }

    if (emailConfirm !== email) {
      temp.emailConfirm = 'Os e-mails não coincidem';
      valid = false;
    }

    const strong =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!password) {
      temp.password = 'Digite sua senha';
      valid = false;
    } else if (!strong) {
      temp.password = 'A senha não atende aos requisitos';
      valid = false;
    }

    if (passwordConfirm !== password) {
      temp.passwordConfirm = 'As senhas não coincidem';
      valid = false;
    }

    setErrors(temp);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;
    if (!acceptedTerms) {
        Alert.alert("Termos de Uso", "Você precisa aceitar os termos para continuar.");
        return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        phone: phone,
        email: email,
        role: 'student',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.replace('/(tabs)/(home)');

    } catch (error: any) {
      console.error("Registration Error: ", error);
      
      const newErrors = { ...errors };

      // Map Firebase Errors to UI Inputs
      if (error.code === 'auth/email-already-in-use') {
        newErrors.email = 'Este e-mail já está cadastrado.';
      } else if (error.code === 'auth/invalid-email') {
        newErrors.email = 'E-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        newErrors.password = 'A senha é muito fraca.';
      } else {
        Alert.alert("Erro", "Ocorreu um erro inesperado ao criar a conta.");
      }
      
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    !fullName ||
    !phone ||
    !email ||
    !emailConfirm ||
    !password ||
    !passwordConfirm ||
    !acceptedTerms;

  return (
    <>
      <Header showBackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-light-primary dark:bg-dark-primary">

        <View className="px-6 pt-6">
          <ThemedText className="mb-1 text-3xl font-bold">Criar conta</ThemedText>
        </View>

        {/* Scroll apenas do form */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 40,
          }}>
          <Input
            label="Nome Completo"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            containerClassName="mb-4"
          />

          <Input
            label="Número de Telefone"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={setPhone}
            error={errors.phone}
            containerClassName="mb-4"
          />

          <Input
            label="E-mail"
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({...errors, email: ''});
            }}
            error={errors.email}
            containerClassName="mb-4"
          />

          <Input
            label="Confirme o e-mail"
            value={emailConfirm}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmailConfirm}
            error={errors.emailConfirm}
            containerClassName="mb-4"
          />

          <Input
            label="Senha"
            value={password}
            isPassword
            autoCapitalize="none"
            onChangeText={setPassword}
            error={errors.password}
            containerClassName="mb-4"
          />

          <View className="mb-4">
            <ThemedText className="mb-1 font-semibold">Requisitos da senha:</ThemedText>
            <ThemedText className="text-sm">• Mínimo 8 caracteres</ThemedText>
            <ThemedText className="text-sm">• 1 letra maiúscula (A-Z)</ThemedText>
            <ThemedText className="text-sm">• 1 letra minúscula (a-z)</ThemedText>
            <ThemedText className="text-sm">• Números (0-9)</ThemedText>
            <ThemedText className="text-sm">• Símbolos (!@#$%)</ThemedText>
          </View>

          <Input
            label="Confirme a senha"
            value={passwordConfirm}
            isPassword
            autoCapitalize="none"
            onChangeText={setPasswordConfirm}
            error={errors.passwordConfirm}
            containerClassName="mb-6"
          />

          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            className="mb-1 flex-row items-center">
            <View
              className={`mr-3 h-5 w-5 rounded border ${
                acceptedTerms
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-light-subtext dark:border-dark-subtext'
              }`}
            />
            <ThemedText className="flex-1">
              Eu li e concordo com os <ThemedText className="underline">Termos de Uso</ThemedText> e{' '}
              <ThemedText className="underline">Política de Privacidade</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        <View
          style={{
            paddingBottom: insets.bottom + 12,
            paddingHorizontal: 24,
          }}
          className="bg-light-primary dark:bg-dark-primary">
          
          <Pressable
            onPress={handleRegister}
            className="mb-6 w-full rounded-2xl py-4 flex-row justify-center items-center"
            disabled={isButtonDisabled || isLoading}
            style={{ 
                backgroundColor: '#98D143', 
                opacity: (isButtonDisabled || isLoading) ? 0.6 : 1 
            }}>
            
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <ThemedText className="text-center text-base font-semibold text-white">
                Criar Conta
                </ThemedText>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}