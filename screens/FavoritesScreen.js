import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>Saved pet listings you are tracking</Text>
      </View>

      <View style={styles.centered}>
        <View style={styles.iconBox}>
          <Heart size={44} color="#64748b" />
        </View>
        <Text style={styles.emptyTitle}>No Saved Listings Yet</Text>
        <Text style={styles.emptySubtitle}>Tap the heart icon on any listing card to save it here for quick access.</Text>
        
        <TouchableOpacity 
          style={styles.browseBtn}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.browseBtnText}>Browse Marketplace</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconBox: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  browseBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  }
});
