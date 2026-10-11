import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { callRpc } from '../lib/supabase';
import { useNearly } from '../context/NearlyContext';
import { Button, Heading, Page } from '../components';
import { theme } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export function ConversationScreen({ route, navigation }: Props) {
  const { snapshot, perform } = useNearly();
  const [text, setText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const scroll = useRef<ScrollView>(null);
  const conversation = snapshot?.conversations.find(item => item.id === route.params.conversationId);
  const personId = conversation?.members.find(id => id !== snapshot?.active);
  const person = snapshot?.profiles.find(profile => profile.id === personId);

  useEffect(() => {
    if (conversation) void perform(() => callRpc('read_messages', { conversation: conversation.id }));
  }, [conversation?.id]);

  const send = async () => {
    if (!conversation || !text.trim()) return;
    const body = text.trim();
    const sent = await perform(async () => {
      await callRpc('send_message', { conversation: conversation.id, body, request: Crypto.randomUUID() });
      await Haptics.selectionAsync();
    });
    if (sent) setText('');
  };

  const block = () => {
    if (!personId) return;
    Alert.alert('Bloquer ce profil ?', 'Cette personne ne pourra plus vous contacter; la conversation sera fermée.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Bloquer', style: 'destructive', onPress: () => {
        void perform(() => callRpc('set_block', { target: personId, enabled: true })).then(done => {
          if (done) navigation.goBack();
        });
      } },
    ]);
  };

  const report = async () => {
    if (!personId || !reportReason.trim()) return;
    const submitted = await perform(() => callRpc('report_profile', { target: personId, reason: reportReason.trim() }));
    if (submitted) {
      setReportOpen(false);
      setReportReason('');
      Alert.alert('Signalement transmis', 'Merci. Votre signalement a été enregistré de manière confidentielle.');
    }
  };

  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
    <Page scroll={false}>
      <Button title="‹  Messages" onPress={() => navigation.goBack()} secondary />
      <Heading eyebrow="VOTRE MATCH" title={person?.name ?? 'Conversation'}>Une conversation privée après un match réciproque.</Heading>
      {personId ? <View style={styles.trustActions}>
        <Button title="Signaler" onPress={() => setReportOpen(true)} secondary />
        <Button title="Bloquer" onPress={block} secondary />
      </View> : null}
      {conversation ? <ScrollView ref={scroll} style={styles.messages} contentContainerStyle={styles.messageList}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
        {conversation.messages.map(message => <View key={message.id} style={[styles.bubble, message.from === snapshot?.active ? styles.mine : styles.theirs]}>
          <Text style={styles.messageText}>{message.text}</Text>
          <Text style={styles.time}>{new Date(message.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>)}
      </ScrollView> : <Text style={styles.missing}>Cette conversation n’est plus disponible.</Text>}
      {conversation ? <View style={styles.composer}>
        <TextInput accessibilityLabel="Votre message" value={text} onChangeText={setText} placeholder="Un premier mot…" placeholderTextColor={theme.colors.muted}
          maxLength={2000} multiline style={styles.input} />
        <Button title="Envoyer" onPress={() => void send()} disabled={!text.trim()} />
      </View> : null}
    </Page>
    <Modal visible={reportOpen} transparent animationType="fade" onRequestClose={() => setReportOpen(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Signaler ce profil</Text>
          <Text style={styles.reportHelp}>Décrivez le problème (500 caractères maximum). Le signalement est privé.</Text>
          <TextInput accessibilityLabel="Motif du signalement" value={reportReason} onChangeText={setReportReason}
            maxLength={500} multiline placeholder="Votre signalement…" placeholderTextColor={theme.colors.muted} style={styles.reportInput} />
          <Button title="Envoyer le signalement" onPress={() => void report()} disabled={!reportReason.trim()} />
          <Button title="Annuler" onPress={() => setReportOpen(false)} secondary />
        </View>
      </View>
    </Modal>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.night },
  messages: { flex: 1 },
  messageList: { gap: 10, paddingVertical: 8 },
  bubble: { maxWidth: '84%', borderRadius: 18, padding: 12, gap: 5 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#743B61' },
  theirs: { alignSelf: 'flex-start', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line },
  messageText: { color: theme.colors.pearl, fontSize: 15, lineHeight: 21 },
  time: { color: theme.colors.muted, fontSize: 10, alignSelf: 'flex-end' },
  missing: { color: theme.colors.muted },
  composer: { gap: 10 },
  input: { minHeight: 52, maxHeight: 120, borderRadius: 15, borderColor: theme.colors.line, borderWidth: 1, color: theme.colors.pearl, padding: 13, backgroundColor: '#2A1A2F', fontSize: 15 },
  trustActions: { flexDirection: 'row', gap: 10 },
  modalBackdrop: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', padding: 22 },
  reportCard: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line, borderWidth: 1, borderRadius: 22, padding: 20, gap: 14 },
  reportTitle: { color: theme.colors.pearl, fontSize: 19, fontWeight: '700' },
  reportHelp: { color: theme.colors.muted, lineHeight: 20 },
  reportInput: { minHeight: 110, maxHeight: 180, borderRadius: 15, borderColor: theme.colors.line, borderWidth: 1, color: theme.colors.pearl, padding: 13, backgroundColor: '#2A1A2F', fontSize: 15, textAlignVertical: 'top' },
});
