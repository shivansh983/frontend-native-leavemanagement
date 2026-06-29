//name Xusername, departmet


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
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import ThemedView from '../../components/ThemedView';
import axios from  'axios'
import { Alert } from 'react-native';


const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];

  const router = useRouter();

  const handleRegister = async () => {
    if (!username||!email||!password){
      Alert.alert("please fill all fields");
      return;
    }
    try{
      const response = await axios.post('http://192.168.29.152:8000/api/v1/auth/register',{
        name: username,
        email: email,
        password: password,
        department:"general"
      });
      console.log("Register Success:", response.data);
      Alert.alert("success");
      router.replace('/login');
    }catch(error){
      console.error(error);
      const errorMessage = error.response?.data?.message || "failed";
      Alert.alert("registartion failed",errorMessage);
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
            <View style={styles.registerBoard}>
            <Text style={[styles.title, { color: theme.titleColor }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.placeholder }]}>
              Sign up to get started
            </Text>
            </View>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow }]}>
            
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.inputColor }]}
                placeholder="Username"
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
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={theme.placeholder}
                keyboardType="email-address"
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

            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.inputColor }]}
                placeholder="Confirm Password"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor={theme.placeholder}
              />
            </View>

            <TouchableOpacity style={[styles.registerButton, { backgroundColor: theme.buttonColor, shadowColor: theme.shadow }]} onPress={handleRegister}>
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Create Account</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.footerContainer}>
            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: theme.text }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: theme.linkColor }]}>Login here</Text>
              </TouchableOpacity>
            </View>
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
  registerBoard: {
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
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
  registerButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerContainer: {
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Register;
