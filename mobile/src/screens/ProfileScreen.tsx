import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Switch, Text, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useNearly } from '../context/NearlyContext';
import { callRpc, supabase } from '../lib/supabase';
import { Button, Card, Empty, Field, Heading, Page } from '../components';
import { theme } from '../theme';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function ProfileScreen({ onSignOut }: { onSignOut: () => void }) {
  const { snapshot, perform, reload } = useNearly();
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
  const [photoUrls, setPhotoUrls] = useState<{ path: string; url: string }[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

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

  const saveProfile = () => void perform(() => callRpc('save_profile', {
    p: { ...profile, name, birthDate, bio, intention, gender, photos: profile.photos },
  }));

  const savePreferences = () => {
    const minimum = Number(ageMin);
    const maximum = Number(ageMax);
    if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 18 || maximum > 120 || minimum > maximum) {
      Alert.alert('Âges invalides', 'Saisissez une tranche d’âge comprise entre 18 et 120 ans.');
      return;
    }
    if (!preferences) return;
    void perform(() => callRpc('save_preferences', { p: { ...preferences, ageRange: [minimum, maximum] } }));
  };

  const addPhoto = async () => {
    const client = supabase;
    if (!client) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
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
  const signOut = async () => {
    try {
      await onSignOut();
    } catch (cause) {
      Alert.alert('Déconnexion impossible', cause instanceof Error ? cause.message : 'Vérifiez votre connexion puis réessayez.');
    }
  };

  return <Page>
    <Heading eyebrow="VOTRE ESPACE" title="Profil & paramètres">Vos informations restent privées et modifiables.</Heading>
    <Card>
      <Text style={styles.sectionTitle}>Votre profil</Text>
      <Field label="Prénom" value={name} onChangeText={setName} placeholder="Votre prénom" />
      <Field label="Date de naissance (AAAA-MM-JJ)" value={birthDate} onChangeText={setBirthDate} placeholder="1995-04-01" />
      <Field label="Présentation" value={bio} onChangeText={setBio} multiline placeholder="Quelques mots sur vous…" />
      <Field label="Intention" value={intention} onChangeText={setIntention} placeholder="Ce que vous recherchez" />
      <Field label="Genre (facultatif)" value={gender} onChangeText={setGender} placeholder="Votre réponse" />
      <Button title="Enregistrer le profil" onPress={saveProfile} disabled={!name.trim() || !birthDate || !intention.trim() || profile.photos.length < 1} />
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
        <Button title="Retirer" secondary onPress={() => removePhoto(path)} disabled={profile.photos.length <= (profile.onboarded ? 1 : 0)} />
      </View>)}
      {profile.photos.length < 6 ? <Button title="Ajouter une photo" onPress={() => void addPhoto()} /> : null}
      {!profile.photos.length ? <Text style={styles.note}>Ajoutez au moins un portrait pour terminer votre profil.</Text> : null}
    </Card>
    {preferences ? <Card>
      <Text style={styles.sectionTitle}>Préférences d’âge</Text>
      <View style={styles.ageRow}>
        <View style={styles.ageField}><Field label="De" value={ageMin} onChangeText={setAgeMin} keyboardType="number-pad" /></View>
        <View style={styles.ageField}><Field label="À" value={ageMax} onChangeText={setAgeMax} keyboardType="number-pad" /></View>
      </View>
      <Button title="Enregistrer les préférences" onPress={savePreferences} secondary />
    </Card> : null}
    <Card>
      <Text style={styles.sectionTitle}>Confidentialité</Text>
      <View style={styles.switchRow}>
        <View style={styles.switchCopy}><Text style={styles.switchTitle}>Radar</Text><Text style={styles.note}>Expérimental ; aucune proximité active dans cette version.</Text></View>
        <Switch value={profile.radar} onValueChange={value => setVisibility(value, profile.invisible)} trackColor={{ false: theme.colors.line, true: theme.colors.lilac }} thumbColor={theme.colors.pearl} />
      </View>
      <View style={styles.switchRow}>
        <View style={styles.switchCopy}><Text style={styles.switchTitle}>Mode invisible</Text><Text style={styles.note}>Révoque les suggestions de proximité actives.</Text></View>
        <Switch value={profile.invisible} onValueChange={value => setVisibility(profile.radar, value)} trackColor={{ false: theme.colors.line, true: theme.colors.lilac }} thumbColor={theme.colors.pearl} />
      </View>
    </Card>
    <Button title="Se déconnecter" onPress={() => void signOut()} secondary />
  </Page>;
}

const styles = StyleSheet.create({
  sectionTitle: { color: theme.colors.pearl, fontWeight: '700', fontSize: 17 },
  note: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  photoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  photoName: { color: theme.colors.pearl, fontSize: 14 },
  photoError: { color: theme.colors.danger, fontSize: 13, lineHeight: 19 },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumbnail: { width: 82, height: 106, borderRadius: 12, backgroundColor: '#2A1A2F' },
  ageRow: { flexDirection: 'row', gap: 12 },
  ageField: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  switchCopy: { flex: 1, gap: 3 },
  switchTitle: { color: theme.colors.pearl, fontWeight: '600', fontSize: 14 },
});
