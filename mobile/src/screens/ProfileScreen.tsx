import { useEffect, useState } from 'react';
import { Alert, Image, Share, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import * as Linking from 'expo-linking';
import { useNearly } from '../context/NearlyContext';
import { callRpc, supabase } from '../lib/supabase';
import { Button, Card, Empty, Field, Heading, Page } from '../components';
import { theme } from '../theme';
import { demoConfig } from '../data/config';
import type { AttractionPreferences } from '../domain/models';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const csv = (values: string[]) => values.join(', ');
const parseCsv = (value: string) => [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))];

function isAdultBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const birth = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== value) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (today.getUTCMonth() < birth.getUTCMonth() ||
      (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 18 && age <= 120;
}

export function ProfileScreen({ onSignOut, onOpenPushSetup, onboarding = false }: {
  onSignOut: () => void; onOpenPushSetup?: () => void; onboarding?: boolean;
}) {
  const { snapshot, perform, reload, realtimeStatus } = useNearly();
  const profile = snapshot?.profiles.find(person => person.id === snapshot.active);
  const photoPaths = profile?.photos ?? [];
  const photoPathsKey = photoPaths.join('|');
  const preferences = snapshot?.preferences[snapshot?.active ?? ''];
  const [name, setName] = useState(profile?.name ?? '');
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [intention, setIntention] = useState(profile?.intention ?? '');
  const [gender, setGender] = useState(profile?.gender ?? '');
  const [ageMin, setAgeMin] = useState(String(preferences?.ageRange[0] ?? 18));
  const [ageMax, setAgeMax] = useState(String(preferences?.ageRange[1] ?? 99));
  const [interests, setInterests] = useState(csv(profile?.interests ?? []));
  const [personality, setPersonality] = useState(csv(profile?.personality ?? []));
  const [ownHair, setOwnHair] = useState(profile?.traits.hair ?? '');
  const [ownStyle, setOwnStyle] = useState(profile?.traits.style ?? '');
  const [ownHeight, setOwnHeight] = useState(profile?.traits.height ?? '');
  const [preferredGenders, setPreferredGenders] = useState(csv(preferences?.genders ?? []));
  const [preferredIntentions, setPreferredIntentions] = useState(csv(preferences?.intentions ?? []));
  const [preferredInterests, setPreferredInterests] = useState(csv(preferences?.interests.values ?? []));
  const [preferredPersonality, setPreferredPersonality] = useState(csv(preferences?.personality.values ?? []));
  const [preferredHair, setPreferredHair] = useState(preferences?.physical.traits.hair ?? '');
  const [preferredStyle, setPreferredStyle] = useState(preferences?.physical.traits.style ?? '');
  const [draftReady, setDraftReady] = useState(!onboarding);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<{ path: string; url: string }[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (!onboarding || !profile) return;
    let active = true;
    setDraftReady(false);
    void AsyncStorage.getItem(`nearly.onboarding.${profile.id}`).then(raw => {
      if (!active) return;
      if (raw) {
        const draft = JSON.parse(raw) as Record<string, unknown>;
        if (typeof draft.name === 'string') setName(draft.name);
        if (typeof draft.birthDate === 'string') setBirthDate(draft.birthDate);
        if (typeof draft.bio === 'string') setBio(draft.bio);
        if (typeof draft.intention === 'string') setIntention(draft.intention);
        if (typeof draft.gender === 'string') setGender(draft.gender);
        if (typeof draft.interests === 'string') setInterests(draft.interests);
        if (typeof draft.personality === 'string') setPersonality(draft.personality);
        if (typeof draft.ownHair === 'string') setOwnHair(draft.ownHair);
        if (typeof draft.ownStyle === 'string') setOwnStyle(draft.ownStyle);
        if (typeof draft.ownHeight === 'string') setOwnHeight(draft.ownHeight);
        if (typeof draft.ageMin === 'string') setAgeMin(draft.ageMin);
        if (typeof draft.ageMax === 'string') setAgeMax(draft.ageMax);
        if (typeof draft.preferredGenders === 'string') setPreferredGenders(draft.preferredGenders);
        if (typeof draft.preferredIntentions === 'string') setPreferredIntentions(draft.preferredIntentions);
        if (typeof draft.preferredInterests === 'string') setPreferredInterests(draft.preferredInterests);
        if (typeof draft.preferredPersonality === 'string') setPreferredPersonality(draft.preferredPersonality);
        if (typeof draft.preferredHair === 'string') setPreferredHair(draft.preferredHair);
        if (typeof draft.preferredStyle === 'string') setPreferredStyle(draft.preferredStyle);
      }
      setDraftReady(true);
    }).catch(cause => {
      if (active) {
        setDraftError(cause instanceof Error ? cause.message : 'Le brouillon local est indisponible.');
        setDraftReady(true);
      }
    });
    return () => { active = false; };
  }, [onboarding, profile?.id]);

  useEffect(() => {
    if (!onboarding || !profile || !draftReady) return;
    const draft = {
      name, birthDate, bio, intention, gender, interests, personality, ownHair, ownStyle, ownHeight, ageMin, ageMax,
      preferredGenders, preferredIntentions, preferredInterests, preferredPersonality, preferredHair, preferredStyle,
    };
    void AsyncStorage.setItem(`nearly.onboarding.${profile.id}`, JSON.stringify(draft)).catch(cause => {
      setDraftError(cause instanceof Error ? cause.message : 'Impossible de conserver le brouillon sur cet appareil.');
    });
  }, [onboarding, profile?.id, draftReady, name, birthDate, bio, intention, gender, interests, personality, ownHair, ownStyle, ownHeight, ageMin, ageMax,
    preferredGenders, preferredIntentions, preferredInterests, preferredPersonality, preferredHair, preferredStyle]);

  useEffect(() => {
    let active = true;
    const loadPhotos = async () => {
      const client = supabase;
      if (!client || !photoPaths.length) {
        setPhotoUrls([]);
        setPhotoError(null);
        return;
      }
      try {
        const urls = await Promise.all(photoPaths.map(async path => {
          const { data, error } = await client.storage.from('profile-photos').createSignedUrl(path, 600);
          if (error) throw new Error(error.message);
          return { path, url: data.signedUrl };
        }));
        if (active) {
          setPhotoUrls(urls);
          setPhotoError(null);
        }
      } catch (cause) {
        if (active) setPhotoError(cause instanceof Error ? cause.message : 'Impossible de charger les portraits privés.');
      }
    };
    void loadPhotos();
    return () => { active = false; };
  }, [profile?.id, photoPathsKey]);

  if (!profile) return <Page><Empty title="Profil indisponible">Actualisez votre compte puis réessayez.</Empty></Page>;

  const profilePayload = () => ({
    ...profile,
    name: name.trim(),
    birthDate,
    bio: bio.trim(),
    intention: intention.trim(),
    gender: gender.trim(),
    interests: parseCsv(interests),
    personality: parseCsv(personality),
    traits: { hair: ownHair, style: ownStyle, height: ownHeight },
    photos: profile.photos,
  });

  const checkedAgeRange = () => {
    const minimum = Number(ageMin);
    const maximum = Number(ageMax);
    if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 18 || maximum > 120 || minimum > maximum) {
      Alert.alert('Âges invalides', 'Saisissez une tranche d’âge comprise entre 18 et 120 ans.');
      return null;
    }
    return [minimum, maximum] as const;
  };

  const preferencesPayload = (minimum: number, maximum: number): AttractionPreferences => ({
    ageRange: [minimum, maximum],
    genders: parseCsv(preferredGenders),
    intentions: parseCsv(preferredIntentions),
    physical: { traits: { hair: preferredHair, style: preferredStyle }, weight: preferences?.physical.weight ?? 1 },
    interests: { values: parseCsv(preferredInterests), weight: preferences?.interests.weight ?? 1 },
    personality: { values: parseCsv(preferredPersonality), weight: preferences?.personality.weight ?? 1 },
    portraits: preferences?.portraits ?? [],
  });

  const saveProfile = () => {
    const ageRange = checkedAgeRange();
    if (!ageRange) return;
    if (onboarding && (!name.trim() || name.trim().length > 40 || !isAdultBirthDate(birthDate) ||
        bio.length > 500 || !intention.trim() || profile.photos.length < 1 || profile.photos.length > 6)) {
      Alert.alert('Profil incomplet', 'Renseignez un prénom, une date de naissance valide (18 ans ou plus), une intention et ajoutez entre 1 et 6 photos.');
      return;
    }
    void perform(async () => {
      await callRpc('save_preferences', { p: preferencesPayload(ageRange[0], ageRange[1]) });
      await callRpc('save_profile', { p: profilePayload() });
    }).then(async saved => {
      if (!saved || !onboarding) return;
      try {
        await AsyncStorage.removeItem(`nearly.onboarding.${profile.id}`);
      } catch (cause) {
        setDraftError(cause instanceof Error ? cause.message : 'Le profil est créé, mais le brouillon local n’a pas pu être supprimé.');
      }
    });
  };

  const savePreferences = () => {
    const ageRange = checkedAgeRange();
    if (!ageRange) return;
    if (!preferences) return;
    void perform(() => callRpc('save_preferences', { p: preferencesPayload(ageRange[0], ageRange[1]) }));
  };

  const pickPhoto = async () => {
    const client = supabase;
    if (!client) return;
    try {
      let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!permission.granted) permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Accès aux photos indisponible', permission.canAskAgain
          ? 'Autorisez l’accès à vos photos pour choisir un portrait.'
          : 'L’accès a été refusé définitivement. Autorisez les photos dans les Réglages système.', [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Réglages', onPress: () => { void Linking.openSettings(); } },
        ]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
        exif: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const resized = await ImageManipulator.manipulateAsync(
        asset.uri,
        asset.width > 1600 ? [{ resize: { width: 1600 } }] : [],
        { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );
      if (!resized.base64) throw new Error('Impossible de préparer cette image.');
      const bytes = decode(resized.base64);
      if (!bytes.byteLength || bytes.byteLength > MAX_PHOTO_BYTES) throw new Error('La photo doit peser entre 1 octet et 5 Mo.');
      const path = `${snapshot?.active}/${Crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await client.storage.from('profile-photos').upload(path, bytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);
      const registered = await perform(async () => {
        try {
          await callRpc('register_photo', { path, replacing: null });
        } catch (cause) {
          const { error: cleanupError } = await client.storage.from('profile-photos').remove([path]);
          if (cleanupError) throw new Error(`${cause instanceof Error ? cause.message : 'Enregistrement photo impossible.'} Le fichier temporaire n’a pas pu être nettoyé (${cleanupError.message}).`, { cause });
          throw cause;
        }
        await Haptics.selectionAsync();
      });
      if (!registered) return;
    } catch (cause) {
      Alert.alert('Photo non ajoutée', cause instanceof Error ? cause.message : 'Impossible de lire cette photo.');
    }
  };

  const addPhoto = () => Alert.alert(
    'Ajouter un portrait',
    'Nearly accédera à votre photothèque uniquement pour le portrait que vous choisissez. L’image est réencodée avant son envoi privé.',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Choisir une photo', onPress: () => { void pickPhoto(); } },
    ],
  );

  const removePhoto = (path: string) => void perform(async () => {
    const client = supabase;
    if (!client) throw new Error('Client Supabase indisponible.');
    await callRpc('remove_photo', { path });
    const { error } = await client.storage.from('profile-photos').remove([path]);
    if (error) {
      await reload();
      throw new Error(`Photo retirée du profil ; le fichier privé n’a pas été supprimé (${error.message}).`);
    }
  });

  const setVisibility = (radar: boolean, invisible: boolean) => void perform(() => callRpc('set_visibility', {
    radar_enabled: radar,
    invisible_enabled: invisible,
  }));
  const reorderPhoto = (index: number, offset: -1 | 1) => {
    const ordered = [...photoPaths];
    const next = index + offset;
    if (next < 0 || next >= ordered.length) return;
    [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
    void perform(() => callRpc('reorder_photos', { ordered_paths: ordered }));
  };
  const signOut = async () => {
    try {
      await onSignOut();
    } catch (cause) {
      Alert.alert('Déconnexion impossible', cause instanceof Error ? cause.message : 'Vérifiez votre connexion puis réessayez.');
    }
  };

  const exportAccount = async () => {
    if (!snapshot || !profile) return;
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile,
      preferences,
      hearts: snapshot.hearts.filter(heart => heart.from === profile.id || heart.to === profile.id),
      suggestions: snapshot.suggestions.filter(item => item.from === profile.id || item.to === profile.id),
      conversations: snapshot.conversations.filter(item => item.members.includes(profile.id)),
      blocks: snapshot.blocks,
      reports: snapshot.reports.filter(item => item.from === profile.id),
    };
    try {
      await Share.share({ title: 'Export de mes données Nearly.json', message: JSON.stringify(exportData, null, 2) });
    } catch (cause) {
      Alert.alert('Export impossible', cause instanceof Error ? cause.message : 'Impossible de partager vos données.');
    }
  };

  const deleteAccount = () => Alert.alert(
    'Supprimer définitivement votre compte ?',
    'Votre profil, vos photos, cœurs, matchs et conversations seront supprimés. Cette action est irréversible.',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { void (async () => {
        const client = supabase;
        if (!client) {
          Alert.alert('Suppression impossible', 'Client Supabase indisponible.');
          return;
        }
        try {
          const { error } = await client.functions.invoke('delete-account', { method: 'POST' });
          if (error) throw error;
        } catch (cause) {
          Alert.alert('Suppression impossible', cause instanceof Error ? cause.message : 'Vérifiez votre connexion puis réessayez.');
          return;
        }
        try {
          await onSignOut();
        } catch (cause) {
          Alert.alert('Compte supprimé', `La session locale n’a pas pu être fermée. Redémarrez l’application. ${cause instanceof Error ? cause.message : ''}`);
        }
      })(); } },
    ],
  );

  return <Page>
    <Heading eyebrow={onboarding ? 'BIENVENUE SUR NEARLY' : 'VOTRE ESPACE'}
      title={onboarding ? 'Créons votre profil.' : 'Profil & paramètres'}>
      {onboarding ? 'Votre progression est conservée sur cet appareil. Ajoutez au moins une photo pour continuer.' : 'Vos informations restent privées et modifiables.'}
    </Heading>
    {!onboarding ? <Text style={styles.realtime}>Temps réel · {realtimeStatus === 'connected' ? 'connecté' : realtimeStatus === 'connecting' ? 'connexion…' : realtimeStatus === 'degraded' ? 'indisponible · actualisez' : 'en veille'}</Text> : null}
    {draftError ? <Text style={styles.photoError}>{draftError}</Text> : null}
    <Card>
      <Text style={styles.sectionTitle}>{onboarding ? 'À propos de vous' : 'Votre profil'}</Text>
      <Field label="Prénom" value={name} onChangeText={setName} placeholder="Votre prénom" />
      <Field label="Date de naissance (AAAA-MM-JJ)" value={birthDate} onChangeText={setBirthDate} placeholder="1995-04-01" />
      <Text style={styles.note}>18 ans minimum. Votre date de naissance reste privée; le contrôle repose sur votre déclaration.</Text>
      <Field label="Présentation" value={bio} onChangeText={setBio} multiline placeholder="Quelques mots sur vous…" />
      <Field label="Intention" value={intention} onChangeText={setIntention} placeholder="Ce que vous recherchez" />
      <Field label="Genre (facultatif)" value={gender} onChangeText={setGender} placeholder="Votre réponse" />
      <Field label="Centres d’intérêt (séparés par des virgules)" value={interests} onChangeText={setInterests} placeholder={csv([...demoConfig.interests])} />
      <Field label="Personnalité (séparée par des virgules)" value={personality} onChangeText={setPersonality} placeholder={csv([...demoConfig.personalities])} />
      <Field label="Cheveux (facultatif, auto-déclaré)" value={ownHair} onChangeText={setOwnHair} placeholder={csv([...demoConfig.hairs])} />
      <Field label="Style (facultatif, auto-déclaré)" value={ownStyle} onChangeText={setOwnStyle} placeholder={csv([...demoConfig.styles])} />
      <Field label="Taille (facultatif, auto-déclaré)" value={ownHeight} onChangeText={setOwnHeight} placeholder="Ex. 1,70 m" />
      <Button title={onboarding ? 'Terminer mon profil' : 'Enregistrer le profil'} onPress={saveProfile}
        disabled={!draftReady || !name.trim() || !birthDate || !intention.trim() || (onboarding && profile.photos.length < 1)} />
    </Card>
    <Card>
      <Text style={styles.sectionTitle}>Vos portraits · {profile.photos.length}/6</Text>
      <Text style={styles.note}>Les photos restent dans le stockage privé Nearly. Elles sont réencodées en JPEG avant envoi.</Text>
      {photoError ? <Text style={styles.photoError}>{photoError}</Text> : null}
      <View style={styles.gallery}>{photoUrls.map((photo, index) =>
        <Image key={photo.path} source={{ uri: photo.url }} accessibilityLabel={`Portrait ${index + 1}`} style={styles.thumbnail} />
      )}</View>
      {profile.photos.map((path, index) => <View key={path} style={styles.photoRow}>
        <Text style={styles.photoName}>Portrait {index + 1}</Text>
        <Button title="↑" secondary onPress={() => reorderPhoto(index, -1)} disabled={index === 0} />
        <Button title="↓" secondary onPress={() => reorderPhoto(index, 1)} disabled={index === profile.photos.length - 1} />
        <Button title="Retirer" secondary onPress={() => removePhoto(path)} disabled={profile.photos.length <= (profile.onboarded ? 1 : 0)} />
      </View>)}
      {profile.photos.length < 6 ? <Button title="Ajouter une photo" onPress={() => void addPhoto()} /> : null}
      {!profile.photos.length ? <Text style={styles.note}>Ajoutez au moins un portrait pour terminer votre profil.</Text> : null}
    </Card>
    {preferences ? <Card>
      <Text style={styles.sectionTitle}>Préférences & attirance</Text>
      <Text style={styles.note}>Les choix multiples sont séparés par des virgules. Sans genre recherché, Nearly ne proposera pas de suggestions selon vos préférences.</Text>
      <View style={styles.ageRow}>
        <View style={styles.ageField}><Field label="De" value={ageMin} onChangeText={setAgeMin} keyboardType="number-pad" /></View>
        <View style={styles.ageField}><Field label="À" value={ageMax} onChangeText={setAgeMax} keyboardType="number-pad" /></View>
      </View>
      <Field label="Genres recherchés" value={preferredGenders} onChangeText={setPreferredGenders} placeholder={csv([...demoConfig.genres])} />
      <Field label="Intentions compatibles" value={preferredIntentions} onChangeText={setPreferredIntentions} placeholder={csv([...demoConfig.intentions])} />
      <Field label="Centres d’intérêt recherchés" value={preferredInterests} onChangeText={setPreferredInterests} placeholder={csv([...demoConfig.interests])} />
      <Field label="Personnalités recherchées" value={preferredPersonality} onChangeText={setPreferredPersonality} placeholder={csv([...demoConfig.personalities])} />
      <Field label="Cheveux recherchés" value={preferredHair} onChangeText={setPreferredHair} placeholder={csv([...demoConfig.hairs])} />
      <Field label="Style recherché" value={preferredStyle} onChangeText={setPreferredStyle} placeholder={csv([...demoConfig.styles])} />
      {!onboarding ? <Button title="Enregistrer les préférences" onPress={savePreferences} secondary /> : null}
    </Card> : null}
    {!onboarding ? <Card>
      <Text style={styles.sectionTitle}>Confidentialité</Text>
      <View style={styles.switchRow}>
        <View style={styles.switchCopy}>
          <Text style={styles.switchTitle}>Radar Nearly</Text>
          <Text style={styles.note}>{profile.invisible ? 'Invisible · suggestions existantes révoquées.' : profile.radar ? 'Actif · prêt pour de futures détections.' : 'En pause · les suggestions en cours expirent normalement.'}</Text>
        </View>
      </View>
      <View style={styles.radarModes}>
        <Button title="Actif" onPress={() => setVisibility(true, false)} secondary={!(profile.radar && !profile.invisible)} />
        <Button title="Pause" onPress={() => setVisibility(false, false)} secondary={!(profile.invisible === false && profile.radar === false)} />
        <Button title="Invisible" onPress={() => setVisibility(false, true)} secondary={!profile.invisible} />
      </View>
      <Text style={styles.note}>Le Radar reste expérimental : aucun scan BLE n’est actif dans cette version. Les réglages sont conservés sur votre compte.</Text>
    </Card> : null}
    {!onboarding && onOpenPushSetup ? <Button title="Configurer les notifications" onPress={onOpenPushSetup} secondary /> : null}
    {!onboarding ? <Card>
      <Text style={styles.sectionTitle}>Vos données</Text>
      <Text style={styles.note}>Exportez vos données au format JSON ou supprimez définitivement votre compte Nearly.</Text>
      <Button title="Exporter mes données JSON" onPress={() => void exportAccount()} secondary />
      <Button title="Supprimer mon compte" onPress={deleteAccount} secondary />
    </Card> : null}
    <Button title="Se déconnecter" onPress={() => void signOut()} secondary />
  </Page>;
}

const styles = StyleSheet.create({
  sectionTitle: { color: theme.colors.pearl, fontWeight: '700', fontSize: 17 },
  realtime: { color: theme.colors.muted, fontSize: 12 },
  note: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  photoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  photoName: { color: theme.colors.pearl, fontSize: 14 },
  photoError: { color: theme.colors.danger, fontSize: 13, lineHeight: 19 },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbnail: { width: 82, height: 106, borderRadius: 12, backgroundColor: '#2A1A2F' },
  ageRow: { flexDirection: 'row', gap: 12 },
  ageField: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  radarModes: { flexDirection: 'row', gap: 8 },
  switchCopy: { flex: 1, gap: 3 },
  switchTitle: { color: theme.colors.pearl, fontWeight: '600', fontSize: 14 },
});
