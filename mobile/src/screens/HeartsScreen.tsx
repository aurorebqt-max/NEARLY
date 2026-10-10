import { StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNearly } from '../context/NearlyContext';
import { callRpc } from '../lib/supabase';
import { Button, Card, Empty, Heading, Page } from '../components';
import { theme } from '../theme';

export function HeartsScreen() {
  const { snapshot, perform } = useNearly();
  const received = snapshot?.hearts.filter(heart => heart.to === snapshot.active) ?? [];
  const profileById = new Map(snapshot?.profiles.map(profile => [profile.id, profile]) ?? []);

  return <Page>
    <Heading eyebrow="UN GESTE VOLONTAIRE" title="Vos cœurs">Chaque cœur est un choix. Un match réciproque ouvre une conversation.</Heading>
    {!received.length ? <Empty title="Les cœurs viendront">Les cœurs reçus s’afficheront ici, en toute discrétion.</Empty> : received.map(heart => {
      const person = profileById.get(heart.from);
      return <Card key={heart.id}>
        <Text style={styles.heart}>♥</Text>
        <Text style={styles.person}>{person?.name ?? 'Un cœur reçu'}</Text>
        <Text style={styles.body}>{person?.intention ?? 'Votre prochaine rencontre Nearly.'}</Text>
        {!heart.read ? <Button title="Découvrir" secondary onPress={() => void perform(() => callRpc('read_heart', { heart_id: heart.id }))} /> : null}
        <Button title="Renvoyer un cœur" onPress={() => void perform(async () => {
          await callRpc('send_heart', { recipient: heart.from });
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        })} />
      </Card>;
    })}
  </Page>;
}

const styles = StyleSheet.create({
  heart: { color: theme.colors.rose, fontSize: 30 },
  person: { color: theme.colors.pearl, fontSize: 20, fontWeight: '700' },
  body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
});
