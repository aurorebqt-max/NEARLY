import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { createNavigationContainerRef, type NavigatorScreenParams } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { EncountersScreen } from '../screens/EncountersScreen';
import { HeartsScreen } from '../screens/HeartsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { PushSetupScreen } from '../screens/PushSetupScreen';
import { useNearly } from '../context/NearlyContext';
import { theme } from '../theme';

export type TabParamList = {
  Accueil: undefined;
  Rencontres: undefined;
  'Cœurs': undefined;
  Messages: undefined;
  Profil: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Conversation: { conversationId: string };
  PushSetup: undefined;
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingNotification: Record<string, unknown> | null = null;

export function routeNotification(data: Record<string, unknown>) {
  if (!navigationRef.isReady()) {
    pendingNotification = data;
    return;
  }
  const conversationId = typeof data.conversationId === 'string' ? data.conversationId : null;
  switch (data.kind) {
    case 'heart':
      navigationRef.navigate('Tabs', { screen: 'Cœurs' });
      break;
    case 'suggestion':
      navigationRef.navigate('Tabs', { screen: 'Rencontres' });
      break;
    case 'match':
      if (conversationId) navigationRef.navigate('Conversation', { conversationId });
      else navigationRef.navigate('Tabs', { screen: 'Messages' });
      break;
    case 'message':
      if (conversationId) navigationRef.navigate('Conversation', { conversationId });
      else navigationRef.navigate('Tabs', { screen: 'Messages' });
      break;
  }
}

export function flushPendingNotification() {
  if (!pendingNotification) return;
  const data = pendingNotification;
  pendingNotification = null;
  routeNotification(data);
}

const Tabs = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const tabIcons: Record<keyof TabParamList, string> = {
  Accueil: '⌂',
  Rencontres: '◉',
  'Cœurs': '♥',
  Messages: '✉',
  Profil: '♡',
};

function TabNavigator({ onSignOut, onOpenPushSetup }: { onSignOut: () => Promise<void>; onOpenPushSetup: () => void }) {
  const { snapshot } = useNearly();
  const unreadHearts = snapshot?.hearts.filter(heart => heart.to === snapshot.active && !heart.read).length ?? 0;
  const unreadMessages = snapshot?.conversations.reduce((count, conversation) =>
    count + conversation.messages.filter(message => message.from !== snapshot.active && !message.read).length, 0) ?? 0;
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: theme.colors.blush,
    tabBarInactiveTintColor: theme.colors.muted,
    tabBarStyle: { backgroundColor: '#29192E', borderTopColor: theme.colors.line, paddingTop: 5, paddingBottom: 5 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
    tabBarBadgeStyle: { backgroundColor: theme.colors.rose, color: theme.colors.pearl, fontSize: 9 },
    tabBarIcon: ({ color, focused }) => <Text style={{ color, fontSize: focused ? 23 : 21, lineHeight: 26 }}>{tabIcons[route.name]}</Text>,
  })}>
    <Tabs.Screen name="Accueil" component={HomeScreen} />
    <Tabs.Screen name="Rencontres" component={EncountersScreen} />
    <Tabs.Screen name="Cœurs" component={HeartsScreen} options={{ tabBarBadge: unreadHearts || undefined }} />
    <Tabs.Screen name="Messages" component={MessagesScreen} options={{ tabBarBadge: unreadMessages || undefined }} />
    <Tabs.Screen name="Profil">{() => <ProfileScreen onSignOut={onSignOut} onOpenPushSetup={onOpenPushSetup} />}</Tabs.Screen>
  </Tabs.Navigator>;
}

export function RootNavigator({ onSignOut }: { onSignOut: () => Promise<void> }) {
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.night }, animation: 'slide_from_right' }}>
    <Stack.Screen name="Tabs">{({ navigation }) =>
      <TabNavigator onSignOut={onSignOut} onOpenPushSetup={() => navigation.navigate('PushSetup')} />
    }</Stack.Screen>
    <Stack.Screen name="Conversation" component={ConversationScreen} />
    <Stack.Screen name="PushSetup" component={PushSetupScreen} options={{ presentation: 'modal' }} />
  </Stack.Navigator>;
}
