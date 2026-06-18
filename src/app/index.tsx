import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppShell } from '@/components/app-shell';
import { ApiError } from '@/lib/api';
import { useSession } from '@/lib/session-context';

const SAVED_EMAIL_KEY = '@VetorAtendimento:email';
const SAVED_PASSWORD_KEY = '@VetorAtendimento:password';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { isRestoring, session, signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isWide = width >= 768;

  useEffect(() => {
    async function loadCredentials() {
      try {
        const [savedEmail, savedPassword] = await Promise.all([
          SecureStore.getItemAsync(SAVED_EMAIL_KEY),
          SecureStore.getItemAsync(SAVED_PASSWORD_KEY),
        ]);

        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberPassword(true);
        }
      } catch {
        // O login continua disponível mesmo quando o armazenamento seguro falha.
      }
    }

    loadCredentials();
  }, []);

  useEffect(() => {
    if (!isRestoring && session) {
      router.replace('/home');
    }
  }, [isRestoring, session]);

  async function handleLogin() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setMessage('Informe e-mail e senha.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await signIn(normalizedEmail, password);

      try {
        if (rememberPassword) {
          await Promise.all([
            SecureStore.setItemAsync(SAVED_EMAIL_KEY, normalizedEmail),
            SecureStore.setItemAsync(SAVED_PASSWORD_KEY, password),
          ]);
        } else {
          await Promise.all([
            SecureStore.deleteItemAsync(SAVED_EMAIL_KEY),
            SecureStore.deleteItemAsync(SAVED_PASSWORD_KEY),
          ]);
        }
      } catch {
        // Falhas no armazenamento local não invalidam uma autenticação concluída.
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'E-mail e/ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  if (isRestoring) {
    return (
      <View style={styles.restoring}>
        <ActivityIndicator color="#00b4ff" size="large" />
      </View>
    );
  }

  return (
    <AppShell centered avoidKeyboard>
      <View style={[styles.layout, isWide && styles.layoutWide]}>
        <View style={[styles.brandPanel, isWide && styles.panelWide]}>
          <View style={styles.logoCard}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.brandKicker}>Atendimento interno</Text>
          <Text style={styles.brandTitle}>VetorOS Atendimento</Text>
          <Text style={styles.brandText}>Cadastre clientes e consulte orçamentos com rapidez.</Text>
        </View>

        <View style={[styles.loginCard, isWide && styles.panelWide]}>
          <View>
            <Text style={styles.formTitle}>Acesso ao atendimento</Text>
            <Text style={styles.formDescription}>Informe suas credenciais para continuar.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="mail" size={21} color="#a8b3c7" />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#a8b3c7"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (message) setMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="lock" size={21} color="#a8b3c7" />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#a8b3c7"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (message) setMessage(null);
                }}
                secureTextEntry={!showPassword}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <Pressable
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onPress={() => setShowPassword((current) => !current)}
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={24} color="#a8b3c7" />
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberPassword }}
            onPress={() => setRememberPassword((current) => !current)}
            style={({ pressed }) => [styles.rememberRow, pressed && styles.pressed]}>
            <View style={[styles.checkbox, rememberPassword && styles.checkboxChecked]}>
              {rememberPassword ? <MaterialIcons name="check" size={16} color="#ffffff" /> : null}
            </View>
            <Text style={styles.rememberText}>Lembrar senha</Text>
          </Pressable>

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <Pressable
            disabled={loading}
            onPress={handleLogin}
            style={({ pressed }) => [styles.loginButton, (pressed || loading) && styles.buttonDisabled]}>
            {loading ? <ActivityIndicator color="#0b1220" /> : <Text style={styles.loginButtonText}>Entrar</Text>}
          </Pressable>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  restoring: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1220',
  },
  layout: { width: '100%', gap: 18 },
  layoutWide: { flexDirection: 'row', alignItems: 'stretch' },
  panelWide: { flex: 1 },
  brandPanel: {
    justifyContent: 'center',
    borderRadius: 8,
    padding: 24,
    backgroundColor: '#15365f',
  },
  logoCard: {
    width: 84,
    height: 84,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  logo: { width: 62, height: 62 },
  brandKicker: {
    marginTop: 22,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  brandTitle: {
    marginTop: 4,
    color: '#ffffff',
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '900',
  },
  brandText: {
    marginTop: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  loginCard: {
    width: '100%',
    justifyContent: 'center',
    gap: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 244, 239, 0.12)',
    backgroundColor: '#101a2d',
    padding: 18,
  },
  formTitle: { color: '#f5f4ef', fontSize: 22, lineHeight: 28, fontWeight: '900' },
  formDescription: { marginTop: 4, color: '#a8b3c7', fontSize: 14, lineHeight: 20 },
  field: { gap: 6 },
  label: { color: '#a8b3c7', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  inputWrap: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 244, 239, 0.12)',
    backgroundColor: '#18243a',
    paddingHorizontal: 16,
  },
  input: { flex: 1, height: 58, paddingLeft: 12, color: '#f5f4ef', fontSize: 16 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 244, 239, 0.12)',
  },
  checkboxChecked: { borderColor: '#00b4ff', backgroundColor: '#00b4ff' },
  rememberText: { color: '#f5f4ef', fontSize: 14 },
  error: { color: '#f97066', fontSize: 14, textAlign: 'center' },
  loginButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#00b4ff',
  },
  loginButtonText: { color: '#0b1220', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.72 },
  buttonDisabled: { opacity: 0.55 },
});
