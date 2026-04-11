import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Linking,
  Modal,
  PanResponder,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  DeviceEventEmitter,
} from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePreviewModal from '../imagePreviewModal';
import VideoPlayerModal from '../videoPlayerModal';
import AudioPlayerModal from '../audioPlayerModal';
import ForwardMessageModal from '../forwardMessageModal';
import ReplyMessageModal from '../replyMessageModal';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useChatActions, useChatMessages } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import useToast from '../../hook/useToast';
import { selectedReplyMessageActions } from '../../store/redux/selectedReplyMessage.redux';

 
 
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

const truncateByWordLimit = (value, wordLimit = 12) => {
  if (!value || typeof value !== 'string') return '';
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= wordLimit) return words.join(' ');
  return `${words.slice(0, wordLimit).join(' ')}...`;
};

const getReplyPreviewContent = replyMessage => {
  if (!replyMessage) return null;

  if (typeof replyMessage === 'string') {
    return {
      title: 'Reply to message',
      text: truncateByWordLimit(replyMessage),
    };
  }

  const replyText = replyMessage?.text || replyMessage?.message;
  if (replyText) {
    return {
      title: 'Reply to message',
      text: truncateByWordLimit(replyText),
    };
  }

  const replyMediaType = replyMessage?.mediaType || replyMessage?.media_type;
  if (replyMediaType === 'image') {
    return { title: 'Reply to image', text: 'Image attachment' };
  }
  if (replyMediaType === 'video') {
    return { title: 'Reply to video', text: 'Video attachment' };
  }
  if (replyMediaType === 'audio') {
    return { title: 'Reply to audio', text: 'Audio attachment' };
  }
  if (replyMediaType === 'document') {
    return { title: 'Reply to document', text: 'Document attachment' };
  }

  if (replyMessage?.locationJson || replyMessage?.location_json) {
    return { title: 'Reply to location', text: 'Shared location' };
  }

  return { title: 'Reply to message', text: 'Message' };
};

const getReplyTargetId = message => {
  const replyObject = message?.reply_to_message;

  const targetId =
    replyObject?.id ??
    message?.reply_to_message_id ??
    message?.replyToId ??
    message?.reply_to_id ??
    (typeof message?.replyTo === 'string' || typeof message?.replyTo === 'number'
      ? message.replyTo
      : message?.replyTo?.id);

  if (targetId === null || targetId === undefined) return null;
  return String(targetId);
};

const buildConversationItems = (messages, selectedContact, statuses = {}, styles) => {
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
    const computedMessageId =
      message?.id ?? `${getMessageTimestamp(message) || 'no-time'}-${message?.text || message?.message || 'msg'}`;
    const replyToMessage = message?.reply_to_message || null;
    const replyTargetId = getReplyTargetId(message);

    if (dateKey !== lastDateKey) {
      items.push({
        id: `date-${dateKey}`,
        type: 'day',
        text: formatDateSeparator(timestamp),
      });
      lastDateKey = dateKey;
    }

    items.push({
      id: String(computedMessageId),
      type: message?.isSelf ? 'right' : 'left',
      locationJson: message?.locationJson || null,
      text: message?.text || message?.message || '',
      mediaUrl: message?.mediaUrl || message?.media_url || null,
      mediaType: message?.mediaType || message?.media_type || null,
      replyTo: message?.replyTo || null,
      replyTargetId,
      time: formatMessageTime(timestamp),
      status: statuses[message?.id] || message?.status || null,
      reply_to_message: replyToMessage,
      avatarStyle: message?.isSelf ? undefined : styles.avatarSmallBlue,
      avatarText: message?.isSelf
        ? 'Y'
        : (selectedContact?.initial || selectedContact?.name?.charAt(0) || 'U'),
    });
  });

  return items;
};

const parseMessageLocation = locationJson => {
  if (!locationJson) return null;

  let parsedLocation = locationJson;
  if (typeof locationJson === 'string') {
    try {
      parsedLocation = JSON.parse(locationJson);
    } catch {
      return null;
    }
  }

  const latitude = Number(parsedLocation?.latitude ?? parsedLocation?.lat);
  const longitude = Number(
    parsedLocation?.longitude ?? parsedLocation?.lng ?? parsedLocation?.lon,
  );

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
};

