import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colors = Colors[useColorScheme() ?? 'light'];
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarActiveBackgroundColor: colors.muted,
        tabBarInactiveBackgroundColor: colors.card,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 58 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          borderRadius: 8,
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Atendimento',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="groups" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orcamentos"
        options={{
          title: 'Orçamentos',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="description" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
