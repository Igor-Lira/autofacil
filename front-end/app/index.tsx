import { Redirect } from 'expo-router';

export default function Index() {
  const isLogged = false;

  if (!isLogged) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return <Redirect href="/(tabs)/(home)" />;
}