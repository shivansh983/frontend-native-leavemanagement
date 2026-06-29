import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useFocusEffect, useRouter } from 'expo-router';
import ThemedView from '../../components/ThemedView';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authHeaders } from '../../utils/profile';

const History = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];
  const router = useRouter();

  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await axios.get('http://192.168.29.152:8000/api/v1/leave/history', {
          headers: authHeaders(token)
        });
        
        setHistoryData(response.data.leaves || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
    fetchHistory();
    }, [fetchHistory])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return theme.success;
      case 'Rejected':
        return theme.danger;
      default:
        return theme.warning;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return 'checkmark-circle';
      case 'Rejected':
        return 'close-circle';
      default:
        return 'time';
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
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.header, { color: theme.text }]}>Leave History</Text>

        {historyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={theme.placeholder} />
            <Text style={[styles.emptyText, { color: theme.placeholder }]}>No leave history found.</Text>
          </View>
        ) : (
          historyData.map((leave, index) => (
            <View key={index} style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }]}>
              
              <View style={styles.cardHeader}>
                <View style={styles.leaveTypeContainer}>
                  <Ionicons name="calendar" size={20} color={theme.buttonColor} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{leave.leaveType} Leave</Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(leave.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(leave.status)} size={14} color={getStatusColor(leave.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(leave.status) }]}>{leave.status}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.dateRow}>
                  <Text style={[styles.dateLabel, { color: theme.placeholder }]}>From:</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>{leave.startDate}</Text>
                </View>
                <View style={styles.dateRow}>
                  <Text style={[styles.dateLabel, { color: theme.placeholder }]}>To:</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>{leave.endDate}</Text>
                </View>
              </View>

              {leave.reason && (
                <View style={styles.reasonContainer}>
                  <Text style={[styles.reasonText, { color: theme.placeholder }]} numberOfLines={2}>
                    "{leave.reason}"
                  </Text>
                </View>
              )}

            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  cardBody: {
    backgroundColor: '#00000005',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  reasonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#00000010',
    paddingTop: 12,
  },
  reasonText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default History;
