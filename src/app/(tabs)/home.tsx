import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { Card, TextMuted, Title } from '@/components/ui-kit';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/lib/session-context';

export default function AtendimentoScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const { baseUrl, session } = useSession();

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
        <View style={styles.actions}>
          <ActionButton
            icon="person-add"
            title="Cadastrar cliente"
            description="Adicione um novo cliente"
            backgroundColor={colors.tint}
            textColor={colors.tintText}
            onPress={() => router.push('/clientes')}
          />
          <ActionButton
            icon="description"
            title="Ver orçamentos"
            description="Consulte valores e serviços"
            backgroundColor={colors.tint}
            textColor={colors.tintText}
            onPress={() => router.push('/orcamentos')}
          />
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15365f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    gap: 12,
  },
  actionButton: {
    minHeight: 72,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 18, 32, 0.12)',
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  actionDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.72,
  },
});

function ActionButton({
  icon,
  title,
  description,
  backgroundColor,
  textColor,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor, opacity: pressed ? 0.78 : 1 },
      ]}>
      <View style={styles.actionIcon}>
        <MaterialIcons name={icon} size={24} color={textColor} />
      </View>
      <View style={styles.actionText}>
        <Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.actionDescription, { color: textColor }]}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={textColor} />
    </Pressable>
  );
}

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
