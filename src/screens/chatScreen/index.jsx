import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';
import ContactAvatarList from '../../components/contactAvatarList';
import ChatComposer from '../../components/chatComposer';
import ConversationList from '../../components/conversationList';
import { useChatPresence } from '../../context/ChatContext';
import { useChatContacts } from '../../hook/useChatContacts';

const ChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const onlineUsers = useChatPresence();
  const onlineCount = Object.values(onlineUsers || {}).filter(status => status).length;
  const { contactList: chatContacts, fetchChatContacts } = useChatContacts();
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const selectedReceipentId = route?.params?.selectedReceipentId;

  useEffect(() => {
    fetchChatContacts();
  }, [fetchChatContacts]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardPadding(16));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardPadding(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: keyboardPadding }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={Platform.OS === 'ios'}
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
        selectedReceipentId={selectedReceipentId}
      />
      {/* MESSAGE LIST */}
      <View style={{ flex: 1 }}>
        {chatContacts.length === 0 ? (
          <View style={[styles.chatContentEmpty, { justifyContent: 'center' }]}>
            <View style={styles.emptyStateWrapper}>
              <View style={styles.emptyStateIconCircle}>
                <Icon name="person-search" size={28} color="#8FA3C8" />
              </View>
              <Text style={styles.emptyStateTitle}>No Contacts Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add a trusted contact to start chatting and sharing SOS updates.
              </Text>
              <TouchableOpacity
                style={{ marginTop: 14 }}
                onPress={() => navigation.navigate('AddContact')}
              >
                <Text style={{ color: '#4DA3FF', fontWeight: '700' }}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ConversationList
            styles={styles}
          />
        )}
      </View>

      {chatContacts.length > 0 ? (<ChatComposer />) : null}
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
