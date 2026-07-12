import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  rightAction?: { label: string; onPress: () => void };
}

export default function ScreenHeader({ title, subtitle, rightAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {rightAction && (
          <Pressable onPress={rightAction.onPress} hitSlop={10}>
            <Text style={styles.rightAction}>{rightAction.label}</Text>
          </Pressable>
        )}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.ink,
  },
  rightAction: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    marginTop: 2,
  },
});
