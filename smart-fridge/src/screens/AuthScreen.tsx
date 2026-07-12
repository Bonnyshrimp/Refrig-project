import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { cardShadow, colors, fonts, radius } from '../theme';

type Mode = 'signin' | 'signup';

// แปลง error จาก Supabase เป็นภาษาไทยที่คนทั่วไปเข้าใจ
function thaiError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if (m.includes('already registered')) return 'อีเมลนี้สมัครไว้แล้ว ลองกด "เข้าสู่ระบบ" แทน';
  if (m.includes('at least 6 characters')) return 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร';
  if (m.includes('invalid email') || m.includes('validate email'))
    return 'รูปแบบอีเมลไม่ถูกต้อง';
  if (m.includes('email not confirmed'))
    return 'ยังไม่ได้ยืนยันอีเมล เปิดกล่องจดหมายแล้วกดลิงก์ยืนยันก่อนนะ';
  if (m.includes('network') || m.includes('fetch'))
    return 'เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ต หรือค่า .env ว่าใส่ URL/คีย์ถูกต้อง';
  return `เกิดข้อผิดพลาด: ${message}`;
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) setError(thaiError(err.message));
        // สำเร็จ: AuthProvider จับ session เปลี่ยนแล้วพาเข้าแอปเอง
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) {
          setError(thaiError(err.message));
        } else if (!data.session) {
          // โปรเจกต์เปิด "Confirm email" ไว้ — ต้องยืนยันอีเมลก่อน
          setNotice('สมัครสำเร็จ! เปิดอีเมลของคุณแล้วกดลิงก์ยืนยัน จากนั้นกลับมาเข้าสู่ระบบ');
          setMode('signin');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !busy;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🧊</Text>
          <Text style={styles.appName}>Smart Fridge</Text>
          <Text style={styles.tagline}>ลดอาหารทิ้ง กินอย่างปลอดภัย</Text>

          <View style={styles.card}>
            <View style={styles.tabRow}>
              {(
                [
                  { key: 'signin', label: 'เข้าสู่ระบบ' },
                  { key: 'signup', label: 'สมัครใหม่' },
                ] as const
              ).map((t) => (
                <Pressable
                  key={t.key}
                  style={[styles.modeTab, mode === t.key && styles.modeTabActive]}
                  onPress={() => {
                    setMode(t.key);
                    setError(null);
                    setNotice(null);
                  }}
                >
                  <Text style={[styles.modeText, mode === t.key && styles.modeTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoComplete={mode === 'signin' ? 'password' : 'new-password'}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={() => canSubmit && submit()}
            />

            {error && <Text style={styles.error}>⚠️ {error}</Text>}
            {notice && <Text style={styles.notice}>✉️ {notice}</Text>}

            <Pressable
              style={[styles.submit, !canSubmit && styles.submitDisabled]}
              onPress={submit}
              disabled={!canSubmit}
            >
              {busy ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'signin' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.frost,
  },
  flex: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 56,
    textAlign: 'center',
  },
  appName: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 20,
    ...cardShadow,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.frost,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: 18,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  modeTabActive: {
    backgroundColor: colors.ink,
  },
  modeText: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    color: colors.muted,
  },
  modeTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.card,
  },
  label: {
    fontFamily: fonts.headingMed,
    fontSize: 13.5,
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.frost,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: fonts.body,
    fontSize: 15.5,
    color: colors.ink,
    marginBottom: 14,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.red,
    backgroundColor: '#FBEAE7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    lineHeight: 19,
  },
  notice: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: '#1E6E4E',
    backgroundColor: '#E8F3EC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    lineHeight: 19,
  },
  submit: {
    backgroundColor: colors.green,
    borderRadius: radius.card,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    color: colors.card,
  },
});
