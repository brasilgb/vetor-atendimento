import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider } from '@/lib/session-context';

export default function RootLayout() {
  return (
<<<<<<< HEAD
    <SessionProvider>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0b1220' },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            header: () => <AppHeader user logout />,
          }}
        />
      </Stack>
      <StatusBar style="light" backgroundColor="#15365f" />
    </SessionProvider>
=======
    <SafeAreaProvider>
      <SessionProvider>
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0b1220' },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="light" backgroundColor="transparent" translucent />
      </SessionProvider>
    </SafeAreaProvider>
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
  );
}
