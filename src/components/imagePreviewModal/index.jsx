import React from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';

const ImagePreviewModal = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Image</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.errorBox}>
              <Icon name="error-outline" size={28} color="#FFFFFF" />
              <Text style={styles.errorText}>Unable to preview this image.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(ImagePreviewModal);
