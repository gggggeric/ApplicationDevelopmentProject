import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  SafeAreaView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showToast } from '../../utils/toast';
import API_BASE_URL from '../../utils/api';

const AIChatbot = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your AI Driving Assistant. How can I help you today?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

const handleSend = async () => {
  if (!input.trim()) return;
  
  const userMessage = { 
    text: input, 
    sender: 'user',
    timestamp: new Date() 
  };
  
  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setIsLoading(true);
  Keyboard.dismiss();
  
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input,
        history: messages
          .filter(msg => msg.sender !== 'system') // Exclude system messages
          .map(msg => ({
            text: msg.text,
            sender: msg.sender
          }))
      }),
    });
    
    const data = await response.json();
    
    const botMessage = { 
      text: data.response, 
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.error('Chat error:', error);
    showToast('error', 'Chat Error', 'Failed to get response from AI');
    
    // Add error message to chat
    const errorMessage = { 
      text: "Sorry, I'm having trouble responding. Please try again later.", 
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#504B38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Driving Assistant</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message, index) => (
          <View 
            key={index} 
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text style={[
              styles.messageText,
              message.sender === 'user' ? styles.userText : styles.botText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <Text style={styles.messageText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything about driving..."
          placeholderTextColor="#B9B28A"
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={isLoading}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={input.trim() ? '#504B38' : '#B9B28A'} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3D9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5C2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#504B38',
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE5C2',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#504B38',
  },
  messageText: {
    fontSize: 16,
  },
  botText: {
    color: '#504B38',
  },
  userText: {
    color: '#F8F3D9',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
    color: '#B9B28A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 20,
    backgroundColor: '#F8F3D9',
    borderTopWidth: 1,
    borderTopColor: '#EBE5C2',
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EBE5C2',
    color: '#504B38',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
  },
});

export default AIChatbot;