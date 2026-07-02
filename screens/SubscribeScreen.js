import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import axios from 'axios';
import { ShieldCheck, ChevronLeft, CreditCard } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function SubscribeScreen({ navigation }) {
  const { user, token, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  // Simulated checkout state
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockData, setMockData] = useState({ plan: '', amount: 0, orderId: '' });

  const handleSubscribe = async (plan, amount) => {
    setLoading(true);
    try {
      if (!token) {
        Alert.alert('Login Required', 'Please login first to subscribe.');
        setLoading(false);
        return;
      }

      // Create order on backend
      const orderRes = await axios.post(
        `${API_URL}/api/payment/create-order`,
        { amount: amount * 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      if (order.mock) {
        setMockData({ plan, amount, orderId: order.id });
        setShowMockModal(true);
      } else {
        // If they configured real Razorpay keys, let them know we fallback to simulated flow for standard Expo Go setups.
        setMockData({ plan, amount, orderId: order.id });
        setShowMockModal(true);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      Alert.alert('Error', 'Failed to initialize checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMockPayment = async () => {
    setLoading(true);
    setShowMockModal(false);
    try {
      const verifyRes = await axios.post(
        `${API_URL}/api/payment/verify`,
        {
          plan: mockData.plan,
          razorpay_order_id: mockData.orderId,
          razorpay_payment_id: 'mock_mobile_payment_' + Math.random().toString(36).substring(7),
          razorpay_signature: 'mock_mobile_signature_' + Math.random().toString(36).substring(7),
          amount: mockData.amount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (verifyRes.data.user) {
        setUser(verifyRes.data.user);
      }

      Alert.alert(
        'Success', 
        `Subscription to ${mockData.plan.toUpperCase()} plan activated successfully!`,
        [
          { text: 'Awesome', onPress: () => navigation.navigate('BecomeSeller') }
        ]
      );
    } catch (err) {
      console.error('Verification error:', err);
      Alert.alert('Failed', 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'starter',
      price: 249,
      description: 'Ideal for hobbyists and individual sellers',
      features: [
        '30 listings / month',
        'Listings valid for 60 days',
        'Standard search ranking',
        'Unlimited buyer chats'
      ]
    },
    {
      name: 'growth',
      price: 499,
      description: 'Best choice for active breeders',
      features: [
        '100 listings / month',
        'Listings valid for 60 days',
        'Better search ranking boost',
        'Analytics & leads tracking',
        'Unlimited buyer chats'
      ],
      featured: true
    },
    {
      name: 'pro',
      price: 999,
      description: 'Ultimate scaling for shops & stores',
      features: [
        'Unlimited listings / month',
        'Featured Store badge',
        'Priority search placement',
        'Direct promotions panel',
        'Advanced storefront analytics'
      ]
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.introTitle}>Choose Your Plan</Text>
        <Text style={styles.introSubtitle}>Select a plan to start listing your pets and connect with buyers</Text>

        {plans.map((p) => (
          <View 
            key={p.name} 
            style={[
              styles.planCard, 
              p.featured && styles.featuredCard
            ]}
          >
            {p.featured && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>RECOMMENDED</Text>
              </View>
            )}

            <Text style={[styles.planName, p.featured && styles.textWhite]}>
              {p.name.toUpperCase()}
            </Text>
            
            <Text style={[styles.planDesc, p.featured && styles.textLightBlue]}>
              {p.description}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={[styles.priceSym, p.featured && styles.textWhite]}>₹</Text>
              <Text style={[styles.priceVal, p.featured && styles.textWhite]}>{p.price}</Text>
              <Text style={[styles.priceFreq, p.featured && styles.textLightBlue]}> / month</Text>
            </View>

            <View style={styles.divider} />

            {p.features.map((feat, idx) => (
              <Text 
                key={idx} 
                style={[styles.featureItem, p.featured && styles.textWhite]}
              >
                ✓ {feat}
              </Text>
            ))}

            <TouchableOpacity 
              style={[
                styles.selectBtn,
                p.featured ? styles.selectBtnFeatured : styles.selectBtnStandard
              ]}
              onPress={() => handleSubscribe(p.name, p.price)}
              disabled={loading}
            >
              <Text style={[
                styles.selectBtnText,
                p.featured ? styles.selectBtnTextFeatured : styles.selectBtnTextStandard
              ]}>
                {loading ? 'Processing...' : `Choose ${p.name.charAt(0).toUpperCase() + p.name.slice(1)}`}
              </Text>
            </TouchableOpacity>

          </View>
        ))}
      </ScrollView>

      {/* Mock Razorpay Checkout Modal */}
      <Modal
        visible={showMockModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setShowMockModal(false); setLoading(false); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <CreditCard size={20} color="#ffffff" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.modalHeaderTitle}>RAZORPAY SECURE CHECKOUT</Text>
                <Text style={styles.modalHeaderSubtitle}>Simulated Mobile Environment</Text>
              </View>
            </View>

            {/* Merchant Details */}
            <View style={styles.merchantBox}>
              <View>
                <Text style={styles.merchantLabel}>MERCHANT</Text>
                <Text style={styles.merchantValue}>Jacotail Store</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.merchantLabel}>AMOUNT</Text>
                <Text style={styles.merchantPrice}>₹{mockData.amount}</Text>
              </View>
            </View>

            {/* Details Form fields */}
            <View style={styles.formContainer}>
              <Text style={styles.formSectionTitle}>Mock Credit Card details</Text>
              
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>CARD NUMBER</Text>
                <TextInput 
                  style={styles.disabledInput}
                  value="4111 •••• •••• 1111"
                  editable={false}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputBox, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>EXPIRY</Text>
                  <TextInput 
                    style={styles.disabledInput}
                    value="12 / 30"
                    editable={false}
                  />
                </View>
                <View style={[styles.inputBox, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput 
                    style={styles.disabledInput}
                    value="•••"
                    secureTextEntry
                    editable={false}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.payBtn}
                onPress={handleConfirmMockPayment}
              >
                <Text style={styles.payBtnText}>🔒 Pay ₹{mockData.amount} (Simulate)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelLink}
                onPress={() => { setShowMockModal(false); setLoading(false); }}
              >
                <Text style={styles.cancelLinkText}>Cancel and return to store</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 8,
  },
  introSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  featuredCard: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    transform: [{ scale: 1.02 }],
  },
  recommendedBadge: {
    backgroundColor: '#f59e0b',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  recommendedText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceSym: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3b82f6',
  },
  priceVal: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3b82f6',
  },
  priceFreq: {
    fontSize: 12,
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    opacity: 0.5,
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 18,
  },
  textWhite: {
    color: '#ffffff',
  },
  textLightBlue: {
    color: 'rgba(255,255,255,0.7)',
  },
  selectBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  selectBtnStandard: {
    backgroundColor: '#3b82f6',
  },
  selectBtnFeatured: {
    backgroundColor: '#ffffff',
  },
  selectBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectBtnTextStandard: {
    color: '#ffffff',
  },
  selectBtnTextFeatured: {
    color: '#3b82f6',
  },
  // Modal layout
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    padding: 16,
  },
  modalHeaderTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalHeaderSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
  },
  merchantBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  merchantLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
  },
  merchantValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  merchantPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e40af',
  },
  formContainer: {
    padding: 16,
  },
  formSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 10,
  },
  inputBox: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 4,
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    color: '#64748b',
  },
  formRow: {
    flexDirection: 'row',
  },
  payBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  payBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  cancelLinkText: {
    fontSize: 12,
    color: '#64748b',
    textDecorationLine: 'underline',
  }
});
