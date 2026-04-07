import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import styles from './style';
import { useSelector, useDispatch } from 'react-redux';
import { chatSelectedTrustedContactActions } from '../../store/redux/chatSelectedTrustedContact.redux';
import ContactAvatarList from '../../components/contactAvatarList';
 import { useChat } from '../../context/ChatContext';
 import api from '../../config/authApiFormData.config';
 import { getAppUrl } from '../../config/utility';

const getMessageTimestamp = message => {
  return (
    message?.timestamp ||
    message?.createdAt ||
    message?.created_at ||
    message?.sentAt ||
    message?.sent_at ||
    message?.updatedAt ||
    null
  );
};

const getDateKey = timestamp => {
  if (!timestamp) return 'unknown-date';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'unknown-date';
  return date.toISOString().split('T')[0];
};

const formatDateSeparator = timestamp => {
  if (!timestamp) return 'Unknown date';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday - startOfMessageDay) / 86400000);

  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date).toUpperCase();
};

const formatMessageTime = timestamp => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const buildConversationItems = (messages, selectedContact, statuses = {}) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const sortedMessages = [...messages].sort((firstMessage, secondMessage) => {
    const firstTime = new Date(getMessageTimestamp(firstMessage) || 0).getTime();
    const secondTime = new Date(getMessageTimestamp(secondMessage) || 0).getTime();
    return firstTime - secondTime;
  });

  const items = [];
  let lastDateKey = null;

  sortedMessages.forEach(message => {
    const timestamp = getMessageTimestamp(message);
    const dateKey = getDateKey(timestamp);

    if (dateKey !== lastDateKey) {
      items.push({
        id: `date-${dateKey}`,
        type: 'day',
        text: formatDateSeparator(timestamp),
      });
      lastDateKey = dateKey;
    }

    items.push({
      id: message?.id ? `message-${message.id}` : `message-${dateKey}-${items.length}`,
      type: message?.isSelf ? 'right' : 'left',
      text: message?.text || message?.message || '',
      mediaUrl: message?.mediaUrl || message?.media_url || null,
      mediaType: message?.mediaType || message?.media_type || null,
      time: formatMessageTime(timestamp),
      status: statuses[message?.id] || message?.status || null,
      avatarStyle: message?.isSelf ? undefined : styles.avatarSmallBlue,
      avatarText: message?.isSelf
        ? 'Y'
        : (selectedContact?.initial || selectedContact?.name?.charAt(0) || 'U'),
    });
  });

  return items;
};
 
