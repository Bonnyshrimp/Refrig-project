import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cardShadow, colors, fonts, radius } from '../theme';

interface Props {
  emoji: string;
  title: string;
  lines: string[];
}

// การ์ดบอกว่าหน้านี้จะมีอะไร — ใช้ชั่วคราวระหว่างยังไม่ได้ทำฟีเจอร์จริง
export default function PlaceholderCard({ emoji, title, lines }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {lines.map((line) => (
        <Text key={line} style={styles.line}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    ...cardShadow,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.headingSemi,
    fontSize: 17,
    color: colors.ink,
    marginBottom: 8,
  },
  line: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
    lineHeight: 24,
  },
});
