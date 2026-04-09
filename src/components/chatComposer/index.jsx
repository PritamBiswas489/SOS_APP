import React, { useCallback, useState, useEffect, useRef, use } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Keyboard,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick, types, isCancel } from '@react-native-documents/picker';
import Geolocation from '@react-native-community/geolocation';
import ChatActionSheet from '../chatActionSheet';
import { useChatActions, useChatTyping } from '../../context/ChatContext';
import api from '../../config/authApiFormData.config';
import { getAppUrl } from '../../config/utility';
import styles from './style';
import { selectedReplyMessageActions } from '../../store/redux/selectedReplyMessage.redux';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;
const TYPING_DEBOUNCE_MS = 1000;

const getMediaSizeLimit = mediaCategory =>
  mediaCategory === 'video' ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

const formatMegabytes = bytes => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const ChatComposer = ({
  onSendComplete,
  placeholder = 'Type a message...',
  showTypingIndicator = true,
}) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadingLocalUri, setUploadingLocalUri] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const typingDebounceRef = useRef(null);

  const chatSelectedTrustedContact = useSelector(state => state.chatSelectedTrustedContact);
  const userData = useSelector(state => state.userProviderData);
  const selectedReplyMessage = useSelector(state => state.selectedReplyMessage);
  const chatActions = useChatActions();
  const typingIndicators = useChatTyping();
  const currentUserId = userData?.id;
  const currentRoomId = chatSelectedTrustedContact?.roomId;
  const dispatch = useDispatch();

  const rawTypingInfo = typingIndicators?.[currentRoomId] || null;
  const typingInfo = rawTypingInfo?.userId && rawTypingInfo.userId !== currentUserId ? rawTypingInfo : null;
  if (typingInfo) {
    typingInfo.userName = chatSelectedTrustedContact?.name || typingInfo.userName;
  }

   

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

  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
        typingDebounceRef.current = null;
      }
    };
  }, [currentRoomId]);

  const openActionMenu = useCallback(() => setShowActionMenu(true), []);
  const closeActionMenu = useCallback(() => setShowActionMenu(false), []);

  const handleMessageChange = useCallback(
    text => {
      setMessage(text);
      if (!currentRoomId || !text.trim()) {
        return;
      }

      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }

      typingDebounceRef.current = setTimeout(() => {
        console.log(`Emitting typing event for room ${currentRoomId}`);
        chatActions.sendTyping(currentRoomId);
      }, TYPING_DEBOUNCE_MS);
    },
    [currentRoomId, chatActions],
  );

  const handleRemovePreview = useCallback(() => {
    setSelectedMedia(null);
    setSelectedMediaType(null);
    setIsUploadingMedia(false);
    setUploadingLocalUri(null);
  }, []);

  const handleSendMessage = useCallback(async () => {
    
    if (isSendingMessage) return;
    const trimmedMessage = message.trim();
    if (!trimmedMessage && !selectedMedia) return;
    try {
      setIsSendingMessage(true);
      await chatActions.sendMessage(
        chatSelectedTrustedContact?.roomId,
        chatSelectedTrustedContact?.receipent_id,
        trimmedMessage,
        selectedMedia ? { url: selectedMedia, mediaType: selectedMediaType || 'image' } : null,
        null,
        selectedReplyMessage?.id || null,
      );
      setMessage('');
      setSelectedMedia(null);
      setSelectedMediaType(null);
      setUploadingLocalUri(null);
      if (onSendComplete) {
        onSendComplete();
      }
    } finally {
      setIsSendingMessage(false);
    }
  }, [
    isSendingMessage,
    message,
    selectedMedia,
    selectedMediaType,
    chatActions,
    chatSelectedTrustedContact,
    onSendComplete,
    selectedReplyMessage,
  ]);

  const handlePickFromGallery = useCallback((type) => {
    closeActionMenu();
    launchImageLibrary(
      { mediaType: type, selectionLimit: 1, quality: 0.8 },
      async response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response?.assets?.[0];
        const uri = asset?.uri;
        if (!uri) return;
        const mimeType = asset?.type || 'image/jpeg';
        const mediaCategory = mimeType.startsWith('video/')
          ? 'video'
          : mimeType.startsWith('audio/')
          ? 'audio'
          : mimeType.startsWith('image/')
          ? 'image'
          : 'document';
        const fileSize = Number(asset?.fileSize || 0);
        const maxAllowedSize = getMediaSizeLimit(mediaCategory);
        if (fileSize > 0 && fileSize > maxAllowedSize) {
          Alert.alert(
            'File too large',
            `${mediaCategory === 'video' ? 'Video' : 'Image'} exceeds ${formatMegabytes(maxAllowedSize)}. Please choose a smaller file.`,
          );
          return;
        }
        setSelectedMediaType(mediaCategory);
        setIsUploadingMedia(true);
        setUploadingLocalUri(uri);
        try {
          const uploads = await api.post('/chat/upload-media', {
            file: { uri, type: mimeType, name: asset?.fileName || 'media' },
          });
          const rawUrl = uploads?.data?.data?.url;
          if (rawUrl) {
            const baseUrl = getAppUrl();
            const mediaUrl = rawUrl.includes('http://localhost:4000')
              ? rawUrl.replace('http://localhost:4000', baseUrl)
              : rawUrl;
            setSelectedMedia(mediaUrl);
            setSelectedMediaType(mediaCategory);
          }
        } catch {
          Alert.alert('Upload failed', 'Could not upload the media. Please try again.');
        } finally {
          setIsUploadingMedia(false);
          setUploadingLocalUri(null);
        }
      },
    );
  }, [closeActionMenu]);

  const handlePickAudio = useCallback(async () => {
    closeActionMenu();
    try {
      const [file] = await pick({ type: [types.audio] });
      const uri = file?.uri;
      if (!uri) return;
      const mimeType = file?.type || 'audio/mpeg';
      const fileSize = Number(file?.size || 0);
      if (fileSize > 0 && fileSize > MAX_AUDIO_SIZE_BYTES) {
        Alert.alert(
          'File too large',
          `Audio exceeds ${formatMegabytes(MAX_AUDIO_SIZE_BYTES)}. Please choose a smaller file.`,
        );
        return;
      }
      setSelectedMediaType('audio');
      setIsUploadingMedia(true);
      setUploadingLocalUri(uri);
      try {
        const uploads = await api.post('/chat/upload-media', {
          file: { uri, type: mimeType, name: file?.name || 'audio' },
        });
        const rawUrl = uploads?.data?.data?.url;
        if (rawUrl) {
          const baseUrl = getAppUrl();
          const mediaUrl = rawUrl.includes('http://localhost:4000')
            ? rawUrl.replace('http://localhost:4000', baseUrl)
            : rawUrl;
          setSelectedMedia(mediaUrl);
          setSelectedMediaType('audio');
        }
      } catch {
        Alert.alert('Upload failed', 'Could not upload the audio. Please try again.');
      } finally {
        setIsUploadingMedia(false);
        setUploadingLocalUri(null);
      }
    } catch (err) {
      if (!isCancel(err)) {
        Alert.alert('Error', 'Could not open audio picker. Please try again.');
      }
    }
  }, [closeActionMenu]);

  const handlePickDocument = useCallback(async () => {
    closeActionMenu();
    try {
      const [file] = await pick({ type: [types.allFiles] });
      const uri = file?.uri;
      if (!uri) return;

      const mimeType = file?.type || 'application/octet-stream';
      const fileSize = Number(file?.size || 0);
      if (fileSize > 0 && fileSize > MAX_DOCUMENT_SIZE_BYTES) {
        Alert.alert(
          'File too large',
          `Document exceeds ${formatMegabytes(MAX_DOCUMENT_SIZE_BYTES)}. Please choose a smaller file.`,
        );
        return;
      }

      setSelectedMediaType('document');
      setIsUploadingMedia(true);
      setUploadingLocalUri(uri);
      try {
        const uploads = await api.post('/chat/upload-media', {
          file: { uri, type: mimeType, name: file?.name || 'document' },
        });
        const rawUrl = uploads?.data?.data?.url;
        if (rawUrl) {
          const baseUrl = getAppUrl();
          const mediaUrl = rawUrl.includes('http://localhost:4000')
            ? rawUrl.replace('http://localhost:4000', baseUrl)
            : rawUrl;
          setSelectedMedia(mediaUrl);
          setSelectedMediaType('document');
        }
      } catch {
        Alert.alert('Upload failed', 'Could not upload the document. Please try again.');
      } finally {
        setIsUploadingMedia(false);
        setUploadingLocalUri(null);
      }
    } catch (err) {
      if (!isCancel(err)) {
        Alert.alert('Error', 'Could not open document picker. Please try again.');
      }
    }
  }, [closeActionMenu]);

  const handleCaptureFromCamera = useCallback(() => {
    closeActionMenu();
    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: true },
      async response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response?.assets?.[0];
        const uri = asset?.uri;
        if (!uri) return;
        const mimeType = asset?.type || 'image/jpeg';
        const fileSize = Number(asset?.fileSize || 0);
        if (fileSize > 0 && fileSize > MAX_IMAGE_SIZE_BYTES) {
          Alert.alert(
            'File too large',
            `Image exceeds ${formatMegabytes(MAX_IMAGE_SIZE_BYTES)}. Please capture a smaller image.`,
          );
          return;
        }
        setIsUploadingMedia(true);
        setUploadingLocalUri(uri);
        try {
          const uploads = await api.post('/chat/upload-media', {
            file: { uri, type: mimeType, name: asset?.fileName || 'photo.jpg' },
          });
          const rawUrl = uploads?.data?.data?.url;
          if (rawUrl) {
            const baseUrl = getAppUrl();
            const mediaUrl = rawUrl.includes('http://localhost:4000')
              ? rawUrl.replace('http://localhost:4000', baseUrl)
              : rawUrl;
            setSelectedMedia(mediaUrl);
            setSelectedMediaType('image');
          }
        } catch {
          Alert.alert('Upload failed', 'Could not upload the image. Please try again.');
        } finally {
          setIsUploadingMedia(false);
          setUploadingLocalUri(null);
        }
      },
    );
  }, [closeActionMenu]);

  const handleShareCurrentLocation = useCallback(async () => {
    closeActionMenu();
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        const hasPermission =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;
        if (!hasPermission) {
          Alert.alert('Permission denied', 'Location permission is required.');
          return;
        }
      }

      if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization();
      }

      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      if (!latitude || !longitude) {
        Alert.alert('Location error', 'Could not fetch location. Please try again.');
        return;
      }

      await chatActions.sendMessage(
        chatSelectedTrustedContact?.roomId,
        chatSelectedTrustedContact?.receipent_id,
        '',
        null,
        { latitude, longitude },
      );
    } catch (error) {
      const msg =
        error?.code === 1 ? 'Location permission was denied.' :
        error?.code === 2 ? 'Location unavailable. Please enable GPS.' :
        error?.code === 3 ? 'Location request timed out. Try again.' :
        error?.message || 'Unable to fetch location';
      Alert.alert('Location Error', msg);
    }
  }, [closeActionMenu, chatActions, chatSelectedTrustedContact]);

  return (
    <>
      {showTypingIndicator && typingInfo && (
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
            {selectedMediaType === 'video' ? (
              <View style={styles.previewImage}>
                <Icon name="videocam" size={28} color="#FFFFFF" />
              </View>
            ) : selectedMediaType === 'audio' ? (
              <View style={styles.previewImage}>
                <Icon name="headset" size={28} color="#FFFFFF" />
              </View>
            ) : selectedMediaType === 'document' ? (
              <View style={styles.previewImage}>
                <Icon name="description" size={28} color="#FFFFFF" />
              </View>
            ) : (
              <Image
                source={{ uri: uploadingLocalUri || selectedMedia }}
                style={styles.previewImage}
              />
            )}
            {isUploadingMedia && (
              <View style={styles.previewImageOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.previewMetaContainer}>
            <Text style={styles.previewTitle}>
              {isUploadingMedia
                ? 'Uploading...'
                : selectedMediaType === 'video'
                ? 'Ready to send video'
                : selectedMediaType === 'audio'
                ? 'Ready to send audio'
                : selectedMediaType === 'document'
                ? 'Ready to send document'
                : 'Ready to send image'}
            </Text>
            <Text style={styles.previewSubtitle}>
              {isUploadingMedia
                ? 'Please wait'
                : selectedMediaType === 'video'
                ? 'Tap send to share video'
                : selectedMediaType === 'audio'
                ? 'Tap send to share audio'
                : selectedMediaType === 'document'
                ? 'Tap send to share document'
                : 'Tap send to share'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.previewRemoveBtn}
            onPress={handleRemovePreview}
            activeOpacity={0.8}
          >
            <Icon name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          Platform.OS === 'android' && keyboardHeight > 0 ? { marginBottom: 10 } : null,
        ]}
      >
        <View style={styles.inputField}>
          <TouchableOpacity style={styles.micBtn} onPress={openActionMenu}>
            <Icon name="add" size={22} color="#6B7C99" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#6B7C99"
            value={message}
            onChangeText={handleMessageChange}
            multiline
            textAlignVertical="top"
            scrollEnabled
          />

          <TouchableOpacity
            onPress={handleSendMessage}
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
      </View>

      <ChatActionSheet
        visible={showActionMenu}
        onClose={closeActionMenu}
        onPickFromGallery={handlePickFromGallery}
        onPickAudio={handlePickAudio}
        onPickDocument={handlePickDocument}
        onCaptureFromCamera={handleCaptureFromCamera}
        onShareCurrentLocation={handleShareCurrentLocation}
      />
    </>
  );
};

export default React.memo(ChatComposer);
