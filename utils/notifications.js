import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { API_BASE_URL, authHeaders } from './profile';

export const registerForPushNotifications = async (token) => {
  try {
    if (!token || Platform.OS === 'web') return;

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    const deviceToken = await Notifications.getDevicePushTokenAsync();
    const fcmToken = deviceToken?.data;

    if (!fcmToken) return;

    await axios.post(
      `${API_BASE_URL}/api/v1/notifications/token`,
      { fcmToken },
      { headers: authHeaders(token) }
    );
  } catch (error) {
    console.error('Failed to register push notifications:', error);
  }
};
