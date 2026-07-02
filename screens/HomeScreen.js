import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { Search, MapPin, Heart, ShieldAlert, Star } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function HomeScreen({ navigation }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  const categories = [
    { name: 'All', value: 'All', icon: '✨' },
    { name: 'Dog', value: 'Dog', icon: '🐕' },
    { name: 'Cat', value: 'Cat', icon: '🐈' },
    { name: 'Fish', value: 'Fish', icon: '🐟' },
    { name: 'Bird', value: 'Parrots', icon: '🐦' }
  ];

  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/pets`);
      setPets(response.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const toggleFavorite = (petId) => {
    if (favorites.includes(petId)) {
      setFavorites(favorites.filter(id => id !== petId));
    } else {
      setFavorites([...favorites, petId]);
    }
  };

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || pet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderPetItem = ({ item }) => {
    const isFav = favorites.includes(item._id);
    const sellerRating = '4.8';
    
    return (
      <TouchableOpacity 
        style={styles.petCard}
        onPress={() => navigation.navigate('PetDetail', { id: item._id })}
      >
        <Image 
          source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=60' }} 
          style={styles.petImage} 
        />
        
        <TouchableOpacity 
          style={styles.favButton}
          onPress={() => toggleFavorite(item._id)}
        >
          <Text style={{ fontSize: 16 }}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        <View style={styles.petInfo}>
          <Text style={styles.petTitle} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.tagRow}>
            <Text style={styles.breedTag}>🐕 {item.breed}</Text>
            {item.sellerId?.isVerifiedSeller && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('VerifiedSellersTab')}
                style={styles.verifiedTag}
              >
                <Text style={styles.verifiedTagText}>✅ Verified Store</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.locationRow}>
            <MapPin size={12} color="#64748b" />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>

          {item.sellerId && (
            <View style={styles.sellerRow}>
              <Text style={styles.sellerName} numberOfLines={1}>👤 {item.sellerId.storeName || item.sellerId.name}</Text>
              <Text style={styles.ratingText}>⭐ {sellerRating}</Text>
            </View>
          )}

          <Text style={styles.price}>₹{item.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jacotail</Text>
        <Text style={styles.headerSubtitle}>Find your pet from verified sellers</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#94a3b8" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search breeds, titles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories Pills */}
      <View style={{ height: 48, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.value}
              style={[
                styles.categoryPill, 
                selectedCategory === cat.value && styles.activeCategoryPill
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === cat.value && styles.activeCategoryText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredPets.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No listings found matching filters.</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredPets}
          renderItem={renderPetItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
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
    fontSize: 28,
    fontWeight: '900',
    color: '#1e3a8a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeCategoryPill: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  activeCategoryText: {
    color: '#ffffff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  petCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  petImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  favButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 50,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
  },
  petInfo: {
    padding: 14,
  },
  petTitle: {
    fontSize: 16,
    fontWeight: '750',
    color: '#0f172a',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  breedTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTag: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderTopWidth: 0.5,
    borderColor: '#e2e8f0',
    paddingTop: 8,
  },
  sellerName: {
    fontSize: 12,
    color: '#64748b',
    maxWidth: '80%',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3b82f6',
    marginTop: 4,
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
