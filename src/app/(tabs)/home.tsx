import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
<<<<<<< HEAD
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '@/components/app-shell';
import { Card, TextMuted, Title } from '@/components/ui-kit';
=======
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppShell } from '@/components/app-shell';
import { Card, TextMuted } from '@/components/ui-kit';
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/lib/session-context';

export default function AtendimentoScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
<<<<<<< HEAD
  const { baseUrl, session } = useSession();
=======
  const { baseUrl, session, signOut } = useSession();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut();
    setLoading(false);
  }
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405

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
<<<<<<< HEAD
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
=======
        <View style={styles.actions}>
          <QuickAction
            icon="person-add"
            label="Cadastrar cliente"
            description="Novo cadastro para atendimento"
            onPress={() => router.push('/clientes')}
            backgroundColor={colors.tint}
            iconColor="#ffffff"
            textColor="#ffffff"
          />
          <QuickAction
            icon="request-quote"
            label="Ver orçamentos"
            description="Consultar valores e compartilhar"
            onPress={() => router.push('/orcamentos')}
            backgroundColor={colors.tint}
            iconColor="#ffffff"
            textColor="#ffffff"
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
          />
        </View>
      </Card>
    </AppShell>
  );
}

function QuickAction({
  icon,
  label,
  description,
  onPress,
  backgroundColor,
  borderColor,
  iconColor,
  textColor,
  mutedTextColor = 'rgba(255, 255, 255, 0.78)',
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor?: string;
  iconColor: string;
  textColor: string;
  mutedTextColor?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor,
          borderColor: borderColor ?? backgroundColor,
          opacity: pressed ? 0.76 : 1,
        },
      ]}>
      <View style={[styles.quickIcon, { backgroundColor: iconColor === '#ffffff' ? 'rgba(255, 255, 255, 0.18)' : '#ffffff' }]}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.quickText}>
        <Text style={[styles.quickLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.quickDescription, { color: mutedTextColor }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={mutedTextColor} />
    </Pressable>
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
<<<<<<< HEAD
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15365f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
=======
    width: 54,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
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
    gap: 12,
  },
<<<<<<< HEAD
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
=======
  quickAction: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quickIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  quickText: {
    flex: 1,
    minWidth: 0,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  quickDescription: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
>>>>>>> 7652f985c11ce24c5bbddc303e077d27831a7405
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
