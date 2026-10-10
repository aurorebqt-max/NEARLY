import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Button, Card, ErrorText, Field, Heading, Page } from '../components';
import { theme } from '../theme';

export function AuthScreen({ authError }: { authError: string | null }) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      if (signup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: Linking.createURL('auth/callback') },
        });
        if (signUpError) throw signUpError;
        setNotice(data.session ? 'Compte créé. Bienvenue sur Nearly.' : 'Consultez votre e-mail pour confirmer votre compte, puis revenez vous connecter.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Connexion impossible.');
    } finally {
      setBusy(false);
    }
  };

  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Page>
      <View style={styles.brand}><Text style={styles.heart}>♥</Text><Text style={styles.wordmark}>nearly</Text></View>
      <Heading eyebrow="ROMANTIC TECH · UN PEU PLUS PRÈS" title={signup ? 'Un nouveau chapitre.' : 'Un cœur peut tout changer.'}>
        {signup ? 'Créez votre compte Nearly en toute simplicité.' : 'Connectez-vous pour retrouver votre espace.'}
      </Heading>
      {!supabaseConfigured ? <Card>
        <Text style={styles.cardTitle}>Configuration nécessaire</Text>
        <Text style={styles.body}>Copiez `mobile/.env.example` vers `mobile/.env` et renseignez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY. Utilisez uniquement une clé publique, jamais service_role ou une clé secrète.</Text>
      </Card> : <>
        <Field label="Adresse e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="vous@exemple.fr" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="8 caractères minimum" secureTextEntry />
        {error || authError ? <ErrorText>{error ?? authError}</ErrorText> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <View style={styles.actions}>
          <Button title={busy ? 'Connexion…' : signup ? 'Créer mon compte' : 'Se connecter'} onPress={() => void submit()} disabled={busy || !email.trim() || password.length < 8} />
          <Button title={signup ? 'J’ai déjà un compte' : 'Créer un compte'} onPress={() => { setSignup(!signup); setError(null); setNotice(''); }} secondary disabled={busy} />
        </View>
      </>}
      <Text style={styles.footer}>Vos données sont protégées par les règles d’accès Supabase de Nearly.</Text>
    </Page>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.night },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  heart: { color: theme.colors.rose, fontSize: 35 },
  wordmark: { color: theme.colors.pearl, fontSize: 28, fontWeight: '700', letterSpacing: 1 },
  cardTitle: { color: theme.colors.pearl, fontWeight: '700', fontSize: 17 },
  body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  actions: { gap: 10 },
  notice: { color: theme.colors.success, fontSize: 14, lineHeight: 20 },
  footer: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 12 },
});