const renderStatusIcon = status => {
  if (!status) return null;

  if (status === 'read') {
    return <Icon name="done-all" size={14} color="#2ED573" style={{ marginLeft: 4 }} />;
  }
  if (status === 'delivered') {
    return <Icon name="done-all" size={14} color="#8FA3C8" style={{ marginLeft: 4 }} />;
  }
  if (status === 'sent') {
    return <Icon name="done" size={14} color="#8FA3C8" style={{ marginLeft: 4 }} />;
  }
  return null;
};

const renderMessageActionButton = (styles, iconName, onPress) => {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={styles.messageActionButton}
    >
      <Icon name={iconName} size={14} color="#D7E3FF" />
    </TouchableOpacity>
  );
};

const renderMessageActionButtonSecondary = (styles, iconName, onPress) => {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.messageActionButton, styles.messageActionButtonSecondary]}
    >
      <Icon name={iconName} size={14} color="#D7E3FF" />
    </TouchableOpacity>
  );
};

const ReplySwipeWrapper = React.memo(({
  children,
  item,
  onSwipeReply,
  enabled = true,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const resetPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
      speed: 16,
    }).start();
  }, [translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!enabled) return false;
          const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          return isHorizontal && gestureState.dx > 6;
        },
        onPanResponderMove: (_, gestureState) => {
          if (!enabled) return;
          const dx = Math.max(0, Math.min(gestureState.dx, 90));
          translateX.setValue(dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (enabled && gestureState.dx > 62) {
            onSwipeReply?.(item);
          }
          resetPosition();
        },
        onPanResponderTerminate: () => {
          resetPosition();
        },
      }),
    [enabled, item, onSwipeReply, resetPosition, translateX],
  );

  return (
    <Animated.View
      style={{ transform: [{ translateX }] }}
      {...(enabled ? panResponder.panHandlers : {})}
    >
      {children}
    </Animated.View>
  );
});

