import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { ChevronLeft, User, Mail, Lock } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all details.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: name.trim(),
        email: email.trim(),
        password: password.trim()
      });

      const { token, ...userData } = response.data;
      login(userData, token);
      
      Alert.alert('Success', 'Account registered successfully!', [
        { text: 'Great', onPress: () => navigation.navigate('HomeTab') }
      ]);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Registration failed. Try a different username/email.';
      Alert.alert('Registration Failed', errMsg);
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
        <Text style={styles.headerTitle}>Register</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to access and publish premium listings</Text>

        {/* Username */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <User size={16} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput}
              placeholder="e.g. janesmith"
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={16} color="#64748b" style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput}
              placeholder="e.g. jane@example.com"
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

        {/* Submit */}
        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <TouchableOpacity 
          style={styles.linkBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Already have an account? Log in</Text>
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
