import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        AsyncStorage.setItem('userToken', currentUser.accessToken);
      } else {
        AsyncStorage.removeItem('userToken');
      }
    });

    return () => unsubscribe();
  }, []);

  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      router.replace({
        pathname: '/dashboard',
        params: { uid: user.uid },
      });
    }
  }, [user]);

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !password.trim()) {
      alert('Please fill in both email and password.');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await AsyncStorage.setItem('userToken', userCredential.user.accessToken);

    } catch (error) {
      let message = 'Invalid username or password. Please try again.';

      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Invalid email format.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email.';
          break;
        default:
          console.error('Firebase login error:', error.code);
      }

      alert(message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.authContainer}>
        <Text style={styles.title}>Welcome to BookNest 📚</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7a6e65"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7a6e65"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          textContentType="password"
        />
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        <View style={styles.signupContainer}>
          <Text style={styles.signupTextLight}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3efe7',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  authContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 25,
    color: '#5a4a3e',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#c7b89e',
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 18,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#4b3b2b',
    fontFamily: 'serif',
  },
  button: {
    backgroundColor: '#6b4f4f',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#3a2f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#f3efe7',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupTextLight: {
    color: '#7a6e65',
    fontFamily: 'serif',
  },
  signupText: {
    color: '#6b4f4f',
    fontWeight: '600',
    fontFamily: 'serif',
  },
});

export default Index;
