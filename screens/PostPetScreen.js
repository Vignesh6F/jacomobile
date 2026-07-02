import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { ChevronLeft, MapPin, Plus } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function PostPetScreen({ navigation }) {
  const { user, token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [breed, setBreed] = useState('');
  const [category, setCategory] = useState('Dog'); // Dog, Cat, Fish, Parrots
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [vaccinated, setVaccinated] = useState(false);
  const [kciCertified, setKciCertified] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState(null);
  const [fetchingLoc, setFetchingLoc] = useState(false);

  // Auto-detect seller coordinates for high accuracy listing proximity
  const handleAutoDetectLocation = async () => {
    setFetchingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location permission to auto-detect coordinates.');
        setFetchingLoc(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });

      // Reverse geocode to text
      const rev = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
      );
      const data = await rev.json();
      if (data && data.display_name) {
        // Truncate to first 3 elements for card display
        const parts = data.display_name.split(',').slice(0, 3).join(',').trim();
        setLocationText(parts);
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Detection Failed', 'Could not fetch your coordinates. Please enter manually.');
    } finally {
      setFetchingLoc(false);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !breed.trim() || !price.trim() || !locationText.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        breed,
        category,
        price: parseFloat(price),
        description,
        vaccinated,
        kciCertified,
        location: locationText,
        // Mock images for mobile listing demo
        images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=60']
      };

      if (coords) {
        payload.geometry = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat] // [lng, lat]
        };
      }

      const res = await axios.post(`${API_URL}/api/pets`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Your pet has been successfully listed!', [
        { text: 'Great', onPress: () => navigation.navigate('HomeTab') }
      ]);
    } catch (err) {
      console.error(err);
      // If payment status code or not subscribed
      if (err.response && err.response.status === 403) {
        Alert.alert(
          'Subscription Required',
          'You need an active plan to post a pet listing.',
          [
            { text: 'View Plans', onPress: () => navigation.navigate('Subscribe') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to list pet. Please try again.');
      }
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
        <Text style={styles.headerTitle}>List a Pet</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Listing Title *</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Playful Golden Retriever Puppy"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Breed */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed *</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Golden Retriever"
            value={breed}
            onChangeText={setBreed}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.catRow}>
            {['Dog', 'Cat', 'Fish', 'Parrots'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.activeCatBtn]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catBtnText, category === cat && styles.activeCatText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price (INR) *</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. 15000"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Location Det */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location / Address *</Text>
          <View style={styles.locInputWrapper}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="e.g. Indiranagar, Bengaluru"
              value={locationText}
              onChangeText={setLocationText}
            />
            <TouchableOpacity 
              style={styles.detectBtn} 
              onPress={handleAutoDetectLocation}
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
              📍 GPS Coordinates detected: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Switces */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vaccination Records available</Text>
          <Switch 
            value={vaccinated}
            onValueChange={setVaccinated}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={vaccinated ? '#3b82f6' : '#f1f5f9'}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>KCI Registration Certified</Text>
          <Switch 
            value={kciCertified}
            onValueChange={setKciCertified}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={kciCertified ? '#3b82f6' : '#f1f5f9'}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Listing Details</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Describe temperament, history, vaccination dates, diet details etc."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={handlePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Post Listing Now</Text>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  catBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  activeCatBtn: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  catBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  activeCatText: {
    color: '#ffffff',
  },
  locInputWrapper: {
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
