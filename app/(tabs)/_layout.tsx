import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="accounts" options={{ title: 'Contas' }} />
      {/* Telas de formulário: escondidas só visualmente na barra de abas.
          Não usar `href: null` aqui: no expo-router 58 ele vira `hidden: true`
          e navegar para a aba oculta redireciona de volta para /accounts. */}
      <Tabs.Screen name="accounts/new" options={{ title: 'Nova conta', tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="accounts/[id]" options={{ title: 'Editar conta', tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="config" options={{ title: 'Configurações' }} />
      <Tabs.Screen name="autor" options={{ title: 'Autor' }} />
    </Tabs>
  );
}