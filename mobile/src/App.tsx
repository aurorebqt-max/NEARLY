import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import type { EmailOtpType, Session } from '@supabase/supabase-js';
import { AuthScreen } from './screens/AuthScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NearlyProvider, useNearly } from './context/NearlyContext';
import { flushPendingNotification, navigationRef, routeNotification, RootNavigator } from './navigation/RootNavigator';
import { supabase, supabaseConfigured } from './lib/supabase';
import { pushTokenLifecycle } from './services/pushNotifications';
import { theme } from './theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function NearlyApp({ userId }: { userId: string }) {
  const { loading, snapshot, error } = useNearly();
  useEffect(() => {
    pushTokenLifecycle.start(userId);
    return () => pushTokenLifecycle.stop();
  }, [userId]);
  if (loading && !snapshot) return <View style={styles.loading}><ActivityIndicator color={theme.colors.blush} size="large" /><Text style={styles.loadingText}>Nearly se prépare…</Text></View>;
  if (!snapshot) return <View style={styles.loading}><Text style={styles.failure}>Impossible de charger votre espace.</Text>{error ? <Text style={styles.loadingText}>{error}</Text> : null}</View>;
  const profile = snapshot.profiles.find(item => item.id === snapshot.active);

  const signOut = async () => {
    const client = supabase;
    if (!client) throw new Error('Client Supabase indisponible.');
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) throw signOutError;
  };

  if (!profile?.onboarded) return <ProfileScreen onboarding onSignOut={signOut} />;

  const navigationTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: theme.colors.night, card: theme.colors.night, primary: theme.colors.rose, text: theme.colors.pearl, border: theme.colors.line, notification: theme.colors.blush },
  };
  return <NavigationContainer ref={navigationRef} theme={navigationTheme} onReady={flushPendingNotification}>
    <RootNavigator onSignOut={signOut} />
  </NavigationContainer>;
}

function AuthenticatedApp({ userId }: { userId: string }) {
  const [initialResponseHandled, setInitialResponseHandled] = useState(false);
  useEffect(() => {
    let active = true;
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      routeNotification(response.notification.request.content.data);
    });
    void Notifications.getLastNotificationResponseAsync().then(response => {
      if (active && response) routeNotification(response.notification.request.content.data);
      if (active) setInitialResponseHandled(true);
    }).catch(cause => {
      console.warn('Nearly notification response could not be restored:', cause);
      if (active) setInitialResponseHandled(true);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return initialResponseHandled ? <NearlyProvider key={userId} userId={userId}><NearlyApp userId={userId} /></NearlyProvider> : <View style={styles.loading}><ActivityIndicator color={theme.colors.blush} size="large" /></View>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setReady(true);
      return;
    }
    let mounted = true;
    const handleAuthUrl = async (url: string) => {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams;
      const code = params?.code;
      if (typeof code === 'string') {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error && mounted) setAuthError(error.message);
        return;
      }
      const tokenHash = params?.token_hash;
      const otpType = params?.type;
      const validOtpTypes: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];
      if (typeof tokenHash === 'string' && typeof otpType === 'string' && validOtpTypes.includes(otpType as EmailOtpType)) {
        const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: otpType as EmailOtpType });
        if (error && mounted) setAuthError(error.message);
      }
    };
    const urlSubscription = Linking.addEventListener('url', ({ url }) => { void handleAuthUrl(url); });
    void Linking.getInitialURL().then(url => { if (url) return handleAuthUrl(url); }).catch(cause => {
      if (mounted) setAuthError(cause instanceof Error ? cause.message : 'Lien de connexion invalide.');
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        setReady(true);
        if (nextSession) setAuthError(null);
      }
    });
    void client.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError(error.message);
      setSession(data.session);
      setReady(true);
    });
    return () => {
      mounted = false;
      urlSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  return <SafeAreaProvider>
    <StatusBar style="light" />
    {!ready ? <View style={styles.loading}><ActivityIndicator color={theme.colors.blush} size="large" /></View> :
      session ? <AuthenticatedApp key={session.user.id} userId={session.user.id} /> :
        <AuthScreen authError={supabaseConfigured ? authError : null} />}
  </SafeAreaProvider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: theme.colors.night, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { color: theme.colors.muted, textAlign: 'center' },
  failure: { color: theme.colors.pearl, fontWeight: '700', fontSize: 17 },
});
