import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { ShieldCheck, MapPin, Search, Compass, MessageCircle, Star } from 'lucide-react-native';
import { API_URL } from '../config';

export default function VerifiedSellersScreen({ navigation }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Location & geo states
  const [district, setDistrict] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isProximity, setIsProximity] = useState(false);
  const [geoStatus, setGeoStatus] = useState('prompt'); // 'prompt', 'locating', 'success', 'denied'
  const [coords, setCoords] = useState(null);

  // Search input fallback
  const [manualLocation, setManualLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const formatDistance = (dist) => {
    if (dist === null || dist === undefined) return '';
    return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  };

  const getSellers = async (lat, lng, distName) => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/auth/verified-sellers`;
      const queryParams = [];
      if (lat && lng) {
        queryParams.push(`lat=${lat}`);
        queryParams.push(`lng=${lng}`);
      }
      if (distName) {
        queryParams.push(`district=${encodeURIComponent(distName)}`);
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await axios.get(url);
      setSellers(response.data.sellers || []);
      setIsProximity(response.data.isProximityResults || false);
    } catch (err) {
      console.error('Error fetching verified sellers:', err);
      Alert.alert('Error', 'Failed to retrieve verified sellers list.');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.address) {
        const address = data.address;
        const resolvedDistrict = address.county || address.state_district || address.city || address.town || '';
        const name = data.display_name;
        
        setDistrict(resolvedDistrict);
        setLocationName(name);
        return { resolvedDistrict, name };
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    }
    return { resolvedDistrict: '', name: '' };
  };

  const requestLocation = async () => {
    setGeoStatus('locating');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoStatus('denied');
        getSellers();
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setCoords({ lat, lng });
      setGeoStatus('success');

      const { resolvedDistrict, name } = await reverseGeocode(lat, lng);
      getSellers(lat, lng, resolvedDistrict);
    } catch (err) {
      console.warn('Geolocation error:', err);
      setGeoStatus('denied');
      getSellers();
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const searchLocation = async (val) => {
    setManualLocation(val);
    if (val.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${val}&format=json&addressdetails=1&limit=5`
      );
      const data = await response.json();
      const results = data.map((item) => {
        const itemDistrict = item.address?.county || item.address?.state_district || item.address?.city || item.address?.town || '';
        return {
          id: item.place_id,
          name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          district: itemDistrict
        };
      });
      setSuggestions(results);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleSelectSuggestion = (item) => {
    setManualLocation(item.name);
    setSuggestions([]);
    setLocationName(item.name);
    setDistrict(item.district);
    setCoords({ lat: item.lat, lng: item.lon });
    setGeoStatus('success');
    getSellers(item.lat, item.lon, item.district);
  };

  const renderSellerItem = ({ item, index }) => {
    const { seller, distance, location: sellerLoc, petCount } = item;
    const rating = (4.5 + (index % 5) * 0.1).toFixed(1);

    return (
      <View style={styles.sellerCard}>
        {/* Banner header inside card */}
        <View style={styles.cardHeader}>
          {distance !== null && (
            <View style={styles.distanceBadge}>
              <MapPin size={11} color="#1e40af" />
              <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          {/* Store Avatar */}
          <View style={styles.avatarContainer}>
            {seller.profilePhoto ? (
              <Image source={{ uri: seller.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>
                  {(seller.storeName || seller.name).charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Store Title */}
          <View style={styles.titleRow}>
            <Text style={styles.storeName}>{seller.storeName || seller.name}</Text>
            <ShieldCheck size={16} color="#3b82f6" />
          </View>

          {/* Stars */}
          <View style={styles.ratingRow}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <Text style={styles.ratingValue}>{rating}</Text>
            <Text style={styles.salesText}>({20 + index * 4} sales)</Text>
          </View>

          {/* Address */}
          <Text style={styles.address} numberOfLines={1}>📍 {sellerLoc || 'Location not set'}</Text>

          {/* Active Pets Listing count */}
          <Text style={styles.listingsCount}>
            🛡️ {petCount > 0 ? `${petCount} Active Postings` : 'No active listings'}
          </Text>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.viewStoreBtn}
              onPress={() => navigation.navigate('StoreDetail', { sellerId: seller._id })}
            >
              <Text style={styles.viewStoreText}>View Store</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Chat', { petId: seller._id, sellerId: seller._id })}
            >
              <MessageCircle size={18} color="#475569" />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verified Stores</Text>
        <Text style={styles.headerSubtitle}>Discover verified breeders & pet store fronts near you</Text>
      </View>

      {/* Geolocation Status / Search */}
      <View style={styles.locationBox}>
        <View style={styles.locationInfoRow}>
          <MapPin size={20} color="#3b82f6" />
          <View style={styles.locationDetails}>
            <Text style={styles.locationLabel}>Search Location</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {geoStatus === 'locating' ? 'Locating...' : 
               geoStatus === 'success' ? (district || locationName.split(',')[0] || 'Current Location') : 
               'Not geolocated'}
            </Text>
          </View>
          <TouchableOpacity style={styles.locateBtn} onPress={requestLocation}>
            <Compass size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Search Suggestion Input */}
        <View style={styles.searchSection}>
          <Search size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type city or district manually..."
            value={manualLocation}
            onChangeText={searchLocation}
          />
        </View>

        {/* Suggestion Dropdown List */}
        {suggestions.length > 0 && (
          <ScrollView style={styles.suggestionsContainer} nestedScrollEnabled={true}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text style={styles.suggestionText} numberOfLines={1}>📍 {item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Match Status Banner */}
      {geoStatus === 'success' && !loading && (
        <View style={[styles.statusBanner, isProximity ? styles.statusProximity : styles.statusDistrict]}>
          <Text style={isProximity ? styles.proximityText : styles.districtText}>
            {isProximity ? '🟢 Showing verified stores within 3 to 5 km radius.' : 
             `🟡 No stores within 3-5 km. Fallback to district base: ${district}`}
          </Text>
        </View>
      )}

      {/* Main Grid List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : sellers.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No verified sellers found in this area.</Text>
        </View>
      ) : (
        <FlatList
          data={sellers}
          renderItem={renderSellerItem}
          keyExtractor={item => item.seller._id}
          contentContainerStyle={styles.sellersGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  locationBox: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
    zIndex: 100,
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 10,
  },
  locationLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  locationValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  locateBtn: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    height: 38,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  suggestionsContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 6,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 12,
    color: '#334155',
  },
  statusBanner: {
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusProximity: {
    backgroundColor: '#ecfdf5',
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
  },
  statusDistrict: {
    backgroundColor: '#fffbeb',
    borderWidth: 0.5,
    borderColor: '#fde68a',
  },
  proximityText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: 'bold',
  },
  districtText: {
    color: '#92400e',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sellersGrid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sellerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardHeader: {
    height: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  cardBody: {
    padding: 16,
    marginTop: -25,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
    backgroundColor: '#cbd5e1',
    marginBottom: 8,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginLeft: 3,
  },
  salesText: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 4,
  },
  address: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  listingsCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewStoreBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
  },
  viewStoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  chatBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
  }
});
