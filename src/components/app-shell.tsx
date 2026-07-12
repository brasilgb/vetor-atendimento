import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AppShell({ children, centered, avoidKeyboard }: PropsWithChildren<{ centered?: boolean; avoidKeyboard?: boolean }>) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

  const content = (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, centered && styles.centeredContent]}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );

  if (!avoidKeyboard) {
    return content;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={keyboardBehavior}>
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  centeredContent: {
    justifyContent: 'center',
  },
  inner: {
    gap: 18,
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
  },
});