const ChatScreen = () => {
  const [message, setMessage] = useState("");
  const [selectedMedia, setselectedMedia] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadingLocalUri, setUploadingLocalUri] = useState(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const chatContext = useChat();
  const flatListRef = useRef(null);
  const lastSeenMessageKeyRef = useRef(null);
   
  const chatSelectedTrustedContact = useSelector(state => state.chatSelectedTrustedContact);
  const userData = useSelector(state => state.userProviderData);
   
  const onlineCount = Object.values(chatContext?.onlineUsers || {}).filter(status => status).length;
  const currentUserId = userData?.id;

   
const renderStatusIcon = status => {
  if (!status) return null;
  
  if (status === 'read') {
    return (
      <Icon name="done-all" size={14} color="#2ED573" style={{ marginLeft: 4 }} />
    );
  }
  
  if (status === 'delivered') {
    return (
      <Icon name="done-all" size={14} color="#8FA3C8" style={{ marginLeft: 4 }} />
    );
  }
  
  if (status === 'sent') {
    return (
      <Icon name="done" size={14} color="#8FA3C8" style={{ marginLeft: 4 }} />
    );
  }
  
  return null;
};

  const renderMediaContent = item => {
    if (!item.mediaUrl) return null;

    if (item.mediaType === 'image') {
      return (
        <Image
          source={{ uri: item.mediaUrl }}
          style={styles.mediaBubbleImage}
          resizeMode="cover"
        />
      );
    }

    if (item.mediaType === 'video') {
      return (
        <View style={styles.mediaBubbleVideo}>
          <View style={styles.mediaBubblePlayBtn}>
            <Icon name="play-arrow" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.mediaBubbleLabel}>Video</Text>
        </View>
      );
    }

    if (item.mediaType === 'audio') {
      return (
        <View style={styles.mediaBubbleAudio}>
          <Icon name="headset" size={22} color="#FFFFFF" />
          <Text style={styles.mediaBubbleLabel}>Audio message</Text>
        </View>
      );
    }

    if (item.mediaType === 'document') {
      return (
        <View style={styles.mediaBubbleDocument}>
          <Icon name="insert-drive-file" size={22} color="#FFFFFF" />
          <Text style={styles.mediaBubbleLabel}>Document</Text>
        </View>
      );
    }

    return null;
  };

  const renderChatItem = ({ item }) => {

    console.log('=====================================================');
    console.log('Rendering chat item:', item);
    console.log('=====================================================');
    if (item.type === 'day') {
      return <Text style={styles.dayLabel}>{item.text}</Text>;
    }

    if (item.type === 'sos') {
      return (
        <View style={styles.sosContainer}>
          <View style={styles.sosCard}>
            <View style={styles.sosBadge}>
              <Text style={styles.sosBadgeText}>🚨 SOS TRIGGERED</Text>
            </View>

            <Text style={styles.sosMessage}>
              I need help! Sending my live location now.
            </Text>
          </View>
        </View>
      );
    }

    if (item.type === 'location') {
      return (
        <View style={styles.locationContainer}>
          <View style={styles.locationCard}>
            <Icon name="location-pin" size={16} color="#ff3b5c" />
            <Text style={styles.locationText}>Live GPS · MG Road, Bengaluru</Text>
          </View>
        </View>
      );
    }

    if (item.type === 'sosTime') {
      return (
        <View style={styles.sosTimeRow}>
          <Text style={styles.sosTimeText}>9:41 AM · Sent to all</Text>
          <View style={styles.avatarSmallPink}>
            <Text style={styles.avatarSmallText}>S</Text>
          </View>
        </View>
      );
    }

    if (item.type === 'left') {
      return (
        <View style={styles.bubbleLeftWrapper}>
          <View style={styles.bubbleLeft}>
            {renderMediaContent(item)}
            {!!item.text && <Text style={styles.messageText}>{item.text}</Text>}
          </View>

          <View style={styles.messageFooterLeft}>
            <View style={item.avatarStyle}>
              <Text style={styles.avatarSmallText}>{item.avatarText}</Text>
            </View>
            <Text style={styles.timeLeftInline}>{item.time}</Text>
             
          </View>
        </View>
      );
    }

    if (item.type === 'right') {
      return (
        <View>
          <View style={styles.messageRowRight}>
            <View style={styles.bubbleRight}>
              {renderMediaContent(item)}
              {!!item.text && <Text style={styles.messageText}>{item.text}</Text>}
            </View>

            <View style={styles.avatarSmallPink}>
              <Text style={styles.avatarSmallText}>{item.avatarText}</Text>
            </View>
          </View>

          <View style={styles.messageStatusRow}>
            <Text style={styles.timeRight}>{item.time}</Text>
            {renderStatusIcon(item.status)}
          </View>
        </View>
      );
    }

    return null;
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e?.endCoordinates?.height || 0);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

const currentRoomId = chatSelectedTrustedContact?.roomId;
const currentRoomPagination = chatContext?.pagination?.[currentRoomId] || {};
const isHistoryLoading = !!currentRoomPagination.loading;
const hasMoreHistory = currentRoomPagination.hasMore !== false;
const messageStatuses = chatContext?.messageStatuses || {};
const rawTypingInfo = chatContext?.typingIndicators?.[currentRoomId] || null;
const typingInfo = rawTypingInfo?.userId && rawTypingInfo.userId !== currentUserId ? rawTypingInfo : null;

if(typingInfo){
  typingInfo.userName = chatSelectedTrustedContact?.name || typingInfo.userName;
}

 
const currentRoomConversations = useMemo(
  () =>
    (chatContext?.conversations?.[currentRoomId] || []).map(message => ({
      ...message,
      isSelf:
        typeof message?.isSelf === 'boolean'
          ? message.isSelf
          : message?.senderId === currentUserId,
    })),
  [chatContext?.conversations, currentRoomId, currentUserId],
);

const chatItems = useMemo(
  () => buildConversationItems(currentRoomConversations, chatSelectedTrustedContact, messageStatuses),
  [currentRoomConversations, chatSelectedTrustedContact, messageStatuses],
);

const handleScroll = useCallback(event => {
  const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
  const threshold = 80;
  const nearBottom =
    layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;

  setIsNearBottom(nearBottom);
  if (nearBottom) {
    setShowScrollToBottom(false);
  }
}, []);

const scrollToBottom = useCallback(() => {
  flatListRef.current?.scrollToEnd({ animated: true });
  setShowScrollToBottom(false);
}, []);

const renderNoConversation = useCallback(() => {
  const contactName = chatSelectedTrustedContact?.name || 'this contact';

  return (
    <View style={styles.emptyStateWrapper}>
      <View style={styles.emptyStateIconCircle}>
        <Icon name="chat-bubble-outline" size={32} color="#8FA3C8" />
      </View>
      <Text style={styles.emptyStateTitle}>No conversations yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start a conversation with {contactName}. Your messages will appear here.
      </Text>
    </View>
  );
}, [chatSelectedTrustedContact?.name]);

