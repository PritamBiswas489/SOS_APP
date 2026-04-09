import React, { useMemo } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChatComposer from '../chatComposer';
import styles from './style';

const getReplyPreview = item => {
  if (!item) {
    return {
      icon: 'reply',
      title: 'Reply message',
      text: '',
    };
  }

  if (item.text) {
    return {
      icon: 'chat-bubble-outline',
      title: 'Selected message',
      text: item.text,
    };
  }

  if (item.locationJson) {
    return {
      icon: 'location-on',
      title: 'Selected location',
      text: 'Current location shared',
    };
  }

  if (item.mediaType === 'image') {
    return {
      icon: 'image',
      title: 'Selected image',
      text: 'Replying to an image',
    };
  }

  if (item.mediaType === 'video') {
    return {
      icon: 'videocam',
      title: 'Selected video',
      text: 'Replying to a video',
    };
  }

  if (item.mediaType === 'audio') {
    return {
      icon: 'headset',
      title: 'Selected audio',
      text: 'Replying to an audio message',
    };
  }

  if (item.mediaType === 'document') {
    return {
      icon: 'description',
      title: 'Selected document',
      text: 'Replying to a document',
    };
  }

  return {
    icon: 'reply',
    title: 'Selected message',
    text: 'Replying to this message',
  };
};

const ReplyMessageModal = ({ visible, item, onClose }) => {
  const preview = useMemo(() => getReplyPreview(item), [item]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Reply message</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.previewBox}>
            <View style={styles.previewBadge}>
              <Icon name={preview.icon} size={18} color="#D7E3FF" />
            </View>

            <View style={styles.previewTextBlock}>
              <Text style={styles.previewTitle}>{preview.title}</Text>
              <Text style={styles.previewText} numberOfLines={4}>
                {preview.text}
              </Text>
            </View>
          </View>

          <View style={styles.composerWrap}>
            <ChatComposer
              onSendComplete={onClose}
              placeholder="Type your reply..."
              showTypingIndicator={false}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ReplyMessageModal);