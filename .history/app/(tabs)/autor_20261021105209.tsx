import { Text, View } from 'react-native'

export default function autor() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, transform: [{ scale: 1.8 }] }}>
        <img src="https://github.com/zz4fff.png" alt="Autor" width='100' height="100" />
        <Text>Flávio Augusto de Freitas</Text>
      </View>
    );
}
