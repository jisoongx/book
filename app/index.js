import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { useRouter } from 'expo-router';

const Index = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const router = useRouter();

  // Restore user session on app load
  useEffect(() => {
    const restoreUser = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Note: Firebase SDK doesn't allow setting token manually,
        // so just listen for auth state changes below.
      }
    };
    restoreUser();

    // Listen for auth state changes and update user state
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

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Save token to AsyncStorage for persistence
      await AsyncStorage.setItem('userToken', userCredential.user.accessToken);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
        {user ? (
            <View style={styles.loggedInContainer}>
            <Text style={styles.welcome}>Welcome, {user.email}!</Text>
            <Pressable style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Log Out</Text>
            </Pressable>
            </View>
        ) : (
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
        )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3efe7', // creamy parchment background
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
  loggedInContainer: {
    alignItems: 'center',
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
  signUpButton: {
    backgroundColor: '#a67b5b',
  },
  signUpButtonText: {
    fontWeight: '700',
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#5a4a3e',
    fontFamily: 'serif',
  },
});

export default Index;
