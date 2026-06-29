import React, { useState } from 'react';
import { StyleSheet, Text, View, useColorScheme, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authHeaders } from '../../utils/profile';

const Apply = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];
  const router = useRouter();

  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const leaveTypes = ['Casual', 'Sick', 'Earned'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const openCalendar = (target) => {
    const currentDate = parseDate(target === 'start' ? startDate : endDate) || new Date();
    setVisibleMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    setCalendarTarget(target);
  };

  const getCalendarDays = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let index = 0; index < firstDay; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  const changeMonth = (direction) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  const selectDate = (date) => {
    const value = formatDate(date);

    if (calendarTarget === 'start') {
      setStartDate(value);
      if (endDate && parseDate(endDate) < date) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
    }

    setCalendarTarget(null);
  };

  const handleApply = async () => {
    if (!startDate || !endDate || !reason) {
      Alert.alert("Missing Fields", "Please fill out all details.");
      return;
    }

    const parsedStart = parseDate(startDate);
    const parsedEnd = parseDate(endDate);

    if (!parsedStart || !parsedEnd) {
      Alert.alert("Invalid Dates", "Please choose valid start and end dates.");
      return;
    }

    if (parsedEnd < parsedStart) {
      Alert.alert("Invalid Dates", "End date cannot be before start date.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert("Error", "You must be logged in to apply for leave.");
        router.replace('/login');
        return;
      }

      const response = await axios.post('http://192.168.29.152:8000/api/v1/leave/apply', 
        {
          leaveType: leaveType,
          startDate: startDate,
          endDate: endDate,
          reason: reason
        },
        {
          headers: authHeaders(token)
        }
      );

      Alert.alert(
        "Application Submitted!",
        "Your leave request has been sent to the manager.",
        [{ text: "OK", onPress: () => router.replace('/history') }]
      );

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Failed to submit application.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.header, { color: theme.text }]}>Apply for Leave</Text>

          <View style={[styles.formContainer, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow }]}>
            
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Leave Type</Text>
            <View style={styles.typeContainer}>
              {leaveTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    { 
                      backgroundColor: leaveType === type ? theme.buttonColor : theme.inputBackground,
                      borderColor: leaveType === type ? theme.buttonColor : theme.border 
                    }
                  ]}
                  onPress={() => setLeaveType(type)}
                >
                  <Text style={[
                    styles.typeText,
                    { color: leaveType === type ? '#ffffff' : theme.placeholder }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dateRow}>
              <View style={styles.dateInputContainer}>
                <Text style={[styles.inputLabel, { color: theme.placeholder }]}>Start Date</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                  onPress={() => openCalendar('start')}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                  <Text style={[styles.dateText, { color: startDate ? theme.inputColor : theme.placeholder }]}>
                    {startDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={[styles.inputLabel, { color: theme.placeholder }]}>End Date</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                  onPress={() => openCalendar('end')}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.placeholder} style={styles.inputIcon} />
                  <Text style={[styles.dateText, { color: endDate ? theme.inputColor : theme.placeholder }]}>
                    {endDate || 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.placeholder }]}>Reason for Leave</Text>
            <View style={[styles.textAreaWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TextInput
                style={[styles.textArea, { color: theme.inputColor }]}
                placeholder="Please provide a brief reason..."
                value={reason}
                onChangeText={setReason}
                placeholderTextColor={theme.placeholder}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: theme.buttonColor, shadowColor: theme.shadow }]}
              onPress={handleApply}
            >
              <Text style={styles.buttonText}>Submit Application</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={Boolean(calendarTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarContainer, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.calendarIconButton} onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.calendarTitle, { color: theme.text }]}>
                {visibleMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity style={styles.calendarIconButton} onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {weekDays.map((day) => (
                <Text key={day} style={[styles.weekDay, { color: theme.placeholder }]}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {getCalendarDays().map((date, index) => {
                const selectedValue = calendarTarget === 'start' ? startDate : endDate;
                const isSelected = date && selectedValue === formatDate(date);

                return (
                  <TouchableOpacity
                    key={`${date?.toISOString() || 'empty'}-${index}`}
                    style={[
                      styles.dayButton,
                      isSelected && { backgroundColor: theme.buttonColor },
                    ]}
                    disabled={!date}
                    onPress={() => selectDate(date)}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: isSelected ? '#ffffff' : theme.text },
                      !date && styles.emptyDayText,
                    ]}>
                      {date ? date.getDate() : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={() => setCalendarTarget(null)}
            >
              <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  formContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInputContainer: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 120,
    marginBottom: 24,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  calendarIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDayText: {
    opacity: 0,
  },
  cancelButton: {
    marginTop: 16,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default Apply;
