import { PropsWithChildren } from 'react';
<<<<<<< HEAD
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
=======
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AppShell({ children, centered, avoidKeyboard }: PropsWithChildren<{ centered?: boolean; avoidKeyboard?: boolean }>) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

<<<<<<< HEAD
  const content = (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, centered && styles.centeredContent]}
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
=======
  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, centered && styles.centeredContent]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
  );

  if (!avoidKeyboard || Platform.OS !== 'ios') {
    return content;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding">
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
<<<<<<< HEAD
    paddingVertical: 18,
=======
    paddingTop: 18,
    paddingBottom: 18,
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
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
