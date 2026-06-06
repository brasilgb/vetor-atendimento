import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppShell } from '@/components/app-shell';
import { Button, Card, TextMuted, Title } from '@/components/ui-kit';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/lib/session-context';

export default function AtendimentoScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const { baseUrl, session, signOut } = useSession();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut();
    setLoading(false);
  }

  if (!session) {
    return (
      <AppShell>
        <TextMuted>Entre no app para acessar o atendimento.</TextMuted>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <View style={[styles.workspaceHeader, { backgroundColor: colors.accent, paddingTop: Math.max(18, insets.top + 12) }]}>
        <View style={styles.headerActions}>
          <View style={styles.headerUserIcon}>
            <MaterialIcons name="account-circle" size={24} color="#ffffff" />
          </View>
          <Pressable
            onPress={handleLogout}
            disabled={loading}
            style={({ pressed }) => [styles.headerIconButton, { opacity: loading ? 0.58 : pressed ? 0.72 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Sair">
            <MaterialIcons name="logout" size={21} color="#ffffff" />
          </Pressable>
        </View>
        <View style={styles.companyRow}>
          <View style={styles.companyLogoWrap}>
            <Image
              source={getCompanyLogoSource(session.company?.logo_url ?? session.company?.logo, baseUrl)}
              style={styles.companyLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.companyText}>
            <Text style={styles.eyebrow}>Atendimento interno</Text>
            <Text style={styles.companyName} numberOfLines={2}>
              {session.company?.name || 'VetorOS'}
            </Text>
            <Text style={styles.operatorName}>{session.user.name}</Text>
          </View>
        </View>
      </View>

      <Card>
        <Title>Ações rápidas</Title>
        <View style={styles.actions}>
          <Button onPress={() => router.push('/clientes')}>Cadastrar cliente</Button>
          <Button onPress={() => router.push('/orcamentos')} variant="secondary">
            Ver orçamentos
          </Button>
          <Button onPress={handleLogout} loading={loading} variant="secondary">
            Sair
          </Button>
        </View>
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  workspaceHeader: {
    marginHorizontal: -16,
    marginTop: -18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    gap: 20,
    overflow: 'hidden',
  },
  headerActions: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerUserIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  companyLogoWrap: {
    width: 54,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  companyLogo: {
    width: 40,
    height: 40,
  },
  companyText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  companyName: {
    marginTop: 2,
    color: '#ffffff',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
  },
  operatorName: {
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actions: {
    gap: 10,
  },
});

function getCompanyLogoSource(logo: string | null | undefined, baseUrl: string) {
  if (!logo) {
    return require('@/assets/images/logo.png');
  }

  if (/^https?:\/\//i.test(logo)) {
    return { uri: logo };
  }

  const serverUrl = baseUrl.replace(/\/api\/?$/, '');
  const normalizedLogo = logo.replace(/^\/+/, '');
  const path = normalizedLogo.includes('/') ? normalizedLogo : `storage/logos/${normalizedLogo}`;

  return { uri: `${serverUrl}/${path}` };
}
