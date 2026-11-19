import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const key = 'mydl_token';

export async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, token);
    return;
  }
  await SecureStore.setItemAsync(key, token);
}

export async function loadToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key) || '';
  }
  return (await SecureStore.getItemAsync(key)) || '';
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
