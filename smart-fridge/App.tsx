import { Prompt_500Medium } from '@expo-google-fonts/prompt/500Medium';
import { Prompt_600SemiBold } from '@expo-google-fonts/prompt/600SemiBold';
import { Prompt_700Bold } from '@expo-google-fonts/prompt/700Bold';
import { Sarabun_400Regular } from '@expo-google-fonts/sarabun/400Regular';
import { Sarabun_700Bold } from '@expo-google-fonts/sarabun/700Bold';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AddSheet from './src/components/AddSheet';
import LeftoverFlow from './src/components/LeftoverFlow';
import TabBar from './src/components/TabBar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FridgeProvider, useFridge } from './src/context/FridgeContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { syncExpiryNotifications } from './src/lib/notifications';
import { isSupabaseConfigured } from './src/lib/supabase';
import AuthScreen from './src/screens/AuthScreen';
import FridgeScreen from './src/screens/FridgeScreen';
import HealthScreen from './src/screens/HealthScreen';
import MenuScreen from './src/screens/MenuScreen';
import ShoppingScreen from './src/screens/ShoppingScreen';
import { colors, fonts } from './src/theme';

const Tab = createBottomTabNavigator();

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

// แจ้งวิธีตั้งค่าเมื่อยังไม่ได้สร้างไฟล์ .env
function SetupNotice() {
  return (
    <Centered>
      <Text style={styles.setupEmoji}>🔧</Text>
      <Text style={styles.setupTitle}>ยังไม่ได้ตั้งค่า Supabase</Text>
      <Text style={styles.setupText}>
        สร้างไฟล์ .env ในโฟลเดอร์ smart-fridge{'\n'}
        (คัดลอกจาก .env.example) แล้วใส่{'\n'}
        EXPO_PUBLIC_SUPABASE_URL และ{'\n'}
        EXPO_PUBLIC_SUPABASE_ANON_KEY{'\n\n'}
        จากนั้นปิดแล้วรัน npx expo start ใหม่
      </Text>
    </Centered>
  );
}

// นัดแจ้งเตือนวันหมดอายุใหม่ทุกครั้งที่ของในตู้หรือการตั้งค่าเปลี่ยน
function NotificationSync() {
  const { items, loading } = useFridge();
  const { settings, loaded } = useSettings();

  useEffect(() => {
    if (loading || !loaded) return;
    syncExpiryNotifications(items, settings).catch(() => {});
  }, [items, settings, loading, loaded]);

  return null;
}

function MainTabs() {
  const [addVisible, setAddVisible] = useState(false);
  const [leftoverVisible, setLeftoverVisible] = useState(false);

  return (
    <FridgeProvider>
      <SettingsProvider>
        <NotificationSync />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.frost } }}
            tabBar={(props) => <TabBar {...props} onPressAdd={() => setAddVisible(true)} />}
          >
            <Tab.Screen name="Fridge" component={FridgeScreen} />
            <Tab.Screen name="Menu" component={MenuScreen} />
            <Tab.Screen name="Shopping" component={ShoppingScreen} />
            <Tab.Screen name="Health" component={HealthScreen} />
          </Tab.Navigator>
          <AddSheet
            visible={addVisible}
            onClose={() => setAddVisible(false)}
            onSelectLeftover={() => {
              setAddVisible(false);
              setLeftoverVisible(true);
            }}
          />
          <LeftoverFlow visible={leftoverVisible} onClose={() => setLeftoverVisible(false)} />
        </NavigationContainer>
      </SettingsProvider>
    </FridgeProvider>
  );
}

// เลือกหน้าตามสถานะ: ยังไม่ตั้งค่า → กำลังกู้ session → ล็อกอิน → แอปหลัก
function Root() {
  const { session, loading } = useAuth();

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" color={colors.chill} />
      </Centered>
    );
  }
  if (!session) return <AuthScreen />;
  return <MainTabs />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Prompt_500Medium,
    Prompt_600SemiBold,
    Prompt_700Bold,
    Sarabun_400Regular,
    Sarabun_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <Centered>
        <ActivityIndicator size="large" color={colors.chill} />
      </Centered>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.frost,
    padding: 24,
  },
  setupEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  setupTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 10,
  },
  setupText: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
