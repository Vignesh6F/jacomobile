import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { User, Shield, Key, LogOut, ArrowRight, Settings } from 'lucide-react-native';
import { AuthContext } from '../App';

export default function ProfileScreen({ navigation }) {
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => logout() }
    ]);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestIconBox}>
          <User size={64} color="#3b82f6" />
        </View>
        <Text style={styles.guestTitle}>Join Jacotail</Text>
        <Text style={styles.guestSubtitle}>
          Create an account to post pet listings, save favorites, chat with verified stores, and scale your storefront.
        </Text>
        
        <TouchableOpacity 
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>Log In to Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.secondaryBtnText}>Register New Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header Profile card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarContainer}>
          {user.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        <View style={styles.planBadge}>
          <Text style={styles.planText}>
            Role: {user.role === 'store' ? 'Store Front 🏢' : user.role === 'seller' ? 'Seller 👤' : 'Pet Lover 🐕'}
          </Text>
        </View>
      </View>

      {/* Subscription Status Panel */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Shield size={18} color="#3b82f6" />
          <Text style={styles.sectionTitle}>Seller Account status</Text>
        </View>
        
        <View style={styles.subscriptionBox}>
          {user.isSubscribed ? (
            <View>
              <Text style={styles.activePlanText}>
                Active Subscription Plan: {user.subscriptionPlan ? user.subscriptionPlan.toUpperCase() : 'STANDARD'}
              </Text>
              <Text style={styles.expiryText}>
                Valid Until: {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.noPlanText}>No active seller subscription found.</Text>
              <TouchableOpacity 
                style={styles.upgradeBtn}
                onPress={() => navigation.navigate('Subscribe')}
              >
                <Text style={styles.upgradeBtnText}>Subscribe & List Pets →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuCard}>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('PostPet')}
        >
          <View style={styles.menuItemLeft}>
            <Text style={{ fontSize: 16, marginRight: 10 }}>✍️</Text>
            <Text style={styles.menuItemText}>Post New Pet Listing</Text>
          </View>
          <ArrowRight size={16} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('BecomeSeller')}
        >
          <View style={styles.menuItemLeft}>
            <Text style={{ fontSize: 16, marginRight: 10 }}>🏢</Text>
            <Text style={styles.menuItemText}>Configure Store Profile</Text>
          </View>
          <ArrowRight size={16} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Subscribe')}
        >
          <View style={styles.menuItemLeft}>
            <Text style={{ fontSize: 16, marginRight: 10 }}>💎</Text>
            <Text style={styles.menuItemText}>Upgrade Subscription Plans</Text>
          </View>
          <ArrowRight size={16} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <LogOut size={18} color="#ef4444" style={{ marginRight: 10 }} />
            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Log Out of Account</Text>
          </View>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  guestIconBox: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Profile styles
  profileHeaderCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#cbd5e1',
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 0.5,
    borderColor: '#bfdbfe',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  planText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1d4ed8',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '750',
    color: '#0f172a',
    marginLeft: 6,
  },
  subscriptionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  activePlanText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10b981',
  },
  expiryText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  noPlanText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 10,
  },
  upgradeBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  }
});
