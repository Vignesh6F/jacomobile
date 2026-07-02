import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all credentials.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.trim(),
        password: password.trim()
      });

      const { token, ...userData } = response.data;
      login(userData, token);
      
      Alert.alert('Success', 'Welcome back to Jacotail!', [
        { text: 'Awesome', onPress: () => navigation.navigate('HomeTab') }
      ]);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      Alert.alert('Authentication Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter credentials to access listings and seller options</Text>

        {/* Email */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={16} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput}
              placeholder="e.g. buyer@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={16} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Submit button */}
        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <TouchableOpacity 
          style={styles.linkBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>Don't have an account? Register now</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 12,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
    marginTop: -40,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 28,
  },
  inputBox: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  linkBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  }
});
