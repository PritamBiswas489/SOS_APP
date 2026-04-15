import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const isLikelyMediaUrl = value => {
  if (!value || typeof value !== 'string') return false;
  const normalizedValue = value.trim();
  if (!normalizedValue) return false;

  if (normalizedValue.startsWith('http://') || normalizedValue.startsWith('https://')) {
    return true;
  }

  if (normalizedValue.startsWith('file://') || normalizedValue.startsWith('content://')) {
    return true;
  }

  // Allow bare domains/paths because document handler can normalize these.
  return normalizedValue.includes('.') || normalizedValue.startsWith('/') || normalizedValue.startsWith('//');
};

const MessageMediaContent = ({
  item,
  styles,
  onOpenImageModal,
  onOpenVideoModal,
  onOpenAudioModal,
  onOpenDocument,
}) => {
  const [mediaErrorText, setMediaErrorText] = useState('');

  useEffect(() => {
    setMediaErrorText('');
  }, [item?.mediaUrl, item?.mediaType]);

  if (!item?.mediaUrl) return null;

  const showUnavailable = text => (
    <View
      style={[
        styles.mediaBubbleImage,
        {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#EEEEEE',
        },
      ]}
    >
      <Icon name="error-outline" size={28} color="#666666" />
      <Text style={{ color: '#666666', marginTop: 4, fontSize: 12 }}>{text}</Text>
    </View>
  );

  if (mediaErrorText) {
    return showUnavailable(mediaErrorText);
  }

  const openMedia = async (openHandler, fallbackText) => {
    try {
      const result = await openHandler?.(item.mediaUrl);
      if (result === false) {
        setMediaErrorText(fallbackText);
      }
    } catch {
      setMediaErrorText(fallbackText);
    }
  };

  if (item.mediaType === 'image') {
    if (!isLikelyMediaUrl(item.mediaUrl)) {
      return showUnavailable('Image not available');
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onOpenImageModal?.(item.mediaUrl)}
      >
        <Image
          source={{ uri: item.mediaUrl }}
          style={styles.mediaBubbleImage}
          resizeMode="cover"
          onError={() => setMediaErrorText('Image not available')}
        />
      </TouchableOpacity>
    );
  }

  if (item.mediaType === 'video') {
    if (!isLikelyMediaUrl(item.mediaUrl)) {
      return showUnavailable('Video not available');
    }

    return (
      <TouchableOpacity
        style={styles.mediaBubbleVideo}
        activeOpacity={0.85}
        onPress={() => openMedia(onOpenVideoModal, 'Video not available')}
      >
        <View style={styles.mediaBubblePlayBtn}>
          <Icon name="play-arrow" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.mediaBubbleLabel}>Video</Text>
      </TouchableOpacity>
    );
  }

  if (item.mediaType === 'audio') {
    if (!isLikelyMediaUrl(item.mediaUrl)) {
      return showUnavailable('Audio not available');
    }

    return (
      <TouchableOpacity
        style={styles.mediaBubbleAudio}
        activeOpacity={0.85}
        onPress={() => openMedia(onOpenAudioModal, 'Audio not available')}
      >
        <Icon name="headset" size={22} color="#FFFFFF" />
        <Text style={styles.mediaBubbleLabel}>Audio message</Text>
      </TouchableOpacity>
    );
  }

  if (item.mediaType === 'document') {
    if (!isLikelyMediaUrl(item.mediaUrl)) {
      return showUnavailable('Document not available');
    }

    return (
      <TouchableOpacity
        style={styles.mediaBubbleDocument}
        activeOpacity={0.85}
        onPress={() => openMedia(onOpenDocument, 'Document not available')}
      >
        <Icon name="insert-drive-file" size={22} color="#FFFFFF" />
        <Text style={styles.mediaBubbleLabel}>Document</Text>
      </TouchableOpacity>
    );
  }

  return null;
};

export default React.memo(MessageMediaContent);
