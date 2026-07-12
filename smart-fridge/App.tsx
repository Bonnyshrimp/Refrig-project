import { Prompt_500Medium } from '@expo-google-fonts/prompt/500Medium';
import { Prompt_600SemiBold } from '@expo-google-fonts/prompt/600SemiBold';
import { Prompt_700Bold } from '@expo-google-fonts/prompt/700Bold';
import { Sarabun_400Regular } from '@expo-google-fonts/sarabun/400Regular';
import { Sarabun_700Bold } from '@expo-google-fonts/sarabun/700Bold';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AddSheet from './src/components/AddSheet';
import TabBar from './src/components/TabBar';
import FridgeScreen from './src/screens/FridgeScreen';
import HealthScreen from './src/screens/HealthScreen';
import MenuScreen from './src/screens/MenuScreen';
import ShoppingScreen from './src/screens/ShoppingScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Prompt_500Medium,
    Prompt_600SemiBold,
    Prompt_700Bold,
    Sarabun_400Regular,
    Sarabun_700Bold,
  });
  const [addVisible, setAddVisible] = useState(false);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.chill} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.frost } }}
          tabBar={(props) => <TabBar {...props} onPressAdd={() => setAddVisible(true)} />}
        >
          <Tab.Screen name="Fridge" component={FridgeScreen} />
          <Tab.Screen name="Menu" component={MenuScreen} />
          <Tab.Screen name="Shopping" component={ShoppingScreen} />
          <Tab.Screen name="Health" component={HealthScreen} />
        </Tab.Navigator>
        <AddSheet visible={addVisible} onClose={() => setAddVisible(false)} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.frost,
  },
});
