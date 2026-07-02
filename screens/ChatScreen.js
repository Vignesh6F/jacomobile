import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import io from 'socket.io-client';
import { ChevronLeft, Send } from 'lucide-react-native';
import { API_URL } from '../config';
import { AuthContext } from '../App';

export default function ChatScreen({ route, navigation }) {
  const { petId, sellerId } = route.params;
  const { user, token } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Generate unique room ID just like web client
  const chatRoomId = [petId, sellerId, user?._id].sort().join('_');

  useEffect(() => {
    // 1. Fetch initial chat history
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/messages/history/${chatRoomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // 2. Setup socket connection
    socketRef.current = io(API_URL, {
      auth: { token }
    });

    socketRef.current.emit('joinRoom', { chatRoomId });

    // 3. Listen for new messages
    socketRef.current.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatRoomId]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const messageData = {
      chatRoomId,
      senderId: user._id,
      text: inputText,
      createdAt: new Date().toISOString()
    };

    // Emit via socket
    socketRef.current.emit('sendMessage', messageData);
    setInputText('');
  };

  const renderMessageItem = ({ item }) => {
    const isMine = item.senderId === user?._id;
    return (
      <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>
          {item.text}
        </Text>
        <Text style={styles.timeText}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Chat</Text>
      </View>

      {/* Message List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input Tray */}
      <View style={styles.inputTray}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: '#ffffff',
  },
  theirText: {
    color: '#1e293b',
  },
  timeText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputTray: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 50,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
