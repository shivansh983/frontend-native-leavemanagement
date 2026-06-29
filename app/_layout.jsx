import { Stack } from 'expo-router';
import { AuthProvider } from '../context/auth.context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(dashboard)" />
      </Stack>
    </AuthProvider>
  );
}