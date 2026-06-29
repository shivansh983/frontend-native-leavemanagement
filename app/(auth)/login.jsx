import React, { useState } from 'react';
import { 
  StyleSheet, 
  useColorScheme, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import axios from 'axios';
import { saveCachedProfile } from '../../utils/profile';
import { registerForPushNotifications } from '../../utils/notifications';

// 1. IMPORT YOUR AUTH CONTEXT HOOK
import { useAuth } from '../../context/auth.context'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];
  
  const router = useRouter(); 
  
  const { login } = useAuth(); 

  const handleLogin = async () => {
    if(!username || !password){
      Alert.alert("Error", "Fields are empty");
      return;
    }
    
    try {
      const response = await axios.post('http://192.168.29.152:8000/api/v1/auth/login', {
        email: username,   
        password: password
      });

      const { token, user } = response.data.data;
      const { role } = user;
      
      console.log("Login Success! Role:", role);

      await login(token, role);
      await saveCachedProfile({
        name: user.name || user.username || '',
        email: user.email || username,
        profileImage: user.profileImage || user.profilePic || user.avatar || null,
      });
      await registerForPushNotifications(token);

      router.replace('/dashboard');

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Login Failed";
      Alert.alert("Login Error", errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <View style={styles.loginBoard}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue to your dashboard
              </Text>
            </View>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow }]}>
            
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.inputColor }]}
                placeholder="Email"
                value={username} 
                onChangeText={setUsername}
                placeholderTextColor={theme.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.inputColor }]}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor={theme.placeholder}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={22} 
                  color={theme.placeholder} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.linkColor }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: theme.buttonColor, shadowColor: theme.shadow }]}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.signupRow}>
              <Text style={[styles.signupText, { color: theme.text }]}>
                Don't have an account?{' '}
              </Text>

              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={[styles.signupLink, { color: theme.linkColor }]}>Sign up here</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.playgroundButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => router.push('/playground')}
            >
              <Text style={[styles.playgroundText, { color: theme.text }]}>Visit Playground</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  loginBoard: {
    backgroundColor: '#092a8b', 
    width: '100%',              
    paddingVertical: 24,        
    paddingHorizontal: 16,      
    borderRadius: 20,           
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#092a8b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,               
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
    color: '#FFFFFF',           
  },
  subtitle: {
    fontSize: 15,
    color: '#E2E8F0',           
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 8,
    marginRight: -8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
  footerContainer: {
    alignItems: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  signupText: {
    fontSize: 15,
  },
  signupLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  playgroundButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  playgroundText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Login;
