import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function BecomeSellerScreen({ navigation }) {
  const { user, token, setUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState(user?.storeName || '');
  const [storeType, setStoreType] = useState(user?.storeType || 'Breeder'); // Breeder, Shop, Shelter
  const [locationText, setLocationText] = useState(user?.location || '');
  const [coords, setCoords] = useState(
    user?.geometry?.coordinates ? { lat: user.geometry.coordinates[1], lng: user.geometry.coordinates[0] } : null
  );
  const [fetchingLoc, setFetchingLoc] = useState(false);

  const handleDetectLocation = async () => {
    setFetchingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location permission to capture store coordinates.');
        setFetchingLoc(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });

      // Reverse geocode
      const rev = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`
      );
      const data = await rev.json();
      if (data && data.display_name) {
        const addressText = data.display_name.split(',').slice(0, 3).join(',').trim();
        setLocationText(addressText);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Failed to detect location coords.');
    } finally {
      setFetchingLoc(false);
    }
  };

  const handleUpdate = async () => {
    if (!storeName.trim() || !locationText.trim()) {
      Alert.alert('Validation Error', 'Store Name and Location are required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        storeName: storeName.trim(),
        storeType,
        location: locationText.trim()
      };

      if (coords) {
        payload.geometry = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat] // [lng, lat]
        };
      }

      const res = await axios.put(`${API_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      Alert.alert('Success', 'Store profile configured successfully!', [
        { text: 'Awesome', onPress: () => navigation.navigate('ProfileTab') }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update store details.');
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
        <Text style={styles.headerTitle}>Store Configuration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Configure Storefront</Text>
        <Text style={styles.sectionSubtitle}>Define your breeding brand or retail store front settings</Text>

        {/* Store Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Storefront Name *</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Royal Golden Kennels"
            value={storeName}
            onChangeText={setStoreName}
          />
        </View>

        {/* Store Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type of Facility</Text>
          <View style={styles.typeRow}>
            {['Breeder', 'Shop', 'Shelter'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, storeType === t && styles.activeTypeBtn]}
                onPress={() => setStoreType(t)}
              >
                <Text style={[styles.typeBtnText, storeType === t && styles.activeTypeText]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Store Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Store Location Address *</Text>
          <View style={styles.locRow}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="e.g. Indiranagar, Bangalore"
              value={locationText}
              onChangeText={setLocationText}
            />
            <TouchableOpacity 
              style={styles.detectBtn}
              onPress={handleDetectLocation}
              disabled={fetchingLoc}
            >
              {fetchingLoc ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <MapPin size={18} color="#3b82f6" />
              )}
            </TouchableOpacity>
          </View>
          {coords && (
            <Text style={styles.coordsText}>
              📍 GPS Coordinates registered: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Save Profile Configurations</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
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
  form: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e3a8a',
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  activeTypeBtn: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  activeTypeText: {
    color: '#ffffff',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detectBtn: {
    backgroundColor: '#eff6ff',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#bfdbfe',
  },
  coordsText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: 'bold',
    marginTop: 6,
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
  }
});
