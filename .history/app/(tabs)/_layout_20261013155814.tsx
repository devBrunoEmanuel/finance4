import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="accounts" options={{ title: 'Contas' }} />
    </Tabs>
  );
}