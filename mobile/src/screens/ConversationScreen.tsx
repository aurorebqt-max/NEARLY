import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
    <Page scroll={false}>
      <Button title="‹  Messages" onPress={() => navigation.goBack()} secondary />
      <Heading eyebrow="VOTRE MATCH" title={person?.name ?? 'Conversation'}>Une conversation privée après un match réciproque.</Heading>
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
});
