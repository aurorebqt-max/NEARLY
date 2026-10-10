import { StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNearly } from '../context/NearlyContext';
import { callRpc } from '../lib/supabase';
import { Button, Card, Empty, Heading, Page } from '../components';
import { theme } from '../theme';

export function EncountersScreen() {
  const { snapshot, perform } = useNearly();
  const me = snapshot?.active;
  const suggestions = snapshot?.suggestions.filter(item => item.to === me && !item.revoked && item.expires > Date.now()) ?? [];
  const profileById = new Map(snapshot?.profiles.map(profile => [profile.id, profile]) ?? []);

  return <Page>
    <Heading eyebrow="VOS CROISEMENTS" title="Rencontres">Une occasion à découvrir, sans géolocalisation ni détection réelle.</Heading>
    {!suggestions.length ? <Empty title="Pas encore de rencontre">Les suggestions autorisées apparaîtront ici. La proximité réelle n’est pas activée.</Empty> : suggestions.map(item => {
      const person = item.from ? profileById.get(item.from) : undefined;
      return <Card key={item.id}>
        <Text style={styles.person}>{person?.name ?? 'Une rencontre anonyme'}</Text>
        <Text style={styles.body}>{person ? `${person.age ?? ''} · ${person.intention}` : 'Découvrez le profil uniquement si vous le souhaitez.'}</Text>
        {!person ? <Button title="Découvrir ce profil" onPress={() => void perform(() => callRpc('reveal_encounter', { encounter_id: item.id }))} /> :
          <Button title="Envoyer un cœur" onPress={() => void perform(async () => {
            await callRpc('send_heart', { recipient: item.from });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          })} />}
      </Card>;
    })}
  </Page>;
}

const styles = StyleSheet.create({
  person: { color: theme.colors.pearl, fontSize: 20, fontWeight: '700' },
  body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
});
