import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { EncountersScreen } from '../screens/EncountersScreen';
import { HeartsScreen } from '../screens/HeartsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ConversationScreen } from '../screens/ConversationScreen';
import { theme } from '../theme';

export type TabParamList = {
  Accueil: undefined;
  Rencontres: undefined;
  'Cœurs': undefined;
  Messages: undefined;
  Profil: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  Conversation: { conversationId: string };
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;

const Tabs = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const tabIcons: Record<keyof TabParamList, string> = {
  Accueil: '⌂',
  Rencontres: '◉',
  'Cœurs': '♥',
  Messages: '✉',
  Profil: '♡',
};

function TabNavigator({ onSignOut }: { onSignOut: () => Promise<void> }) {
  return <Tabs.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: theme.colors.blush,
    tabBarInactiveTintColor: theme.colors.muted,
    tabBarStyle: { backgroundColor: '#29192E', borderTopColor: theme.colors.line, paddingTop: 5, paddingBottom: 5 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
    tabBarIcon: ({ color, focused }) => <Text style={{ color, fontSize: focused ? 23 : 21, lineHeight: 26 }}>{tabIcons[route.name]}</Text>,
  })}>
    <Tabs.Screen name="Accueil" component={HomeScreen} />
    <Tabs.Screen name="Rencontres" component={EncountersScreen} />
    <Tabs.Screen name="Cœurs" component={HeartsScreen} />
    <Tabs.Screen name="Messages" component={MessagesScreen} />
    <Tabs.Screen name="Profil">{() => <ProfileScreen onSignOut={onSignOut} />}</Tabs.Screen>
  </Tabs.Navigator>;
}

export function RootNavigator({ onSignOut }: { onSignOut: () => Promise<void> }) {
  return <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.night }, animation: 'slide_from_right' }}>
    <Stack.Screen name="Tabs">{() => <TabNavigator onSignOut={onSignOut} />}</Stack.Screen>
    <Stack.Screen name="Conversation" component={ConversationScreen} />
  </Stack.Navigator>;
}
