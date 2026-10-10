import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNearly } from '../context/NearlyContext';
import type { TabParamList } from '../navigation/RootNavigator';
import { Button, Card, Empty, Heading, Page } from '../components';
import { theme } from '../theme';

export function HomeScreen({ navigation }: { navigation: BottomTabNavigationProp<TabParamList, 'Accueil'> }) {
  const { snapshot, loading, reload } = useNearly();
  const user = snapshot?.profiles.find(profile => profile.id === snapshot.active);
  const unread = snapshot?.hearts.filter(heart => heart.to === snapshot.active && !heart.read).length ?? 0;

  return <Page>
    <Heading eyebrow="UN PEU PLUS PRÈS" title={user?.name ? `Bonjour ${user.name}.` : 'Un cœur peut tout changer.'}>
      Une rencontre commence par un choix.
    </Heading>
    <View style={styles.hero}>
      <View style={styles.heartHalo}><Text accessibilityLabel={`${unread} cœurs non lus`} style={styles.heart}>♥</Text></View>
      <Text style={styles.count}>{unread}</Text>
      <Text style={styles.countLabel}>cœurs non lus</Text>
    </View>
    <Button title="Découvrir mes cœurs" onPress={() => navigation.navigate('Cœurs')} />
    <Card>
      <Text style={styles.cardTitle}>{user?.invisible ? 'Mode invisible' : user?.radar ? 'Radar de démonstration activé' : 'Radar désactivé'}</Text>
      <Text style={styles.body}>La proximité Bluetooth n’est pas disponible dans cette version mobile.</Text>
    </Card>
    {!loading && !user?.onboarded ? <Empty title="Votre profil vous attend">Complétez les informations et ajoutez au moins un portrait dans Profil pour activer les interactions.</Empty> : null}
    <Button title="Actualiser" onPress={() => void reload()} secondary />
  </Page>;
}

const styles = StyleSheet.create({
  hero: { minHeight: 250, justifyContent: 'center', alignItems: 'center', gap: 2 },
  heartHalo: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#49263F', borderWidth: 1, borderColor: '#75435E', alignItems: 'center', justifyContent: 'center' },
  heart: { color: theme.colors.rose, fontSize: 116, lineHeight: 135, textShadowColor: '#FF8ABB', textShadowRadius: 26 },
  count: { position: 'absolute', top: 48, right: '24%', minWidth: 40, height: 40, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden', borderRadius: 20, backgroundColor: theme.colors.pearl, color: theme.colors.night, fontSize: 18, fontWeight: '800' },
  countLabel: { color: theme.colors.blush, fontWeight: '600', marginTop: 8, fontSize: 14 },
  cardTitle: { color: theme.colors.pearl, fontSize: 16, fontWeight: '700' },
  body: { color: theme.colors.muted, lineHeight: 20, fontSize: 14 },
});