const ConversationList = ({
  styles,
}) => {
  const flatListRef = useRef(null);
  const loadedRoomIdsRef = useRef(new Set());
  const shouldScrollAfterLoadRef = useRef(false);
  const pendingAutoScrollPassesRef = useRef(0);
  const wasConnectedRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const lastSeenMessageKeyRef = useRef(null);
  const lastBannerEventKeyRef = useRef('');
  const lastReadBatchKeyRef = useRef('');
  const didInitialRoomScrollRef = useRef(false);
  const dispatch = useDispatch();
  const replyingItem = useSelector(state => state.selectedReplyMessage);
//   console.log("replyingItem", replyingItem);

  const [forwardingItem, setForwardingItem] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
   

  const { loadMessages, markAsRead, sendMessage:sendMessageToRecipent } = useChatActions();
    const { isConnected } = useSocket();
  const { showSuccess, showError } = useToast();
  const { conversations, pagination, messageStatuses } = useChatMessages();
  const chatSelectedTrustedContact = useSelector(state => state.chatSelectedTrustedContact);
  const userData = useSelector(state => state.userProviderData);
  const selectedContact = chatSelectedTrustedContact;
  const currentUserId = userData?.id;
  const currentRoomId = selectedContact?.roomId;
  const currentRoomPagination = pagination?.[currentRoomId] || {};
  const isHistoryLoading = !!currentRoomPagination.loading;
  const hasMoreHistory = currentRoomPagination.hasMore !== false;


  const currentRoomConversations = useMemo(
    () =>
      (conversations?.[currentRoomId] || []).map(message => ({
        ...message,
        isSelf:
          typeof message?.isSelf === 'boolean'
            ? message.isSelf
            : message?.senderId === currentUserId,
      })),
    [conversations, currentRoomId, currentUserId],
  );

  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState('');
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [activeAudioUrl, setActiveAudioUrl] = useState('');
  const [isAudioModalVisible, setIsAudioModalVisible] = useState(false);

  const handleOpenImageModal = useCallback(imageUrl => {
    if (!imageUrl) return;
    setActiveImageUrl(imageUrl);
    setIsImageModalVisible(true);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setIsImageModalVisible(false);
    setActiveImageUrl('');
  }, []);

  const handleOpenVideoModal = useCallback(videoUrl => {
    if (!videoUrl) return;
    setActiveVideoUrl(videoUrl);
    setIsVideoModalVisible(true);
  }, []);

  const handleCloseVideoModal = useCallback(() => {
    setIsVideoModalVisible(false);
    setActiveVideoUrl('');
  }, []);

  const handleOpenAudioModal = useCallback(audioUrl => {
    if (!audioUrl) return;
    setActiveAudioUrl(audioUrl);
    setIsAudioModalVisible(true);
  }, []);

  const handleCloseAudioModal = useCallback(() => {
    setIsAudioModalVisible(false);
    setActiveAudioUrl('');
  }, []);

  const handleOpenDocument = useCallback(async documentUrl => {
    if (!documentUrl) return;

    try {
      let finalUrl = documentUrl.trim();

      if (!finalUrl.match(/^[a-zA-Z][a-zA-Z\d+\-.]*:/)) {
        if (finalUrl.startsWith('//')) {
          finalUrl = 'https:' + finalUrl;
        } else if (finalUrl.startsWith('/')) {
          finalUrl = 'https:' + finalUrl;
        } else {
          finalUrl = 'https://' + finalUrl;
        }
      }

      // Request Android storage permission for API < 29
      if (Platform.OS === 'android' && Platform.Version < 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Storage permission is required to download files.');
          return;
        }
      }

      const fileName = finalUrl.split('/').pop()?.split('?')[0] || `document_${Date.now()}`;
      const downloadDir =
        Platform.OS === 'ios'
          ? RNBlobUtil.fs.dirs.DocumentDir
          : RNBlobUtil.fs.dirs.DownloadDir;
      const filePath = `${downloadDir}/${fileName}`;

      showSuccess('Downloading', `Saving ${fileName}...`);

      await RNBlobUtil.config({
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Downloading document...',
          mime: 'application/octet-stream',
          mediaScannable: true,
          path: filePath,
        },
      }).fetch('GET', finalUrl);

      if (Platform.OS === 'ios') {
        await RNBlobUtil.ios.openDocument(filePath);
      } else {
        showSuccess('Download complete', `${fileName} saved to Downloads.`);
      }
    } catch {
      Alert.alert('Download error', 'Unable to download this document. Please try again.');
    }
  }, [showSuccess]);

  const forwardMessage = useCallback(async (contacts, item) => {
    //sendMessageToRecipent
       console.log('Forwarding message/item:', item);
       console.log('Forwarding to contacts:', contacts);

       if(contacts.length > 0){
         for(const contact of contacts){
            const roomId = contact.roomId;
            const recipientId = contact.receipent_id;
            const text = item.text;
            const media = item.mediaUrl ? { url: item.mediaUrl, mediaType: item.mediaType } : null;
            const location = item.locationJson ? item.locationJson : null;
            try {
                await sendMessageToRecipent(roomId, recipientId, text, media, location);
                showSuccess('Success', `Message forwarded to ${contact.name}`);
            } catch (error) {
                console.log(`Error forwarding message to ${contact.name} (ID: ${contact.id}):`, error);
                showError('Failed', `Failed to forward message to ${contact.name}`);
            }
         }
       }
  },[]);

  const handleOpenLocationInMaps = useCallback(async (latitude, longitude) => {
    const mapLabel = encodeURIComponent('Shared Location');
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${latitude},${longitude}&q=${mapLabel}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${mapLabel})`,
      default: `https://maps.google.com/?q=${latitude},${longitude}`,
    });

    if (!url) {
      Alert.alert('Map error', 'Unable to open map for this location.');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Map error', 'Unable to open map for this location.');
    }
  }, []);

  const handleReplyPress = useCallback(item => {
    dispatch(selectedReplyMessageActions.setSelectedReplyMessage(item));
  }, [dispatch]);

  const handleForwardPress = useCallback(item => {
    setForwardingItem(item);
  }, []);

  const handleForwardClose = useCallback(() => {
    setForwardingItem(null);
  }, []);

  const handleReplyClose = useCallback(() => {
    dispatch(selectedReplyMessageActions.resetState());
  }, [dispatch]);

  const handleMenuToggle = useCallback(item => {
    setMenuItem(item);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuItem(null);
  }, []);

  const chatItems = useMemo(
    () => buildConversationItems(currentRoomConversations, selectedContact, messageStatuses, styles),
    [currentRoomConversations, selectedContact, messageStatuses, styles],
  );

  const messageIndexById = useMemo(() => {
    const idToIndex = new Map();
    chatItems.forEach((chatItem, index) => {
      if (chatItem?.type !== 'day' && chatItem?.id) {
        idToIndex.set(String(chatItem.id), index);
      }
    });
    return idToIndex;
  }, [chatItems]);

   

  const isInitialConversationLoading =
    isHistoryLoading && currentRoomConversations.length === 0;
  const isLoadingOlderConversations =
    isHistoryLoading && currentRoomConversations.length > 0 && (currentRoomPagination.page || 1) > 1;

  const handleScroll = useCallback(event => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const threshold = 150;
    const nearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;

    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setShowScrollToBottom(false);
  }, []);

  const scrollToBottomImmediate = useCallback(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      });
    });
  }, []);

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
      const bannerEventKey = `${currentRoomId || 'unknown-room'}:${lastMessageKey}`;
      if (bannerEventKey !== lastBannerEventKeyRef.current) {
        lastBannerEventKeyRef.current = bannerEventKey;
        DeviceEventEmitter.emit('chat:new-message-banner', {
          title: selectedContact?.name || 'New Message',
          body: lastMessage?.text || lastMessage?.message || 'You have received a new message.',
        });
      }
    }

    if (isNearBottom) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }

    lastSeenMessageKeyRef.current = lastMessageKey;
  }, [currentRoomConversations, isNearBottom, selectedContact, currentRoomId]);

  

   useEffect(() => {
    if (!currentRoomId) return;
    const roomKey = String(currentRoomId);

    if (loadedRoomIdsRef.current.has(roomKey)) return; // ✅ use ref
    loadedRoomIdsRef.current.add(roomKey);              // ✅ use ref
    shouldScrollAfterLoadRef.current = true;
    pendingAutoScrollPassesRef.current = 2;
    didInitialRoomScrollRef.current = false;

    loadMessages(currentRoomId, 1, 50).catch(() => {});
  }, [currentRoomId, loadMessages]);

  useEffect(() => {
    if (!currentRoomId || isHistoryLoading || chatItems.length === 0) return;
    if (didInitialRoomScrollRef.current) return;

    scrollToBottomImmediate();
    didInitialRoomScrollRef.current = true;
    setShowScrollToBottom(false);
  }, [currentRoomId, isHistoryLoading, chatItems.length, scrollToBottomImmediate]);

 
