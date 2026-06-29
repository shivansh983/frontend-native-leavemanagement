import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [token, role] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userRole'),
        ]);

        if (token) {
          setUserToken(token);
        }
        if (role) {
          setUserRole(role);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (token, role) => {
    await AsyncStorage.multiSet([
      ['userToken', token],
      ['userRole', role || 'Employee'],
    ]);
    setUserToken(token);
    setUserRole(role || 'Employee');
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userRole']);
    setUserToken(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
