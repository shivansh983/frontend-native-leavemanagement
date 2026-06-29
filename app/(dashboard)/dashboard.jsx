import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, useColorScheme, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { authHeaders, fetchProfileFromApi, loadCachedProfile, saveCachedProfile } from '../../utils/profile';

const Dashboard = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];
  const router = useRouter();

  const [leaveData, setLeaveData] = useState({ sickTotal: 12, casualTotal: 12, earnedTotal: 4, sickUsed: 0, casualUsed: 0, earnedUsed: 0 });
  const [profileImage, setProfileImage] = useState(null);
  const [userRole, setUserRole] = useState('Employee');
  const [isLoading, setIsLoading] = useState(true);
  

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace('/login');
          return;
        }

        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role || 'Employee');

        const cachedProfile = await loadCachedProfile();
        if (cachedProfile.profileImage) {
          setProfileImage(cachedProfile.profileImage);
        }

        try {
          const dashboardRes = await axios.get('http://192.168.29.152:8000/api/v1/dashboard', {
            headers: authHeaders(token),
          });

          setLeaveData({
            sickTotal: 12, casualTotal: 12, earnedTotal: 4,
            sickUsed: dashboardRes.data.sickLeaves || 0,
            casualUsed: dashboardRes.data.casualLeaves || 0,
            earnedUsed: dashboardRes.data.earnedLeaves || 0
          });
        } catch (error) {
          console.error(error);
        }

        try {
          const apiProfile = await fetchProfileFromApi(token);
          const savedProfile = await saveCachedProfile(apiProfile);
          if (savedProfile.profileImage) {
            setProfileImage(savedProfile.profileImage);
          }
        } catch (error) {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
    fetchDashboardData();
    }, [fetchDashboardData])
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.buttonColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: theme.text }]}>Leave Dashboard</Text>
          <TouchableOpacity onPress={() => router.navigate('/profile')}>
            <View style={[styles.smallAvatar, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="person" size={24} color={theme.placeholder} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Sick Leave</Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>{leaveData.sickTotal - leaveData.sickUsed}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.placeholder }]}>Remaining of {leaveData.sickTotal}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Casual Leave</Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>{leaveData.casualTotal - leaveData.casualUsed}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.placeholder }]}>Remaining of {leaveData.casualTotal}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Earned Leave</Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>{leaveData.earnedTotal - leaveData.earnedUsed}</Text>
            <Text style={[styles.cardSubtitle, { color: theme.placeholder }]}>Remaining of {leaveData.earnedTotal}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Total Balance</Text>
            <Text style={[styles.cardValue, { color: theme.text }]}>
              {(leaveData.sickTotal - leaveData.sickUsed) + (leaveData.casualTotal - leaveData.casualUsed) + (leaveData.earnedTotal - leaveData.earnedUsed)}
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.placeholder }]}>Days Available</Text>
          </View>
        </View>

        {userRole?.toLowerCase() === 'manager' && (
          <TouchableOpacity 
            style={[styles.managerCard, { backgroundColor: theme.buttonColor, shadowColor: theme.shadow }]}
            onPress={() => router.navigate('/approval')}
          >
            <View style={styles.managerCardContent}>
              <View>
                <Text style={styles.managerCardTitle}>Manager Actions</Text>
                <Text style={styles.managerCardText}>Review pending leave requests</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={32} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.analysisCard, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <Text style={[styles.analysisTitle, { color: theme.text }]}>Leave Analysis</Text>
          <Text style={[styles.analysisText, { color: theme.text }]}>Sick Leave Used: <Text style={{ fontWeight: '700', color: theme.text }}>{leaveData.sickUsed}</Text> days</Text>
          <Text style={[styles.analysisText, { color: theme.text }]}>Casual Leave Used: <Text style={{ fontWeight: '700', color: theme.text }}>{leaveData.casualUsed}</Text> days</Text>
          <Text style={[styles.analysisText, { color: theme.text }]}>Earned Leave Used: <Text style={{ fontWeight: '700', color: theme.text }}>{leaveData.earnedUsed}</Text> days</Text>
        </View>

      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  header: { fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 },
  smallAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '48%', borderRadius: 20, padding: 20, borderWidth: 1.5, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: '900' },
  cardSubtitle: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  managerCard: { borderRadius: 20, padding: 20, marginBottom: 16, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8 },
  managerCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  managerCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  managerCardText: { fontSize: 14, color: '#ffffff', opacity: 0.9 },
  analysisCard: { marginTop: 8, borderRadius: 20, padding: 24, borderWidth: 1.5, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8 },
  analysisTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  analysisText: { fontSize: 16, marginBottom: 10, fontWeight: '500' }
});

export default Dashboard;
