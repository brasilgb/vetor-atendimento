import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { Button, Card, TextMuted, Title } from '@/components/ui-kit';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/lib/session-context';

export default function AtendimentoScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const { baseUrl, session, signOut } = useSession();
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
      <Card>
        <View style={styles.companyRow}>
          <View style={styles.companyLogoWrap}>
            <Image
              source={getCompanyLogoSource(session.company?.logo_url ?? session.company?.logo, baseUrl)}
              style={styles.companyLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.companyText}>
            <TextMuted>Empresa</TextMuted>
            <Text style={[styles.companyName, { color: colors.text }]}>
              {session.company?.name || 'VetorOS'}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Title>Atendimento interno</Title>
        <View style={styles.profileRow}>
          <View>
            <Text style={[styles.name, { color: colors.text }]}>{session.user.name}</Text>
            <TextMuted>{session.user.email}</TextMuted>
          </View>
        </View>
      </Card>

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
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  companyLogoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(245, 244, 239, 0.12)',
  },
  companyLogo: {
    width: 48,
    height: 48,
  },
  companyText: {
    flex: 1,
    minWidth: 0,
  },
  companyName: {
    marginTop: 4,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  profileRow: {
    gap: 12,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
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
