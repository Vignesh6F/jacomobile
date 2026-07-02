import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import axios from 'axios';
import { ChevronLeft, ShieldCheck, Star, MapPin, Phone, MessageCircle } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function StoreDetailScreen({ route, navigation }) {
  const { sellerId } = route.params;
  const { isLoggedIn } = useContext(AuthContext);

  const [store, setStore] = useState(null);
  const [pets, setPets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState('0.0');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'reviews'

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      // 1. Fetch store info
      const storeRes = await axios.get(`${API_URL}/api/auth/store-profile/${sellerId}`);
      setStore(storeRes.data);

      // 2. Fetch store listings
      const petsRes = await axios.get(`${API_URL}/api/pets/store/${storeRes.data._id}`);
      setPets(petsRes.data);

      // 3. Fetch reviews
      const reviewsRes = await axios.get(`${API_URL}/api/reviews/store/${storeRes.data._id}`);
      setReviews(reviewsRes.data.reviews || []);
      setAverageRating(reviewsRes.data.averageRating || '0.0');
    } catch (err) {
      console.error('Error fetching store profile:', err);
      Alert.alert('Error', 'Failed to retrieve store details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [sellerId]);

  const handleCall = () => {
    if (!store?.phone) {
      Alert.alert('Unavailable', 'Contact number is not available.');
      return;
    }
    Linking.openURL(`tel:${store.phone}`);
  };

  const renderPetItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.petCard}
      onPress={() => navigation.navigate('PetDetail', { id: item._id })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <Text style={styles.petTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.petBreed}>🐕 {item.breed}</Text>
        <Text style={styles.petPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.buyerId?.name || 'Verified Buyer'}</Text>
        <View style={styles.reviewStars}>
          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </View>
      </View>
      <Text style={styles.reviewComment}>"{item.comment}"</Text>
      {item.response && (
        <View style={styles.sellerReply}>
          <Text style={styles.replyTitle}>Reply from Seller:</Text>
          <Text style={styles.replyText}>"{item.response}"</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#64748b' }}>Store not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Banner & absolute back */}
      <View style={styles.banner}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=60' }} 
          style={styles.bannerBg} 
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          {store.profilePhoto ? (
            <Image source={{ uri: store.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarLetter}>
                {(store.storeName || store.name).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.storeDetails}>
            <Text style={styles.storeName} numberOfLines={1}>{store.storeName || store.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <Text style={styles.ratingVal}>{averageRating}</Text>
              <Text style={styles.reviewsCount}>({reviews.length} reviews)</Text>
            </View>
          </View>
        </View>

        {store.location && (
          <View style={styles.locationRow}>
            <MapPin size={12} color="#64748b" />
            <Text style={styles.locationText} numberOfLines={1}>{store.location}</Text>
          </View>
        )}

        <View style={styles.badgesRow}>
          {store.isVerifiedSeller && (
            <View style={styles.badge}>
              <ShieldCheck size={12} color="#1d4ed8" />
              <Text style={styles.badgeText}>Verified Store</Text>
            </View>
          )}
          {store.locationVerified && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Location Verified</Text>
            </View>
          )}
        </View>

        {/* Contact buttons */}
        <View style={styles.contactRow}>
          <TouchableOpacity 
            style={styles.chatBtn}
            onPress={() => {
              if (!isLoggedIn) {
                navigation.navigate('Login');
                return;
              }
              navigation.navigate('Chat', { petId: store._id, sellerId: store._id });
            }}
          >
            <MessageCircle size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
            <Phone size={16} color="#3b82f6" style={{ marginRight: 4 }} />
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'listings' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
            Listings ({pets.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'reviews' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Reviews ({reviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Contents */}
      {activeTab === 'listings' ? (
        <FlatList 
          data={pets}
          renderItem={renderPetItem}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridWrapper}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>This store has no active listings.</Text>
          }
        />
      ) : (
        <FlatList 
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reviews posted yet.</Text>
          }
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  banner: {
    height: 140,
    position: 'relative',
  },
  bannerBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 50,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: -40,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  storeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 0.5,
    borderColor: '#cbd5e1',
    paddingTop: 14,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  callBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    height: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: 'bold',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 16,
    marginTop: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTabBtn: {
    borderColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  gridWrapper: {
    justifyContent: 'space-between',
  },
  petCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  petImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  petInfo: {
    padding: 10,
  },
  petTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  petBreed: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  petPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 4,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  reviewStars: {
    color: '#f59e0b',
    fontSize: 11,
  },
  reviewComment: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  sellerReply: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderColor: '#3b82f6',
    borderRadius: 4,
  },
  replyTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  replyText: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
