import { StyleSheet, Text } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNearly } from '../context/NearlyContext';
import type { RootStackParamList, TabParamList } from '../navigation/RootNavigator';
import { Button, Card, Empty, Heading, Page } from '../components';
import { theme } from '../theme';

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Messages'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function MessagesScreen({ navigation }: { navigation: Navigation }) {
  const { snapshot } = useNearly();
  const conversations = snapshot?.conversations ?? [];
  const people = new Map(snapshot?.profiles.map(person => [person.id, person]) ?? []);
  return <Page>
    <Heading eyebrow="APRÈS UN MATCH" title="Messages">Un espace de conversation, privé et réservé à vos matchs.</Heading>
    {!conversations.length ? <Empty title="Les mots viendront">Vos conversations apparaîtront après un cœur réciproque.</Empty> : conversations.map(conversation => {
      const otherId = conversation.members.find(id => id !== snapshot?.active);
      const person = otherId ? people.get(otherId) : undefined;
      const latest = conversation.messages.at(-1);
      return <Card key={conversation.id}>
        <Text style={styles.person}>{person?.name ?? 'Votre match'}</Text>
        <Text style={styles.preview}>{latest?.text ?? 'Commencez la conversation.'}</Text>
        {latest && !latest.read && latest.from !== snapshot?.active ? <Text style={styles.unread}>Nouveau message</Text> : null}
        <Button title="Ouvrir la conversation" onPress={() => navigation.navigate('Conversation', { conversationId: conversation.id })} />
      </Card>;
    })}
  </Page>;
}

const styles = StyleSheet.create({
  person: { color: theme.colors.pearl, fontSize: 19, fontWeight: '700' },
  preview: { color: theme.colors.muted, fontSize: 14, lineHeight: 20 },
  unread: { color: theme.colors.blush, fontWeight: '600', fontSize: 12 },
});
