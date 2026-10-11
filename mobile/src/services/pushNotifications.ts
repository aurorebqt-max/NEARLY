import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { callRpc } from '../lib/supabase';

const INSTALLATION_KEY = 'nearly.push.installation';
const DISABLED_KEY = 'nearly.push.disabled';

async function installationId() {
  const previous = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (previous) return previous;
  const created = Crypto.randomUUID();
  await AsyncStorage.setItem(INSTALLATION_KEY, created);
  return created;
}

function easProjectId() {
  return Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
}

export async function readNotificationPermission() {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return { granted: status === 'granted', canAskAgain };
}

export async function pushNotificationsEnabled() {
  if (await AsyncStorage.getItem(DISABLED_KEY) === 'true') return false;
  return (await readNotificationPermission()).granted;
}

export async function enablePushNotifications() {
  if (!Device.isDevice) throw new Error('Les notifications push nécessitent un appareil physique.');
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error(permission.canAskAgain
      ? 'Autorisation refusée. Vous pourrez réessayer depuis Nearly.'
      : 'Autorisation refusée définitivement. Ouvrez les Réglages système pour autoriser les notifications.');
  }

  const projectId = easProjectId();
  if (!projectId) throw new Error('L’identifiant de projet EAS est absent. Configurez EXPO_PUBLIC_EAS_PROJECT_ID avant de demander un token push.');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('nearly', {
      name: 'Nearly',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      lightColor: '#D65B91',
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await savePushToken(token);
  return token;
}

export async function savePushToken(token: string) {
  await AsyncStorage.removeItem(DISABLED_KEY);
  await callRpc('register_push_token', {
    installation: await installationId(),
    push_token: token,
    device_platform: Platform.OS,
  });
}

export async function disablePushNotifications() {
  const installation = await installationId();
  await callRpc('unregister_push_device', { installation });
  await AsyncStorage.setItem(DISABLED_KEY, 'true');
}

class PushTokenLifecycle {
  private userId: string | null = null;
  private listener: Notifications.Subscription | null = null;

  start(userId: string) {
    this.stop();
    this.userId = userId;
    this.listener = Notifications.addPushTokenListener(() => {
      void this.refreshAfterRotation();
    });
    void this.refreshIfAlreadyAllowed();
  }

  stop() {
    this.listener?.remove();
    this.listener = null;
    this.userId = null;
  }

  private async refreshIfAlreadyAllowed() {
    if (!this.userId || !Device.isDevice) return;
    if (await AsyncStorage.getItem(DISABLED_KEY) === 'true') return;
    const permission = await readNotificationPermission();
    if (!permission.granted || !easProjectId()) return;
    await this.refreshAfterRotation();
  }

  private async refreshAfterRotation() {
    if (!this.userId || !Device.isDevice) return;
    try {
      const projectId = easProjectId();
      if (!projectId) return;
      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      await savePushToken(token);
    } catch (cause) {
      console.warn('Nearly push-token refresh failed:', cause);
    }
  }
}

export const pushTokenLifecycle = new PushTokenLifecycle();
