import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { MessageSquare } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function MessagesScreen({ navigation }) {
  const { isLoggedIn, token, user } = useContext(AuthContext);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchThreads = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/messages/threads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreads(response.data || []);
    } catch (err) {
      console.error('Error fetching chat threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchThreads();
    }
  }, [isLoggedIn]);

  const renderThreadItem = ({ item }) => {
    // Determine the participant details
    const otherParticipant = item.participants?.find(p => p._id !== user?._id) || { name: 'Unknown Store' };
    
    return (
      <TouchableOpacity
        style={styles.threadItem}
        onPress={() => navigation.navigate('Chat', { petId: item.petId || otherParticipant._id, sellerId: otherParticipant._id })}
      >
        <View style={styles.threadAvatar}>
          <Text style={styles.avatarLetter}>{otherParticipant.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.threadInfo}>
          <View style={styles.threadHeader}>
            <Text style={styles.threadName}>{otherParticipant.storeName || otherParticipant.name}</Text>
            <Text style={styles.threadTime}>
              {new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessageText || 'Tap to chat with seller'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.centered}>
          <MessageSquare size={44} color="#64748b" style={{ marginBottom: 12 }} />
          <Text style={styles.guestText}>Please log in to chat with sellers.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <Text style={styles.headerSubtitle}>Instant conversations with stores</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : threads.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.iconBox}>
            <MessageSquare size={44} color="#64748b" />
          </View>
          <Text style={styles.emptyTitle}>No Conversations yet</Text>
          <Text style={styles.emptySubtitle}>Start a chat directly from any pet listing detail page.</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThreadItem}
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
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
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
  guestText: {
    color: '#64748b',
    fontSize: 14,
  },
  iconBox: {
    backgroundColor: '#f8fafc',
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
  },
  list: {
    paddingVertical: 8,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#f1f5f9',
  },
  threadAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  threadInfo: {
    flex: 1,
    marginLeft: 12,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  threadTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  lastMessage: {
    fontSize: 13,
    color: '#64748b',
  }
});
