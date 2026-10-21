import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="accounts" options={{ title: 'Contas' }} />
      <Tabs.Screen name="accounts/new" options={{ href: null, title: 'Nova conta' }} />
      <Tabs.Screen name="accounts/[id]" options={{ href: null, title: 'Editar conta' }} />
      <Tabs.Screen name="config" options={{ title: 'Configurações' }} />
    </Tabs>
  );
}