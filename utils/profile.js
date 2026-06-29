import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const API_BASE_URL = 'http://192.168.29.152:8000';
export const PROFILE_CACHE_KEY = 'userProfile';

export const authHeaders = (token) => ({
  Authorization: token?.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`,
});

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith('http') || imagePath.startsWith('file:')
    ? imagePath
    : `${API_BASE_URL}${imagePath}`;
};

export const normalizeProfile = (data = {}) => {
  const profile = data.data?.user || data.data?.profile || data.data || data.user || data.profile || data;

  return {
    name: profile.name || profile.username || '',
    email: profile.email || '',
    profileImage: resolveImageUrl(
      profile.profileImage || profile.profilePic || profile.avatar || profile.image || null
    ),
  };
};

export const loadCachedProfile = async () => {
  const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
  return cached ? JSON.parse(cached) : {};
};

export const saveCachedProfile = async (profile) => {
  const current = await loadCachedProfile();
  const next = {
    ...current,
    ...profile,
  };

  await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(next));
  return next;
};

const profileGetPaths = [
  '/api/v1/profile',
  '/api/v1/profile/me',
  '/api/v1/users/profile',
  '/api/v1/user/profile',
  '/api/v1/auth/profile',
  '/api/v1/auth/me',
  '/api/v1/users/me',
  '/api/v1/me',
];

const profileUpdatePaths = [
  '/api/v1/profile/update',
  '/api/v1/profile',
  '/api/v1/profile/me',
  '/api/v1/users/profile',
  '/api/v1/user/profile',
  '/api/v1/auth/profile',
  '/api/v1/users/me',
  '/api/v1/me',
];

const shouldTryNextEndpoint = (error) => [404, 405].includes(error.response?.status);

export const fetchProfileFromApi = async (token) => {
  let lastError;

  for (const path of profileGetPaths) {
    try {
      const response = await axios.get(`${API_BASE_URL}${path}`, {
        headers: authHeaders(token),
      });

      return normalizeProfile(response.data);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextEndpoint(error)) break;
    }
  }

  throw lastError;
};

export const updateProfileOnApi = async (token, formData) => {
  let lastError;

  for (const path of profileUpdatePaths) {
    for (const method of ['put', 'patch']) {
      try {
        const response = await axios[method](`${API_BASE_URL}${path}`, formData, {
          headers: authHeaders(token),
        });

        return normalizeProfile(response.data);
      } catch (error) {
        lastError = error;
        if (!shouldTryNextEndpoint(error)) break;
      }
    }

    if (!shouldTryNextEndpoint(lastError)) break;
  }

  throw lastError;
};
