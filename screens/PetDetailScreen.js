import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Share, Alert } from 'react-native';
import axios from 'axios';
import { ChevronLeft, Share2, MapPin, Calendar, Heart, Shield, Award, MessageSquare, Phone } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function PetDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { isLoggedIn, user: currentUser } = useContext(AuthContext);
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const fetchPetDetail = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pets/${id}`);
      setPet(response.data);
    } catch (err) {
      console.error('Error fetching pet details:', err);
      Alert.alert('Error', 'Failed to retrieve pet details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetDetail();
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this beautiful ${pet?.breed} "${pet?.title}" on Jacotail for ₹${pet?.price}!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCall = () => {
    if (!pet?.sellerId?.phone) {
      Alert.alert('Unavailable', 'Contact number is not available.');
      return;
    }
    Linking.openURL(`tel:${pet.sellerId.phone}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#64748b' }}>Pet listing not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Absolute top action header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerActionBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={handleShare}>
            <Share2 size={20} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => setIsSaved(!isSaved)}>
            <Text style={{ fontSize: 18 }}>{isSaved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carousel Image */}
        <Image 
          source={{ uri: pet.images[0] || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=60' }} 
          style={styles.heroImage} 
        />

        <View style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <Text style={styles.tag}>🐕 {pet.breed}</Text>
            {pet.createdAt && (
              <Text style={styles.tag}>
                📅 {new Date(pet.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            )}
          </View>

          {/* Title & Price */}
          <Text style={styles.title}>{pet.title}</Text>
          <Text style={styles.price}>₹{pet.price.toLocaleString('en-IN')}</Text>

          {/* Location */}
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#3b82f6" />
            <Text style={styles.locationText}>{pet.location}</Text>
          </View>

          {/* Verification Badges Grid */}
          <View style={styles.badgesGrid}>
            {pet.sellerId?.isVerifiedSeller && (
              <View style={[styles.badgeItem, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                <Shield size={14} color="#1d4ed8" />
                <Text style={[styles.badgeText, { color: '#1d4ed8' }]}>Verified Store</Text>
              </View>
            )}
            {pet.vaccinated && (
              <View style={[styles.badgeItem, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                <Award size={14} color="#047857" />
                <Text style={[styles.badgeText, { color: '#047857' }]}>Vaccinated</Text>
              </View>
            )}
            {pet.kciCertified && (
              <View style={[styles.badgeItem, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
                <Award size={14} color="#b45309" />
                <Text style={[styles.badgeText, { color: '#b45309' }]}>KCI Certified</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Pet</Text>
            <Text style={styles.description}>{pet.description}</Text>
          </View>

          {/* Seller / Store Information Card */}
          {pet.sellerId && (
            <View style={styles.sellerCard}>
              <View style={styles.sellerProfileRow}>
                {pet.sellerId.profilePhoto ? (
                  <Image source={{ uri: pet.sellerId.profilePhoto }} style={styles.sellerAvatar} />
                ) : (
                  <View style={[styles.sellerAvatar, styles.sellerAvatarPlaceholder]}>
                    <Text style={styles.avatarLetter}>
                      {(pet.sellerId.storeName || pet.sellerId.name).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>{pet.sellerId.storeName || pet.sellerId.name}</Text>
                  <Text style={styles.sellerRole}>{pet.sellerId.role === 'store' ? 'Store Front' : 'Private Seller'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.visitStoreBtn}
                onPress={() => navigation.navigate('StoreDetail', { sellerId: pet.sellerId._id })}
              >
                <Text style={styles.visitStoreText}>Visit Store Profile →</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Floating Action footer for calls and messaging */}
      <View style={styles.footerActions}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => {
            if (!isLoggedIn) {
              navigation.navigate('Login');
              return;
            }
            navigation.navigate('Chat', { petId: pet._id, sellerId: pet.sellerId._id });
          }}
        >
          <MessageSquare size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.chatButtonText}>Instant Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.callButton}
          onPress={handleCall}
        >
          <Phone size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.callButtonText}>Call Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  heroImage: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#ffffff',
    marginTop: -20,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3b82f6',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    borderTopWidth: 0.5,
    borderColor: '#e2e8f0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '750',
    color: '#0f172a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  sellerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 30,
  },
  sellerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sellerAvatarPlaceholder: {
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sellerDetails: {
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '750',
    color: '#0f172a',
  },
  sellerRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  visitStoreBtn: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderColor: '#cbd5e1',
    paddingTop: 12,
  },
  visitStoreText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  footerActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  chatButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  callButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  }
});
