import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigation } from '../navigation/RootNavigator';
import { useNearly } from '../context/NearlyContext';
import { disablePushNotifications, enablePushNotifications, pushNotificationsEnabled, readNotificationPermission } from '../services/pushNotifications';
import { Button, Card, Heading, Page } from '../components';
import { theme } from '../theme';

export function PushSetupScreen() {
  const navigation = useNavigation<RootStackNavigation>();
  const { perform } = useNearly();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    void pushNotificationsEnabled().then(value => {
      if (active) setEnabled(value);
    }).catch(cause => {
      Alert.alert('État des notifications indisponible', cause instanceof Error ? cause.message : 'Impossible de lire les autorisations.');
    });
    return () => { active = false; };
  }, []);

  const request = () => Alert.alert(
    'Recevoir les nouvelles Nearly',
    'Nous vous avertirons discrètement des nouveaux cœurs, matchs et messages. Aucun extrait de conversation ni localisation ne sera affiché.',
    [
      { text: 'Plus tard', style: 'cancel' },
      {
        text: 'Continuer',
        onPress: () => void (async () => {
          try {
            await enablePushNotifications();
            setEnabled(true);
            Alert.alert('Notifications activées', 'Vous recevrez les alertes Nearly sur cet appareil.');
          } catch (cause) {
            const message = cause instanceof Error ? cause.message : 'Impossible d’activer les notifications.';
            Alert.alert('Notifications non activées', message, [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Réglages', onPress: () => { void Linking.openSettings(); } },
            ]);
          }
        })(),
      },
    ],
  );

  const disable = async () => {
    try {
      const { granted, canAskAgain } = await readNotificationPermission();
      const ok = await perform(disablePushNotifications);
      if (ok) setEnabled(false);
      if (granted && !canAskAgain) {
        Alert.alert('Notifications retirées de Nearly', 'Pour arrêter aussi les alertes du système, désactivez les notifications Nearly dans les Réglages.', [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Réglages', onPress: () => { void Linking.openSettings(); } },
        ]);
      }
    } catch (cause) {
      Alert.alert('Notifications non modifiées', cause instanceof Error ? cause.message : 'Impossible de mettre à jour les notifications.');
    }
  };

  return <Page>
    <Heading eyebrow="À VOTRE RYTHME" title="Notifications">Un cœur, un match ou un nouveau message : c’est vous qui choisissez.</Heading>
    <Card>
      <Text style={styles.title}>Votre confidentialité d’abord</Text>
      <Text style={styles.body}>Les alertes restent générales : pas de nom, d’extrait de message, de proximité ou de position dans la notification.</Text>
      <Text style={styles.body}>La permission système sera demandée uniquement après votre accord ici. Les alertes push nécessitent un build de développement ou de production et un projet EAS configuré.</Text>
    </Card>
    {enabled
      ? <Button title="Désactiver les alertes sur cet appareil" onPress={() => void disable()} secondary />
      : <Button title="Autoriser les notifications" onPress={request} />}
    <Button title="Retour" onPress={() => navigation.goBack()} secondary />
  </Page>;
}

const styles = StyleSheet.create({
  title: { color: theme.colors.pearl, fontSize: 17, fontWeight: '700' },
  body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
});
