import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cardShadow, colors, fonts } from '../theme';

interface Props extends BottomTabBarProps {
  onPressAdd: () => void;
}

const TAB_META: Record<string, { emoji: string; label: string }> = {
  Fridge: { emoji: '🧊', label: 'ตู้เย็น' },
  Menu: { emoji: '🍳', label: 'เมนู' },
  Shopping: { emoji: '🛒', label: 'ซื้อของ' },
  Health: { emoji: '💚', label: 'สุขภาพ' },
};

// Tab bar 4 แท็บ + FAB ＋ ตรงกลาง ตาม PRD ข้อ 6
export default function TabBar({ state, navigation, onPressAdd }: Props) {
  const insets = useSafeAreaInsets();

  const renderTab = (routeName: string, index: number) => {
    const meta = TAB_META[routeName];
    const focused = state.index === index;
    return (
      <Pressable
        key={routeName}
        style={styles.tab}
        onPress={() => navigation.navigate(routeName)}
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
      >
        <Text style={[styles.tabEmoji, !focused && styles.tabEmojiDim]}>{meta.emoji}</Text>
        <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{meta.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.slice(0, 2).map((r, i) => renderTab(r.name, i))}
      <View style={styles.fabSlot}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={onPressAdd}
          accessibilityRole="button"
          accessibilityLabel="เพิ่มของเข้าตู้"
        >
          <Text style={styles.fabPlus}>＋</Text>
        </Pressable>
      </View>
      {state.routes.slice(2, 4).map((r, i) => renderTab(r.name, i + 2))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabEmojiDim: {
    opacity: 0.45,
  },
  tabLabel: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.muted,
  },
  tabLabelActive: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    ...cardShadow,
    shadowOpacity: 0.25,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  fabPlus: {
    color: colors.card,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: fonts.headingSemi,
  },
});