const focusCallback = useCallback(() => {
  if (!currentRoomId || !currentRoomConversations?.length) return;

  const unreadMessages = currentRoomConversations.filter(msg => {
    const isIncoming = !msg.isSelf;
    const messageStatus = msg?.status || messageStatuses[msg?.id];
    const isUnread = messageStatus !== 'read';
    return isIncoming && isUnread;
  });

  if (unreadMessages.length > 0) {
    const messagesById = unreadMessages.map(m => m?.id).filter(Boolean).sort();
    const senderId = unreadMessages[0]?.senderId || selectedContact?.receipent_id;
    const unreadBatchKey = `${currentRoomId}:${senderId || 'unknown'}:${messagesById.join(',')}`;

    if (unreadBatchKey === lastReadBatchKeyRef.current) return;

    if (messagesById.length > 0 && senderId) {
      lastReadBatchKeyRef.current = unreadBatchKey;
      markAsRead(messagesById, senderId).catch(() => {});
    }
  } else {
    lastReadBatchKeyRef.current = '';
  }
}, [currentRoomId, currentRoomConversations, messageStatuses, selectedContact, markAsRead]);

 
useFocusEffect(focusCallback);

  const handleRefresh = useCallback(async () => {
    if (!currentRoomId || isHistoryLoading || !hasMoreHistory) {
      return;
    }

    setRefreshing(true);
    try {
      const nextPage = (currentRoomPagination.page || 1) + 1;
      await loadMessages(currentRoomId, nextPage, currentRoomPagination.limit || 50);
    } finally {
      setRefreshing(false);
    }
  }, [currentRoomId, isHistoryLoading, hasMoreHistory, currentRoomPagination.page, currentRoomPagination.limit, loadMessages]);

  useEffect(() => {
    const lastRoomMessage = currentRoomConversations[currentRoomConversations.length - 1];
    const baselineKey = lastRoomMessage
      ? (lastRoomMessage?.id || `${getMessageTimestamp(lastRoomMessage) || 'no-time'}-${lastRoomMessage?.text || lastRoomMessage?.message || ''}`)
      : null;

    lastSeenMessageKeyRef.current = baselineKey;
    lastBannerEventKeyRef.current = baselineKey
      ? `${currentRoomId || 'unknown-room'}:${baselineKey}`
      : '';

    setShowScrollToBottom(false);
    setIsNearBottom(true);
    didInitialRoomScrollRef.current = false;
  }, [currentRoomId]);

  const renderMediaContent = item => {
    if (!item.mediaUrl) return null;

    if (item.mediaType === 'image') {
      return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleOpenImageModal(item.mediaUrl)}>
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.mediaBubbleImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
    if (item.mediaType === 'video') {
      return (
        <TouchableOpacity
          style={styles.mediaBubbleVideo}
          activeOpacity={0.85}
          onPress={() => handleOpenVideoModal(item.mediaUrl)}
        >
          <View style={styles.mediaBubblePlayBtn}>
            <Icon name="play-arrow" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.mediaBubbleLabel}>Video</Text>
        </TouchableOpacity>
      );
    }
    if (item.mediaType === 'audio') {
      return (
        <TouchableOpacity
          style={styles.mediaBubbleAudio}
          activeOpacity={0.85}
          onPress={() => handleOpenAudioModal(item.mediaUrl)}
        >
          <Icon name="headset" size={22} color="#FFFFFF" />
          <Text style={styles.mediaBubbleLabel}>Audio message</Text>
        </TouchableOpacity>
      );
    }
    if (item.mediaType === 'document') {
      return (
        <TouchableOpacity
          style={styles.mediaBubbleDocument}
          activeOpacity={0.85}
          onPress={() => handleOpenDocument(item.mediaUrl)}
        >
          <Icon name="insert-drive-file" size={22} color="#FFFFFF" />
          <Text style={styles.mediaBubbleLabel}>Document</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const scrollToRepliedMessage = useCallback((replyTargetId) => {
    if (!replyTargetId) return;

    const targetIndex = messageIndexById.get(String(replyTargetId));
    if (targetIndex === undefined) {
      
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: targetIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [messageIndexById]);

  const renderReplyPreview = (item, isSelfMessage) => {
    const replyData = item?.reply_to_message || item?.replyTo;
    const targetId = item?.replyTargetId;
    const preview = getReplyPreviewContent(replyData);

    if (!preview) return null;

    const replyPreviewContent = (
      <View
        style={[
          styles.replyPreviewBox,
          isSelfMessage ? styles.replyPreviewBoxRight : styles.replyPreviewBoxLeft,
        ]}
      >
        <Text style={styles.replyPreviewTitle}>{preview.title}</Text>
        <Text style={styles.replyPreviewText} numberOfLines={2}>
          {preview.text}
        </Text>
      </View>
    );

    if (!targetId) {
      return replyPreviewContent;
    }

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => scrollToRepliedMessage(targetId)}
      >
        {replyPreviewContent}
      </TouchableOpacity>
    );
  };
  const renderLocationContent = (item, isSelfMessage) => {
    const location = parseMessageLocation(item?.locationJson);
    if (!location) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.locationMessageCard,
          isSelfMessage ? styles.locationMessageCardRight : styles.locationMessageCardLeft,
        ]}
        onPress={() => handleOpenLocationInMaps(location.latitude, location.longitude)}
      >
        <View style={styles.locationMessageHeader}>
          <View style={styles.locationPinBadge}>
            <Icon name="location-on" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.locationMessageHeaderTextBlock}>
            <Text style={styles.locationMessageTitle}>Current Location Shared</Text>
            <Text style={styles.locationMessageSubtitle}>Tap to open in Maps</Text>
          </View>
        </View>

        <View style={styles.locationCoordsRow}>
          <Text style={styles.locationCoordsLabel}>LAT</Text>
          <Text style={styles.locationCoordsValue}>{location.latitude.toFixed(5)}</Text>
          <Text style={[styles.locationCoordsLabel, styles.locationCoordsLabelSpacing]}>LNG</Text>
          <Text style={styles.locationCoordsValue}>{location.longitude.toFixed(5)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageActions = useCallback((item, isSelfMessage) => {
    const actionRowStyle = isSelfMessage
      ? styles.messageActionsRowRight
      : styles.messageActionsRowLeft;

    return (
      <View style={[styles.messageActionsRow, actionRowStyle]}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => handleMenuToggle(item)}
          style={styles.messageActionButton}
        >
          <Icon name="more-vert" size={16} color="#D7E3FF" />
        </TouchableOpacity>
      </View>
    );
  }, [handleMenuToggle, styles]);

  const renderChatItem = ({ item }) => {
    if (item.type === 'day') {
      return <Text style={styles.dayLabel}>{item.text}</Text>;
    }

    if (item.type === 'sos') {
      return (
        <View style={styles.sosContainer}>
          <View style={styles.sosCard}>
            <View style={styles.sosBadge}>
              <Text style={styles.sosBadgeText}>SOS TRIGGERED</Text>
            </View>

            <Text style={styles.sosMessage}>
              I need help! Sending my live location now.
            </Text>
          </View>
        </View>
      );
    } 

    if (item.type === 'left') {
      return (
        <ReplySwipeWrapper item={item} onSwipeReply={handleReplyPress} enabled={item.type === 'left'}>
          <View style={styles.bubbleLeftWrapper}>
            <View style={styles.messageRowLeft}>
              <View style={styles.bubbleLeft}>
                {renderReplyPreview(item, false)}
                {renderLocationContent(item, false)}
                {renderMediaContent(item)}
                {!!item.text && <Text style={styles.messageText}>{item.text}</Text>}
              </View>

              {renderMessageActions(item, false)}
            </View>

            <View style={styles.messageFooterLeft}>
              <View style={item.avatarStyle}>
                <Text style={styles.avatarSmallText}>{item.avatarText}</Text>
              </View>
              <Text style={styles.timeLeftInline}>{item.time}</Text>
            </View>
          </View>
        </ReplySwipeWrapper>
      );
    }

    if (item.type === 'right') {
      return (
        <ReplySwipeWrapper item={item} onSwipeReply={handleReplyPress} enabled={item.type === 'right'}>
          <View>
            <View style={styles.messageRowRight}>
              {renderMessageActions(item, true)}

              <View style={styles.bubbleRight}>
                {renderReplyPreview(item, true)}
                {renderLocationContent(item, true)}
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
        </ReplySwipeWrapper>
      );
    }

    return null;
  };

