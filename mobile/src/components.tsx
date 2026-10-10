import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNearly, useOptionalBusy } from './context/NearlyContext';
import { theme } from './theme';

export function Page({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const { error } = useNearly();
  const content = <>
    {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
    {children}
  </>;
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    {scroll ? <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">{content}</ScrollView> : <View style={styles.page}>{content}</View>}
  </SafeAreaView>;
}

export function Heading({ eyebrow, title, children }: PropsWithChildren<{ eyebrow?: string; title: string }>) {
  return <View style={styles.heading}>
    {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    <Text style={styles.title}>{title}</Text>
    {children ? <Text style={styles.subtitle}>{children}</Text> : null}
  </View>;
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function Button({ title, onPress, disabled = false, secondary = false, icon }: {
  title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; icon?: ReactNode;
}) {
  const busy = useOptionalBusy();
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || busy}
    style={({ pressed }) => [styles.button, secondary && styles.secondaryButton, (disabled || busy) && styles.disabled, pressed && styles.pressed]}>
    {busy ? <ActivityIndicator color={theme.colors.pearl} /> : <>{icon}<Text style={styles.buttonText}>{title}</Text></>}
  </Pressable>;
}

export function Field({ label, value, onChangeText, multiline = false, placeholder, keyboardType, secureTextEntry = false }: {
  label: string; value: string; onChangeText: (text: string) => void; multiline?: boolean; placeholder?: string; keyboardType?: 'default' | 'email-address' | 'number-pad'; secureTextEntry?: boolean;
}) {
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder}
      placeholderTextColor={theme.colors.muted} keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : undefined}
      secureTextEntry={secureTextEntry} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.input, multiline && styles.multiline]} />
  </View>;
}

export function Empty({ title, children }: PropsWithChildren<{ title: string }>) {
  return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.body}>{children}</Text></View>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <Text style={styles.errorText}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.night },
  page: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 16, paddingBottom: 28, gap: 18 },
  heading: { gap: 8, marginBottom: 4 },
  eyebrow: { color: theme.colors.blush, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  title: { color: theme.colors.pearl, fontSize: 30, lineHeight: 36, fontWeight: '700' },
  subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderWidth: 1, borderRadius: 22, padding: 18, gap: 12 },
  body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  button: { minHeight: 50, borderRadius: 16, backgroundColor: theme.colors.rose, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  secondaryButton: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line },
  buttonText: { color: theme.colors.pearl, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  field: { gap: 7 },
  fieldLabel: { color: theme.colors.blush, fontSize: 13, fontWeight: '600' },
  input: { minHeight: 50, borderColor: theme.colors.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, color: theme.colors.pearl, backgroundColor: '#2A1A2F', fontSize: 15 },
  multiline: { minHeight: 100, paddingTop: 12 },
  empty: { borderRadius: 20, borderWidth: 1, borderColor: theme.colors.line, padding: 20, gap: 8, backgroundColor: theme.colors.surface },
  emptyTitle: { color: theme.colors.pearl, fontWeight: '700', fontSize: 18 },
  error: { padding: 12, borderRadius: 12, backgroundColor: '#512D3C', borderColor: '#98506B', borderWidth: 1 },
  errorText: { color: theme.colors.danger, fontSize: 13, lineHeight: 19 },
});
