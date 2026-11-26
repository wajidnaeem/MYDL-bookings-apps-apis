import Constants from 'expo-constants';
import * as Device from 'expo-device';

import { api } from '@/lib/api';

type NotificationsModule = typeof import('expo-notifications');

// expo-notifications is loaded on demand: in Expo Go its native dependencies can be missing,
// and a failure at import time would crash the whole app instead of just skipping push.
let notifications: NotificationsModule | null | undefined;

function loadNotifications(): NotificationsModule | null {
  if (notifications !== undefined) return notifications;
  try {
    const mod: NotificationsModule = require('expo-notifications');
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notifications = mod;
  } catch (error) {
    console.warn('Push notifications are unavailable in this build.', error);
    notifications = null;
  }
  return notifications;
}

export async function registerPushToken() {
  if (!Device.isDevice) return;
  const Notifications = loadNotifications();
  if (!Notifications) return;

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (token) {
    await api.registerDevice(token);
  }
}