const handleReload = useCallback(() => {
    if (!currentRoomId) return;
    const roomKey = String(currentRoomId);
    loadedRoomIdsRef.current.delete(roomKey); // ✅ use ref
  shouldScrollAfterLoadRef.current = true;
    pendingAutoScrollPassesRef.current = 2;
    didInitialRoomScrollRef.current = false;
    loadMessages(currentRoomId, 1, 50).catch(() => {});
  }, [currentRoomId, loadMessages]);

  useEffect(() => {
    const reconnected = !wasConnectedRef.current && isConnected;

    if (reconnected && currentRoomId) {
      const roomKey = String(currentRoomId);
      loadedRoomIdsRef.current.delete(roomKey);
      shouldScrollAfterLoadRef.current = true;
      pendingAutoScrollPassesRef.current = 2;
      didInitialRoomScrollRef.current = false;
      loadMessages(currentRoomId, 1, 50).catch(() => {});
    }

    wasConnectedRef.current = isConnected;
  }, [isConnected, currentRoomId, loadMessages]);

  const renderNoConversation = () => {
    if (isInitialConversationLoading) {
      return (
        <View style={styles.historyLoaderScreen}>
          <View style={styles.historyLoaderCard}>
            <ActivityIndicator size="small" color="#2ED573" />
            <Text style={styles.historyLoaderTitle}>Loading conversation...</Text>
            <Text style={styles.historyLoaderSubtitle}>Fetching earlier messages for this chat.</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateWrapper}>
        <View style={styles.emptyStateIconCircle}>
          <Icon name="chat-bubble-outline" size={32} color="#8FA3C8" />
        </View>
        <Text style={styles.emptyStateTitle}>No conversations yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Start a conversation with {selectedContact?.name || 'this contact'}. Your messages will appear here.
        </Text>
        <TouchableOpacity
          onPress={handleReload}
          activeOpacity={0.8}
          style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: 'rgba(46,213,115,0.15)', borderWidth: 1, borderColor: '#2ED573' }}
        >
          <Icon name="refresh" size={16} color="#2ED573" />
          <Text style={{ color: '#2ED573', fontSize: 13 }}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOlderConversationLoader = () => {
    if (!isLoadingOlderConversations) {
      return null;
    }

    return (
      <View style={styles.historyLoaderInline}>
        <ActivityIndicator size="small" color="#2ED573" />
        <Text style={styles.historyLoaderInlineText}>Loading older messages...</Text>
      </View>
    );
  };

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={chatItems}
        keyExtractor={item => String(item.id)}
        renderItem={renderChatItem}
        showsVerticalScrollIndicator={false}
        style={styles.chatScroll}
        contentContainerStyle={[
          styles.chatContent,
          chatItems.length === 0 && styles.chatContentEmpty,
        ]}
        ListHeaderComponent={renderOlderConversationLoader}
        ListEmptyComponent={renderNoConversation}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onScroll={event => {
          if (menuItem !== null) handleMenuClose();
          handleScroll(event);
        }}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({
            offset: Math.max(0, info.averageItemLength * info.index),
            animated: true,
          });
        }}
        onContentSizeChange={() => {
          if (
            !shouldScrollAfterLoadRef.current ||
            chatItems.length === 0 ||
            isHistoryLoading
          ) {
            return;
          }

          requestAnimationFrame(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          });

          pendingAutoScrollPassesRef.current -= 1;
          if (pendingAutoScrollPassesRef.current <= 0) {
            shouldScrollAfterLoadRef.current = false;
            pendingAutoScrollPassesRef.current = 0;
          }
        }}
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

      <ImagePreviewModal
        visible={isImageModalVisible}
        imageUrl={activeImageUrl}
        onClose={handleCloseImageModal}
      />

      <VideoPlayerModal
        visible={isVideoModalVisible}
        videoUrl={activeVideoUrl}
        onClose={handleCloseVideoModal}
      />

      <AudioPlayerModal
        visible={isAudioModalVisible}
        audioUrl={activeAudioUrl}
        onClose={handleCloseAudioModal}
      />

      {showScrollToBottom && (
        <TouchableOpacity style={styles.scrollToBottomBtn} onPress={scrollToBottom} activeOpacity={0.85}>
          <Icon name="keyboard-arrow-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <ForwardMessageModal
        visible={forwardingItem !== null}
        item={forwardingItem}
        onClose={handleForwardClose}
        onSend={forwardMessage}
      />

      <ReplyMessageModal
        visible={replyingItem?.id ? true : false}
        item={replyingItem}
        onClose={handleReplyClose}
      />

      <Modal
        visible={menuItem !== null}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={handleMenuClose}>
          <View style={styles.messageActionModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.messageActionModalSheet}>
                <View style={styles.messageActionModalHandle} />

                <TouchableOpacity
                  activeOpacity={0.82}
                  style={styles.messageActionModalItem}
                  onPress={() => {
                    handleMenuClose();
                    handleReplyPress(menuItem);
                  }}
                >
                  <View style={styles.messageActionModalIconWrap}>
                    <Icon name="reply" size={18} color="#60A6FF" />
                  </View>
                  <Text style={styles.messageActionModalText}>Reply</Text>
                </TouchableOpacity>

                <View style={styles.messageActionModalDivider} />

                <TouchableOpacity
                  activeOpacity={0.82}
                  style={styles.messageActionModalItem}
                  onPress={() => {
                    handleMenuClose();
                    handleForwardPress(menuItem);
                  }}
                >
                  <View style={styles.messageActionModalIconWrap}>
                    <Icon name="forward" size={18} color="#60A6FF" />
                  </View>
                  <Text style={styles.messageActionModalText}>Forward</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.82}
                  style={[styles.messageActionModalItem, styles.messageActionModalCancelItem]}
                  onPress={handleMenuClose}
                >
                  <Text style={styles.messageActionModalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default React.memo(ConversationList);
