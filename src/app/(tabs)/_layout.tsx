import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2f7dd1',
        tabBarInactiveTintColor: '#637083',
        tabBarStyle: {
          height: 58 + bottomInset,
          paddingTop: 8,
          paddingBottom: bottomInset,
          backgroundColor: '#ffffff',
          borderTopColor: '#d8e0ea',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
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