useEffect(() => {
  if (!currentRoomConversations.length) return;

  const lastMessage = currentRoomConversations[currentRoomConversations.length - 1];
  const lastMessageKey =
    lastMessage?.id || `${getMessageTimestamp(lastMessage) || 'no-time'}-${lastMessage?.text || lastMessage?.message || ''}`;

  if (lastMessageKey === lastSeenMessageKeyRef.current) {
    return;
  }

  const isIncomingMessage = !lastMessage?.isSelf;
  if (isIncomingMessage && !isNearBottom) {
    setShowScrollToBottom(true);
  }

  if (isNearBottom) {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }

  lastSeenMessageKeyRef.current = lastMessageKey;
}, [currentRoomConversations, isNearBottom]);

useEffect(() => {
  setShowScrollToBottom(false);
  setIsNearBottom(true);
  lastSeenMessageKeyRef.current = null;
}, [currentRoomId]);

useEffect(() => {
  if (!currentRoomId) return;
  chatContext.loadMessages(currentRoomId, 1, 20).catch(() => {});
}, [currentRoomId]);

useFocusEffect(
  useCallback(() => {
    if (!currentRoomId || !currentRoomConversations?.length) return;

    // Find unread incoming messages (not from current user, status not 'read')
    const unreadMessages = currentRoomConversations.filter(msg => {
      const isIncoming = !msg.isSelf;
      const isUnread = messageStatuses[msg?.id] !== 'read';
      return isIncoming && isUnread;
    });

    if (unreadMessages.length > 0) {
      // Group by sender and mark each sender's messages as read
      const messagesById = unreadMessages.map(m => m?.id).filter(Boolean);
      const senderId = unreadMessages[0]?.senderId || chatSelectedTrustedContact?.receipent_id;
      
      if (messagesById.length > 0 && senderId) {
        chatContext.markAsRead(messagesById, senderId).catch(() => {});
      }
    }
  }, [currentRoomId, currentRoomConversations, messageStatuses, currentUserId, chatContext]),
);

  const handleMessageSendingProcess = async () => {
    console.log('=====================================================');
    console.log('Selected trusted contact for chat:', chatSelectedTrustedContact);
    console.log('=====================================================');
    if (isSendingMessage) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage && !selectedMedia) return;

    try {
      setIsSendingMessage(true);
      await chatContext.sendMessage(
        chatSelectedTrustedContact?.roomId,
        chatSelectedTrustedContact?.receipent_id,
        trimmedMessage,
        selectedMedia
          ? {
              url: selectedMedia,
              mediaType: selectedMediaType || 'image',
            }
          : null,
      );
      setMessage('');
      setselectedMedia(null);
      setSelectedMediaType(null);
    } finally {
      setIsSendingMessage(false);
    }
   } 

  const handlePickFromGallery = () => {
    setShowActionMenu(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      },
      async response => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        const asset = response?.assets?.[0];
        const uri = asset?.uri;
        if (uri) {
          const mimeType = asset?.type || 'image/jpeg';
          const mediaCategory = mimeType.startsWith('video/')
            ? 'video'
            : mimeType.startsWith('audio/')
            ? 'audio'
            : mimeType.startsWith('image/')
            ? 'image'
            : 'document';
          setIsUploadingMedia(true);
          setUploadingLocalUri(uri);
          try {
            const uploads = await api.post('/chat/upload-media', { file: { uri, type: mimeType, name: asset?.fileName || 'media' } });
            const rawUrl = uploads?.data?.data?.url;
            if (rawUrl) {
              const baseUrl = getAppUrl();
              const mediaUrl = rawUrl.includes('http://localhost:4000')
                ? rawUrl.replace('http://localhost:4000', baseUrl)
                : rawUrl;
              setselectedMedia(mediaUrl);
              setSelectedMediaType(mediaCategory);
            }
          } catch {
            Alert.alert('Upload failed', 'Could not upload the media. Please try again.');
          } finally {
            setIsUploadingMedia(false);
            setUploadingLocalUri(null);
          }
        }
      },
    );
  };

  const handleCaptureFromCamera = () => {
    setShowActionMenu(false);
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      },
      async response => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        const asset = response?.assets?.[0];
        const uri = asset?.uri;
        if (uri) {
          const mimeType = asset?.type || 'image/jpeg';
          setIsUploadingMedia(true);
          setUploadingLocalUri(uri);
          try {
            const uploads = await api.post('/chat/upload-media', { file: { uri, type: mimeType, name: asset?.fileName || 'photo.jpg' } });
            const rawUrl = uploads?.data?.data?.url;
            if (rawUrl) {
              const baseUrl = getAppUrl();
              const mediaUrl = rawUrl.includes('http://localhost:4000')
                ? rawUrl.replace('http://localhost:4000', baseUrl)
                : rawUrl;
              setselectedMedia(mediaUrl);
              setSelectedMediaType('image');
            }
          } catch {
            Alert.alert('Upload failed', 'Could not upload the image. Please try again.');
          } finally {
            setIsUploadingMedia(false);
            setUploadingLocalUri(null);
          }
        }
      },
    );
  };

  const handleRefresh = useCallback(async () => {
    if (!currentRoomId || isHistoryLoading || !hasMoreHistory) {
      return;
    }

    setRefreshing(true);
    try {
      const nextPage = (currentRoomPagination.page || 1) + 1;
      await chatContext.loadMessages(currentRoomId, nextPage, currentRoomPagination.limit || 20);
    } finally {
      setRefreshing(false);
    }
  }, [currentRoomId, isHistoryLoading, hasMoreHistory, currentRoomPagination.page, currentRoomPagination.limit]);

  const handleShareCurrentLocation = async () => {
    setShowActionMenu(false);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Allow app to access your current location?',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Location permission is required.');
          return;
        }
      }

      const geolocation = global?.navigator?.geolocation;
      if (!geolocation) {
        Alert.alert('Unavailable', 'Geolocation service is not available in this build.');
        return;
      }

      geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          setMessage(locationUrl);
        },
        error => {
          Alert.alert('Location error', error?.message || 'Failed to get location.');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error) {
      Alert.alert('Location error', 'Unable to access location right now.');
    }
  };

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
      <FlatList
        ref={flatListRef}
        data={chatItems}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        showsVerticalScrollIndicator={false}
        style={styles.chatScroll}
        contentContainerStyle={[
          styles.chatContent,
          chatItems.length === 0 && styles.chatContentEmpty,
        ]}
        ListEmptyComponent={renderNoConversation}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2ED573"
            colors={['#2ED573']}
          />
        }
      />

      {showScrollToBottom && (
        <TouchableOpacity style={styles.scrollToBottomBtn} onPress={scrollToBottom} activeOpacity={0.85}>
          <Icon name="keyboard-arrow-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* INPUT BAR */}

      {typingInfo && (
        <View style={styles.typingIndicatorRow}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDotOne]} />
            <View style={[styles.typingDot, styles.typingDotTwo]} />
            <View style={[styles.typingDot, styles.typingDotThree]} />
          </View>
          <Text style={styles.typingIndicatorText}>
            {typingInfo?.userName || 'Someone'} is typing...
          </Text>
        </View>
      )}

      {(isUploadingMedia || selectedMedia) && (
        <View style={styles.previewWrapper}>
          <View style={styles.previewImageContainer}>
            <Image
              source={{ uri: uploadingLocalUri || selectedMedia }}
              style={styles.previewImage}
            />
            {isUploadingMedia && (
              <View style={styles.previewImageOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.previewMetaContainer}>
            <Text style={styles.previewTitle}>
              {isUploadingMedia ? 'Uploading...' : 'Ready to send image'}
            </Text>
            <Text style={styles.previewSubtitle}>
              {isUploadingMedia ? 'Please wait' : 'Tap send to share'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.previewRemoveBtn}
            onPress={() => {
              setselectedMedia(null);
              setSelectedMediaType(null);
              setIsUploadingMedia(false);
              setUploadingLocalUri(null);
            }}
            activeOpacity={0.8}
          >
            <Icon name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          Platform.OS === 'android' && keyboardHeight > 0
            ? { marginBottom: 10 }
            : null,
        ]}
      >
        <TouchableOpacity style={styles.micBtn} onPress={() => setShowActionMenu(true)}>
          <Icon name="add" size={22} color="#6B7C99" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#6B7C99"
          value={message}
          onChangeText={text => {
            setMessage(text);
            if (currentRoomId) {
              chatContext.sendTyping(currentRoomId);
            }
          }}
        />

     

        <TouchableOpacity
          onPress={handleMessageSendingProcess}
          style={[styles.sendBtn, (isSendingMessage || isUploadingMedia) && styles.sendBtnDisabled]}
          disabled={isSendingMessage || isUploadingMedia}
        >
          {isSendingMessage ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showActionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionMenu(false)}
      >
        <Pressable
          style={styles.actionSheetOverlay}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={styles.actionSheetContainer}>
            <TouchableOpacity style={styles.actionItem} onPress={handlePickFromGallery}>
              <Icon name="photo-library" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleCaptureFromCamera}>
              <Icon name="photo-camera" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleShareCurrentLocation}>
              <Icon name="location-on" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Share Current Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.cancelActionItem]}
              onPress={() => setShowActionMenu(false)}
            >
              <Icon name="close" size={20} color="#FF6B6B" />
              <Text style={styles.cancelActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
