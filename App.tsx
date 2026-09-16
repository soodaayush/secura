import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from './src/context/AppDataContext';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
