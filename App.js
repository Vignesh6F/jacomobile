import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Image, View, ActivityIndicator } from 'react-native';
import { Home as HomeIcon, ShieldAlert, Heart, MessageCircle, User as UserIcon } from 'lucide-react-native';

// Import Screens
import HomeScreen from './screens/HomeScreen';
import VerifiedSellersScreen from './screens/VerifiedSellersScreen';
import PetDetailScreen from './screens/PetDetailScreen';
import StoreDetailScreen from './screens/StoreDetailScreen';
import ChatScreen from './screens/ChatScreen';
import SubscribeScreen from './screens/SubscribeScreen';
import PostPetScreen from './screens/PostPetScreen';
import BecomeSellerScreen from './screens/BecomeSellerScreen';
import MessagesScreen from './screens/MessagesScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Create Auth Context
export const AuthContext = createContext();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator Setup
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeTab') return <HomeIcon size={size} color={color} />;
          if (route.name === 'VerifiedSellersTab') return <ShieldAlert size={size} color={color} />;
          if (route.name === 'MessagesTab') return <MessageCircle size={size} color={color} />;
          if (route.name === 'FavoritesTab') return <Heart size={size} color={color} />;
          if (route.name === 'ProfileTab') return <UserIcon size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="VerifiedSellersTab" component={VerifiedSellersScreen} options={{ title: 'Verified Stores' }} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ title: 'Favorites' }} />
      <Tab.Screen name="MessagesTab" component={MessagesScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock checking local session storage (we simulate localStorage using a simple mock storage or state since AsyncStorage requires additional native setup)
  useEffect(() => {
    const checkSession = async () => {
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, setUser }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="PetDetail" component={PetDetailScreen} />
          <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Subscribe" component={SubscribeScreen} />
          <Stack.Screen name="PostPet" component={PostPetScreen} />
          <Stack.Screen name="BecomeSeller" component={BecomeSellerScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
