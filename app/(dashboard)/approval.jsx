import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, useColorScheme, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import ThemedView from '../../components/ThemedView';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authHeaders } from '../../utils/profile';

const Approvals = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];
  const router = useRouter();

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingLeaves = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await axios.get('http://192.168.29.152:8000/api/v1/leave/pending', {
        headers: authHeaders(token)
      });
      
      setPendingLeaves(response.data.leaves || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleAction = async (leaveId, action) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      await axios.put(`http://192.168.29.152:8000/api/v1/leave/action`, 
        { leaveId: leaveId, status: action },
        { headers: authHeaders(token) }
      );

      setPendingLeaves((prevLeaves) => prevLeaves.filter((leave) => leave.id !== leaveId));
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", `Failed to ${action.toLowerCase()} leave.`);
    }
  };

  const confirmAction = (leaveId, employeeName, action) => {
    Alert.alert(
      `${action} Leave`,
      `Are you sure you want to ${action.toLowerCase()} the leave request for ${employeeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: `Yes, ${action}`, onPress: () => handleAction(leaveId, action) }
      ]
    );
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
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.text }]}>Pending Approvals</Text>

        {pendingLeaves.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.placeholder} />
            <Text style={[styles.emptyText, { color: theme.placeholder }]}>You're all caught up!</Text>
            <Text style={[styles.emptySubtext, { color: theme.placeholder }]}>No pending leave requests.</Text>
          </View>
        ) : (
          pendingLeaves.map((leave) => (
            <View key={leave.id} style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }]}>
              
              <View style={styles.cardHeader}>
                <View style={styles.employeeInfo}>
                  <View style={[styles.avatarSmall, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                    <Ionicons name="person" size={16} color={theme.placeholder} />
                  </View>
                  <Text style={[styles.employeeName, { color: theme.text }]}>{leave.employeeName}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: theme.buttonColor + '20' }]}>
                  <Text style={[styles.typeText, { color: theme.buttonColor }]}>{leave.leaveType}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.dateRow}>
                  <Text style={[styles.dateLabel, { color: theme.placeholder }]}>Duration:</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>{leave.startDate} to {leave.endDate}</Text>
                </View>
                {leave.reason && (
                  <View style={styles.reasonContainer}>
                    <Text style={[styles.reasonText, { color: theme.placeholder }]} numberOfLines={3}>
                      "{leave.reason}"
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectButton, { borderColor: theme.danger }]}
                  onPress={() => confirmAction(leave.id, leave.employeeName, 'Rejected')}
                >
                  <Ionicons name="close" size={18} color={theme.danger} />
                  <Text style={[styles.actionButtonText, { color: theme.danger }]}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.acceptButton, { backgroundColor: theme.success, shadowColor: theme.shadow }]}
                  onPress={() => confirmAction(leave.id, leave.employeeName, 'Approved')}
                >
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                  <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Approve</Text>
                </TouchableOpacity>
              </View>

            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 100 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, letterSpacing: 0.5 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { fontSize: 18, marginTop: 16, fontWeight: '700' },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  card: { width: '100%', borderRadius: 20, padding: 20, borderWidth: 1.5, marginBottom: 20, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  employeeInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  employeeName: { fontSize: 16, fontWeight: '700' },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  typeText: { fontSize: 12, fontWeight: '800' },
  cardBody: { backgroundColor: '#00000005', padding: 16, borderRadius: 12, marginBottom: 16 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dateLabel: { fontSize: 14, fontWeight: '600' },
  dateValue: { fontSize: 14, fontWeight: '700' },
  reasonContainer: { borderTopWidth: 1, borderTopColor: '#00000010', paddingTop: 12, marginTop: 4 },
  reasonText: { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flex: 0.48, flexDirection: 'row', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rejectButton: { borderWidth: 1.5, backgroundColor: 'transparent' },
  acceptButton: { elevation: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4 },
  actionButtonText: { fontSize: 15, fontWeight: '700', marginLeft: 6 }
});

export default Approvals;
