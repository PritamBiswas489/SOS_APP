import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './style';
import ContactAvatarList from '../../components/contactAvatarList';
import ChatComposer from '../../components/chatComposer';
import ConversationList from '../../components/conversationList';
import { useChatPresence } from '../../context/ChatContext';

const ChatScreen = () => {
  const navigation = useNavigation();
  const onlineUsers = useChatPresence();
  const onlineCount = Object.values(onlineUsers || {}).filter(status => status).length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* FIXED HEADER */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.subtitle}> {onlineCount} online</Text>
        </View>
      </View>

      {/* FIXED AVATAR ROW */}
      <ContactAvatarList
        navigation={navigation}
        
      />
      {/* MESSAGE LIST */}
      <ConversationList
        styles={styles}
      />

      <ChatComposer />
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
