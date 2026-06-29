import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, useColorScheme, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/auth.context';
import {
  fetchProfileFromApi,
  loadCachedProfile,
  saveCachedProfile,
  updateProfileOnApi,
} from '../../utils/profile';

const Profile = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];
  const router = useRouter();
  const { logout } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImageAsset, setSelectedImageAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace('/login');
          return;
        }

        const cachedProfile = await loadCachedProfile();
        if (cachedProfile.name) setName(cachedProfile.name);
        if (cachedProfile.email) setEmail(cachedProfile.email);
        if (cachedProfile.profileImage) setProfileImage(cachedProfile.profileImage);

        try {
          const apiProfile = await fetchProfileFromApi(token);
          const savedProfile = await saveCachedProfile(apiProfile);
          if (savedProfile.name) setName(savedProfile.name);
          if (savedProfile.email) setEmail(savedProfile.email);
          if (savedProfile.profileImage) setProfileImage(savedProfile.profileImage);
        } catch (error) {
          console.error(error);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Needed", "Please allow photo access to choose a profile picture.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setSelectedImageAsset(result.assets[0]);
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not pick an image.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    try {
      setIsSaving(true);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);

      if (profileImage && !profileImage.startsWith('http')) {
        if (selectedImageAsset?.file) {
          formData.append('profileImage', selectedImageAsset.file);
        } else {
        const filename = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        formData.append('profileImage', {
          uri: profileImage,
          name: filename,
          type: type
        });
        }
      }

      let savedProfile = await saveCachedProfile({
        name,
        email,
        profileImage,
      });

      try {
        const apiProfile = await updateProfileOnApi(token, formData);
        savedProfile = await saveCachedProfile({
          name,
          email,
          profileImage: apiProfile.profileImage || profileImage,
        });
      } catch (error) {
        console.error(error);
      }

      setName(savedProfile.name || name);
      setEmail(savedProfile.email || email);
      setProfileImage(savedProfile.profileImage || profileImage);
      setSelectedImageAsset(null);
      
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.buttonColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[styles.header, { color: theme.text }]}>My Profile</Text>

          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.cardBackground, borderColor: theme.border, overflow: 'hidden' }]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="person" size={60} color={theme.placeholder} />
              )}
            </View>
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.buttonColor }]} onPress={pickImage}>
              <Ionicons name="camera" size={16} color={theme.buttonText} />
            </TouchableOpacity>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow }]}>
            <Text style={[styles.inputLabel, { color: theme.placeholder }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="person-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: theme.inputColor }]} placeholder="Enter your name" value={name} onChangeText={setName} placeholderTextColor={theme.placeholder} />
            </View>

            <Text style={[styles.inputLabel, { color: theme.placeholder }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="mail-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: theme.inputColor }]} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.placeholder} />
            </View>

            <TouchableOpacity
              style={[
                styles.updateButton,
                { backgroundColor: theme.buttonColor, shadowColor: theme.shadow },
                isSaving && styles.disabledButton,
              ]}
              onPress={handleUpdateProfile}
              disabled={isSaving}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, { borderColor: theme.danger }]}
              onPress={async () => {
                await logout();
                router.replace('/login');
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.logoutText, { color: theme.danger }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 100 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, letterSpacing: 0.5 },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  editAvatarButton: { position: 'absolute', bottom: 0, right: '35%', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  formContainer: { width: '100%', padding: 24, borderRadius: 24, elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, marginBottom: 20, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  updateButton: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8 },
  disabledButton: { opacity: 0.7 },
  buttonText: { fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  logoutButton: { flexDirection: 'row', width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16, borderWidth: 1.5 },
  logoutText: { fontSize: 16, fontWeight: '700' }
});

export default Profile;
